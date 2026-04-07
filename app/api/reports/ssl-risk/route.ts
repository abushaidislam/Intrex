import { db } from '@/lib/db/drizzle';
import { domains, sslCheckResults, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, sql, inArray, desc, count } from 'drizzle-orm';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const riskLevel = searchParams.get('riskLevel') || 'all'; // all, high, critical

  // Get latest SSL check results for each domain
  const subquery = db
    .select({
      domainId: sslCheckResults.domainId,
      maxCheckedAt: sql`MAX(${sslCheckResults.checkedAt})`.as('max_checked_at'),
    })
    .from(sslCheckResults)
    .groupBy(sslCheckResults.domainId)
    .as('latest_checks');

  // Get domains with their latest check results
  const domainResults = await db
    .select({
      domain: domains,
      checkResult: sslCheckResults,
      branch: branches,
    })
    .from(domains)
    .leftJoin(
      sslCheckResults,
      and(
        eq(sslCheckResults.domainId, domains.id),
        sql`${sslCheckResults.checkedAt} = (SELECT MAX(checked_at) FROM ssl_check_results WHERE domain_id = ${domains.id})`
      )
    )
    .leftJoin(branches, eq(domains.branchId, branches.id))
    .where(
      and(
        eq(domains.tenantId, user.tenantId!),
        eq(domains.status, 'active')
      )
    );

  // Categorize by risk level
  const categorized = domainResults.map(({ domain, checkResult, branch }) => {
    const daysRemaining = checkResult?.daysRemaining ?? null;
    let risk: 'critical' | 'high' | 'medium' | 'low' = 'low';

    if (!checkResult || checkResult.checkStatus === 'expired' || checkResult.checkStatus === 'handshake_failed') {
      risk = 'critical';
    } else if (daysRemaining !== null && daysRemaining <= 7) {
      risk = 'critical';
    } else if (daysRemaining !== null && daysRemaining <= 14) {
      risk = 'high';
    } else if (daysRemaining !== null && daysRemaining <= 30) {
      risk = 'medium';
    }

    return {
      domain,
      checkResult,
      branch,
      risk,
    };
  });

  // Filter by risk level if specified
  const filtered = riskLevel === 'all' 
    ? categorized 
    : categorized.filter(c => c.risk === riskLevel || (riskLevel === 'high' && ['high', 'critical'].includes(c.risk)));

  // Summary stats
  const summary = {
    total: domainResults.length,
    critical: categorized.filter(c => c.risk === 'critical').length,
    high: categorized.filter(c => c.risk === 'high').length,
    medium: categorized.filter(c => c.risk === 'medium').length,
    low: categorized.filter(c => c.risk === 'low').length,
  };

  // By branch
  const byBranch = await db
    .select({
      branchId: branches.id,
      branchName: branches.name,
      count: count(),
    })
    .from(domains)
    .leftJoin(branches, eq(domains.branchId, branches.id))
    .leftJoin(
      sslCheckResults,
      and(
        eq(sslCheckResults.domainId, domains.id),
        inArray(sslCheckResults.checkStatus, ['warning', 'expired', 'handshake_failed'])
      )
    )
    .where(
      and(
        eq(domains.tenantId, user.tenantId!),
        eq(domains.status, 'active')
      )
    )
    .groupBy(branches.id, branches.name);

  return Response.json({
    summary,
    items: filtered.map(({ domain, checkResult, branch, risk }) => ({
      domainId: domain.id,
      hostname: domain.hostname,
      port: domain.port,
      branchId: branch?.id,
      branchName: branch?.name,
      risk,
      daysRemaining: checkResult?.daysRemaining,
      checkStatus: checkResult?.checkStatus,
      validTo: checkResult?.validTo,
      issuer: checkResult?.issuerCn,
      lastChecked: checkResult?.checkedAt,
    })),
    byBranch: byBranch.map(b => ({
      branchId: b.branchId,
      branchName: b.branchName,
      atRiskCount: Number(b.count),
    })),
  });
}
