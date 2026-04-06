import { db } from '@/lib/db/drizzle';
import { domains, sslCheckResults } from '@/lib/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { checkSSLCertificate } from '@/lib/ssl/checker';

type SslCheckStatus = 'ok' | 'warning' | 'expired' | 'handshake_failed' | 'dns_failed' | 'timeout' | 'hostname_mismatch';

// GET /api/cron/ssl-scan - Run SSL checks for domains due for checking
// This endpoint is called by Vercel Cron every 12 hours
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results: Array<{
    domainId: string;
    hostname: string;
    status: string;
    error?: string;
  }> = [];

  try {
    // Find domains that are active and due for checking
    const domainsToCheck = await db
      .select()
      .from(domains)
      .where(
        and(
          eq(domains.status, 'active'),
          lte(domains.nextCheckAt, now)
        )
      )
      .limit(50); // Process in batches

    console.log(`[SSL Cron] Found ${domainsToCheck.length} domains to check`);

    for (const domain of domainsToCheck) {
      try {
        // Perform SSL check
        const checkResult = await checkSSLCertificate({
          hostname: domain.hostname,
          port: domain.port,
          sniHostname: domain.sniHostname || undefined,
          timeout: 30000,
        });

        // Determine check status
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
          const validTo = new Date(checkResult.certificate.validTo);
          daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysRemaining < 0) {
            checkStatus = 'expired';
          } else if (daysRemaining <= 30) {
            checkStatus = 'warning';
          }

          // Check hostname mismatch
          if (checkResult.certificate.san && checkResult.certificate.san.length > 0) {
            const hostname = domain.hostname;
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

        // Save result
        await db.insert(sslCheckResults).values({
          domainId: domain.id,
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
        });

        // Update domain with last/next check times
        const nextCheckAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
        await db
          .update(domains)
          .set({
            lastCheckedAt: now,
            nextCheckAt,
          })
          .where(eq(domains.id, domain.id));

        results.push({
          domainId: domain.id,
          hostname: domain.hostname,
          status: checkStatus,
        });

      } catch (error) {
        console.error(`[SSL Cron] Error checking ${domain.hostname}:`, error);
        
        // Save failure result
        await db.insert(sslCheckResults).values({
          domainId: domain.id,
          checkStatus: 'handshake_failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

        results.push({
          domainId: domain.id,
          hostname: domain.hostname,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[SSL Cron] Completed ${results.length} SSL checks`);

    return Response.json({
      success: true,
      checked: results.length,
      results,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('[SSL Cron] Fatal error:', error);
    return Response.json(
      { 
        error: 'SSL scan failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
