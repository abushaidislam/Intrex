import { db, client } from '@/lib/db/drizzle';
import {
  domains,
  sslCheckResults,
  notificationEvents,
  sslNotificationRecipients,
  type NotificationEvent,
} from '@/lib/db/schema';
import { eq, and, lte, gte, inArray, desc } from 'drizzle-orm';
import { sendPlatformEmail } from '@/lib/email/platform-email';

// SSL expiry notification thresholds (in days)
const SSL_EXPIRY_THRESHOLDS = [
  { days: 30, severity: 'low' as const },
  { days: 14, severity: 'medium' as const },
  { days: 7, severity: 'high' as const },
  { days: 1, severity: 'critical' as const },
];

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

export interface SSLExpiryNotification {
  domainId: string;
  hostname: string;
  daysRemaining: number;
  validTo: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tenantId: string;
}

/**
 * Check SSL results and create notification events for expiring certificates
 * This should be called after SSL scan completes
 */
export async function createSSLExpiryNotifications(): Promise<{
  created: number;
  notifications: SSLExpiryNotification[];
}> {
  const now = new Date();
  const notifications: SSLExpiryNotification[] = [];
  let created = 0;

  // Get recent SSL check results with warning or expired status
  const recentResults = await db
    .select({
      result: sslCheckResults,
      domain: domains,
    })
    .from(sslCheckResults)
    .innerJoin(domains, eq(sslCheckResults.domainId, domains.id))
    .where(
      and(
        inArray(sslCheckResults.checkStatus, ['warning', 'expired']),
        gte(sslCheckResults.checkedAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)) // Last 24 hours
      )
    )
    .orderBy(desc(sslCheckResults.checkedAt));

  // Group by domain (get most recent result per domain)
  const domainResults = new Map<string, typeof recentResults[0]>();
  for (const item of recentResults) {
    if (!domainResults.has(item.domain.id)) {
      domainResults.set(item.domain.id, item);
    }
  }

  for (const { result, domain } of domainResults.values()) {
    if (!result.daysRemaining || !result.validTo) continue;

    const daysRemaining = result.daysRemaining;
    const severity = determineSeverity(daysRemaining);

    // Check if notification already sent for this threshold
    const fingerprint = `ssl_expiry:${domain.id}:${severity}:${daysRemaining}`;
    
    const existingNotification = await db
      .select()
      .from(notificationEvents)
      .where(
        and(
          eq(notificationEvents.fingerprint, fingerprint),
          gte(notificationEvents.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        )
      )
      .limit(1);

    if (existingNotification.length > 0) {
      continue; // Already notified for this threshold
    }

    // Create notification event
    const scheduledFor = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    
    await db.insert(notificationEvents).values({
      tenantId: domain.tenantId,
      eventType: 'ssl_expiry',
      entityType: 'domain',
      entityId: domain.id,
      fingerprint,
      payloadJson: JSON.stringify({
        domainId: domain.id,
        hostname: domain.hostname,
        daysRemaining,
        validTo: result.validTo,
        severity,
        issuerCn: result.issuerCn,
        subjectCn: result.subjectCn,
      }),
      scheduledFor,
    });

    notifications.push({
      domainId: domain.id,
      hostname: domain.hostname,
      daysRemaining,
      validTo: result.validTo,
      severity,
      tenantId: domain.tenantId,
    });
    created++;
  }

  return { created, notifications };
}

/**
 * Process pending notification events and send via appropriate connectors
 */
