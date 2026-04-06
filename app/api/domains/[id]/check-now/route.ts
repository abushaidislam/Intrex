import { db } from '@/lib/db/drizzle';
import { domains, sslCheckResults } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, sql } from 'drizzle-orm';
import { checkSSLCertificate, type SSLCheckResult } from '@/lib/ssl/checker';

type SslCheckStatus = 'ok' | 'warning' | 'expired' | 'handshake_failed' | 'dns_failed' | 'timeout' | 'hostname_mismatch';

// Simple in-memory rate limiter for check-now requests
// Maps userId -> { count: number, resetAt: Date }
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>();

const RATE_LIMIT_MAX = 10; // max 10 manual checks per hour per user
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: Date } {
  const now = new Date();
  const existing = rateLimitMap.get(userId);

  if (!existing || now > existing.resetAt) {
    // New window
    const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);
    rateLimitMap.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - existing.count, resetAt: existing.resetAt };
}

// POST /api/domains/[id]/check-now - Trigger manual SSL check
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check rate limit
  const rateLimit = checkRateLimit(user.id.toString());
  if (!rateLimit.allowed) {
    return Response.json(
      { 
        error: 'Rate limit exceeded', 
        message: `Maximum ${RATE_LIMIT_MAX} manual checks per hour. Try again later.`,
        resetAt: rateLimit.resetAt.toISOString()
      },
      { status: 429 }
    );
  }

  // Verify domain exists and belongs to tenant
  const domain = await db
    .select()
    .from(domains)
    .where(
      and(
        eq(domains.id, id),
        eq(domains.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (domain.length === 0) {
    return Response.json({ error: 'Domain not found' }, { status: 404 });
  }

  const domainData = domain[0];

  // Don't check deleted domains
  if (domainData.status === 'deleted') {
    return Response.json({ error: 'Cannot check deleted domain' }, { status: 400 });
  }

  try {
    // Perform SSL check
    const checkResult: SSLCheckResult = await checkSSLCertificate({
      hostname: domainData.hostname,
      port: domainData.port,
      sniHostname: domainData.sniHostname || undefined,
    });

    // Determine check status based on result
    let checkStatus: SslCheckStatus = 'ok';
    let daysRemaining: number | null = null;

    if (checkResult.error) {
      if (checkResult.error.includes('DNS') || checkResult.error.includes('ENOTFOUND')) {
        checkStatus = 'dns_failed';
      } else if (checkResult.error.includes('timeout') || checkResult.error.includes('ETIMEDOUT')) {
        checkStatus = 'timeout';
      } else {
        checkStatus = 'handshake_failed';
      }
    } else if (checkResult.certificate) {
      const now = new Date();
      const validTo = new Date(checkResult.certificate.validTo);
      daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        checkStatus = 'expired';
      } else if (daysRemaining <= 30) {
        checkStatus = 'warning';
      }

      // Check hostname mismatch
      if (checkResult.certificate.san && checkResult.certificate.san.length > 0) {
        const hostname = domainData.hostname;
        const san = checkResult.certificate.san;
        const cn = checkResult.certificate.subjectCN;
        
        const hostnameMatch = san.some((s: string) => {
          if (s.startsWith('*.')) {
            const domain = s.slice(2);
            return hostname === domain || hostname.endsWith('.' + domain);
          }
          return s === hostname;
        }) || cn === hostname;

        if (!hostnameMatch) {
          checkStatus = 'hostname_mismatch';
        }
      }
    }

    // Save result to database
    const [savedResult] = await db
      .insert(sslCheckResults)
      .values({
        domainId: id,
        checkStatus,
        validFrom: checkResult.certificate?.validFrom ? new Date(checkResult.certificate.validFrom) : null,
        validTo: checkResult.certificate?.validTo ? new Date(checkResult.certificate.validTo) : null,
        issuerCn: checkResult.certificate?.issuerCN || null,
        subjectCn: checkResult.certificate?.subjectCN || null,
        sanJson: checkResult.certificate?.san ? JSON.stringify(checkResult.certificate.san) : null,
        daysRemaining,
        fingerprintSha256: checkResult.certificate?.fingerprint || null,
        errorMessage: checkResult.error || null,
        rawJson: checkResult.raw || null,
      })
      .returning();

    // Update domain with last/next check times
    const nextCheckAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
    await db
      .update(domains)
      .set({
        lastCheckedAt: new Date(),
        nextCheckAt,
      })
      .where(eq(domains.id, id));

    return Response.json({
      result: savedResult,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('SSL check failed:', error);
    
    // Save failure result
    const [savedResult] = await db
      .insert(sslCheckResults)
      .values({
        domainId: id,
        checkStatus: 'handshake_failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .returning();

    return Response.json({
      result: savedResult,
      error: 'SSL check failed',
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt.toISOString(),
      },
    }, { status: 500 });
  }
}
