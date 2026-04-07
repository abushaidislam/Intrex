import { db } from '@/lib/db/drizzle';
import { obligationInstances, domains, sslCheckResults, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Upcoming obligations (due in next 30 days)
  const upcomingResult = await db
    .select({ count: count() })
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.tenantId, user.tenantId!),
        eq(obligationInstances.status, 'upcoming'),
        lte(obligationInstances.dueAt, thirtyDaysFromNow),
        gte(obligationInstances.dueAt, today)
      )
    );

  // Overdue obligations
  const overdueResult = await db
    .select({ count: count() })
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.tenantId, user.tenantId!),
        eq(obligationInstances.status, 'overdue')
      )
    );

  // Due today
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dueTodayResult = await db
    .select({ count: count() })
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.tenantId, user.tenantId!),
        gte(obligationInstances.dueAt, today),
        lte(obligationInstances.dueAt, tomorrow)
      )
    );

  // SSL domains with warnings
  const sslWarningsResult = await db
    .select({ count: count() })
    .from(domains)
    .where(
      and(
        eq(domains.tenantId, user.tenantId!),
        eq(domains.status, 'active')
      )
    );

  // Get SSL at-risk domains
  const sslAtRisk = await db
    .select({
      domain: domains,
      lastResult: sslCheckResults,
    })
    .from(domains)
    .leftJoin(
      sslCheckResults,
      sql`${sslCheckResults.domainId} = ${domains.id} AND ${sslCheckResults.checkedAt} = (
        SELECT MAX(checked_at) FROM ssl_check_results WHERE domain_id = ${domains.id}
      )`
    )
    .where(
      and(
        eq(domains.tenantId, user.tenantId!),
        eq(domains.status, 'active')
      )
    );

  const sslRiskCount = sslAtRisk.filter(
    ({ lastResult }) => lastResult && (lastResult.daysRemaining || 0) <= 30
  ).length;

  // Branch stats
  const branchStats = await db
    .select({
      branch: branches,
      upcoming: count(sql`CASE WHEN ${obligationInstances.status} = 'upcoming' THEN 1 END`),
      overdue: count(sql`CASE WHEN ${obligationInstances.status} = 'overdue' THEN 1 END`),
    })
    .from(branches)
    .leftJoin(obligationInstances, eq(branches.id, obligationInstances.branchId))
    .where(eq(branches.tenantId, user.tenantId!))
    .groupBy(branches.id);

  // By category breakdown
  const categoryStats = await db
    .select({
      category: obligationInstances.category,
      count: count(),
    })
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.tenantId, user.tenantId!),
        eq(obligationInstances.status, 'overdue')
      )
    )
    .groupBy(obligationInstances.category);

  return Response.json({
    summary: {
      upcoming: Number(upcomingResult[0]?.count || 0),
      overdue: Number(overdueResult[0]?.count || 0),
      dueToday: Number(dueTodayResult[0]?.count || 0),
      totalDomains: Number(sslWarningsResult[0]?.count || 0),
      sslAtRisk: sslRiskCount,
    },
    byBranch: branchStats.map(({ branch, upcoming, overdue }) => ({
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      upcoming: Number(upcoming),
      overdue: Number(overdue),
    })),
    byCategory: categoryStats.map(({ category, count: c }) => ({
      category,
      overdueCount: Number(c),
    })),
    sslSummary: sslAtRisk
      .filter(({ lastResult }) => lastResult && (lastResult.daysRemaining || 0) <= 30)
      .slice(0, 10)
      .map(({ domain, lastResult }) => ({
        domainId: domain.id,
        hostname: domain.hostname,
        daysRemaining: lastResult?.daysRemaining,
        checkStatus: lastResult?.checkStatus,
      })),
  });
}