export async function processPendingNotifications(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  let processed = 0;
  let sent = 0;
  let failed = 0;

  const workerId = `${process.env.VERCEL_REGION ?? 'local'}:${process.pid}`;
  const maxAttempts = 8;
  const lockTimeoutMs = 10 * 60 * 1000;

  while (processed < 50) {
    const claimed = await claimNextNotificationEvent({ now, workerId, lockTimeoutMs });
    if (!claimed) break;
    processed++;

    try {
      // Get email recipients for this tenant's SSL notifications
      const recipients = await db
        .select()
        .from(sslNotificationRecipients)
        .where(
          and(
            eq(sslNotificationRecipients.tenantId, claimed.tenantId),
            eq(sslNotificationRecipients.isActive, true)
          )
        );

      if (recipients.length === 0) {
        await db
          .update(notificationEvents)
          .set({
            status: 'cancelled',
            lockedAt: null,
            lockedBy: null,
            updatedAt: now,
          })
          .where(eq(notificationEvents.id, claimed.id));
        console.log(`[Notification] No recipients for tenant ${claimed.tenantId}, cancelling notification ${claimed.id}`);
        continue;
      }

      let anyFailure = false;
      for (const recipient of recipients) {
        const success = await sendSSLExpiryEmail(recipient.email, claimed);
        if (success) {
          sent++;
        } else {
          failed++;
          anyFailure = true;
        }
      }

      if (anyFailure) {
        const attemptCount = (claimed.attemptCount ?? 0) + 1;
        if (attemptCount >= maxAttempts) {
          await db
            .update(notificationEvents)
            .set({
              status: 'dead_letter',
              attemptCount,
              deadLetteredAt: now,
              lockedAt: null,
              lockedBy: null,
              updatedAt: now,
            })
            .where(eq(notificationEvents.id, claimed.id));
        } else {
          const nextAttemptAt = computeNextAttemptAt({ now, attemptCount });
          await db
            .update(notificationEvents)
            .set({
              status: 'queued',
              attemptCount,
              nextAttemptAt,
              lockedAt: null,
              lockedBy: null,
              updatedAt: now,
            })
            .where(eq(notificationEvents.id, claimed.id));
        }
      } else {
        await db
          .update(notificationEvents)
          .set({
            status: 'sent',
            lockedAt: null,
            lockedBy: null,
            updatedAt: now,
          })
          .where(eq(notificationEvents.id, claimed.id));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Notification Processor] Error processing ${claimed.id}:`, error);
      failed++;

      const attemptCount = (claimed.attemptCount ?? 0) + 1;
      if (attemptCount >= maxAttempts) {
        await db
          .update(notificationEvents)
          .set({
            status: 'dead_letter',
            attemptCount,
            lastError: message,
            deadLetteredAt: now,
            lockedAt: null,
            lockedBy: null,
            updatedAt: now,
          })
          .where(eq(notificationEvents.id, claimed.id));
      } else {
        const nextAttemptAt = computeNextAttemptAt({ now, attemptCount });
        await db
          .update(notificationEvents)
          .set({
            status: 'queued',
            attemptCount,
            nextAttemptAt,
            lastError: message,
            lockedAt: null,
            lockedBy: null,
            updatedAt: now,
          })
          .where(eq(notificationEvents.id, claimed.id));
      }
    }
  }

  return { processed, sent, failed };
}

async function claimNextNotificationEvent(params: {
  now: Date;
  workerId: string;
  lockTimeoutMs: number;
}): Promise<NotificationEvent | null> {
  const { now, workerId, lockTimeoutMs } = params;
  const lockExpiredBefore = new Date(now.getTime() - lockTimeoutMs);

  const nowIso = now.toISOString();
  const lockExpiredIso = lockExpiredBefore.toISOString();

  const rows = await client<NotificationEvent[]>`
    WITH candidate AS (
      SELECT id
      FROM notification_events
      WHERE (status = 'queued' OR status = 'failed')
        AND scheduled_for <= ${nowIso}
        AND (next_attempt_at IS NULL OR next_attempt_at <= ${nowIso})
        AND (locked_at IS NULL OR locked_at < ${lockExpiredIso})
      ORDER BY scheduled_for ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE notification_events ne
    SET status = 'processing',
        locked_at = ${nowIso},
        locked_by = ${workerId},
        updated_at = ${nowIso}
    FROM candidate
    WHERE ne.id = candidate.id
    RETURNING ne.*;
  `;

  return rows[0] ?? null;
}

function computeNextAttemptAt(params: { now: Date; attemptCount: number }): Date {
  const { now, attemptCount } = params;
  const baseSeconds = Math.min(12 * 60 * 60, Math.pow(2, Math.max(0, attemptCount - 1)) * 60);
  const jitterSeconds = Math.floor(Math.random() * 30);
  return new Date(now.getTime() + (baseSeconds + jitterSeconds) * 1000);
}

/**
 * Send SSL expiry notification email to a recipient
 */
async function sendSSLExpiryEmail(
  toEmail: string,
  notification: NotificationEvent
): Promise<boolean> {
  try {
    const payload = JSON.parse(notification.payloadJson as string);
    const { hostname, daysRemaining, validTo, severity, issuerCn } = payload;
    
    const severityColors = {
      low: '#3b82f6',
      medium: '#eab308',
      high: '#f97316',
      critical: '#ef4444',
    };

    const severityLabels = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      critical: 'CRITICAL',
    };

    const subject = daysRemaining < 0 
      ? `🔴 SSL Certificate EXPIRED for ${hostname}`
      : `⚠️ SSL Certificate Expiring in ${daysRemaining} days - ${hostname}`;

    // Escape user-controlled values for HTML safety
    const safeHostname = escapeHtml(hostname);
    const safeIssuerCn = issuerCn ? escapeHtml(issuerCn) : null;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${severityColors[severity as keyof typeof severityColors]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">${severityLabels[severity as keyof typeof severityLabels]}: SSL Certificate Alert</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your SSL certificate for <strong>${safeHostname}</strong> requires attention.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Domain</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeHostname}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">
                ${daysRemaining < 0 
                  ? `<span style="color: #ef4444; font-weight: bold;">EXPIRED</span>` 
                  : `<span style="color: #f97316; font-weight: bold;">Expiring in ${daysRemaining} days</span>`
                }
              </td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Expiry Date</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(validTo).toLocaleString()}</td>
            </tr>
            ${safeIssuerCn ? `
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Issuer</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeIssuerCn}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Action Required</h3>
            <p style="margin-bottom: 0; color: #6b7280;">
              Please renew your SSL certificate for <strong>${safeHostname}</strong> to avoid service disruption.
              Contact your SSL certificate provider to initiate the renewal process.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated notification from Compliance OS.<br />
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    const result = await sendPlatformEmail({
      to: toEmail,
      subject,
      html,
      text: `SSL Certificate Alert for ${hostname}\n\nStatus: ${daysRemaining < 0 ? 'EXPIRED' : `Expiring in ${daysRemaining} days`}\nExpiry Date: ${new Date(validTo).toLocaleString()}\n\nPlease renew your SSL certificate to avoid service disruption.`,
    });

    if (result.success) {
      console.log(`[Notification] Email sent to ${toEmail} for ${hostname}`);
      return true;
    } else {
      console.error(`[Notification] Failed to send email to ${toEmail}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`[Notification] Error sending email:`, error);
    return false;
  }
}

/**
 * Determine severity based on days remaining
 */
function determineSeverity(daysRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysRemaining < 0) return 'critical';
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= 7) return 'high';
  if (daysRemaining <= 14) return 'medium';
  return 'low';
}
