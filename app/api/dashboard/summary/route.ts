import { db } from '@/lib/db/drizzle';
import { obligationInstances, branches, activityLogs, domains, sslCheckResults } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, lte, gte, count, sql, desc, inArray } from 'drizzle-orm';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = user.tenantId!;
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Get summary counts
    const [branchCount] = await db
      .select({ count: count() })
      .from(branches)
      .where(eq(branches.tenantId, tenantId));

    const [activeCount] = await db
      .select({ count: count() })
      .from(obligationInstances)
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'upcoming')
        )
      );

    const [overdueCount] = await db
      .select({ count: count() })
      .from(obligationInstances)
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'overdue')
        )
      );

    const [dueTodayCount] = await db
      .select({ count: count() })
      .from(obligationInstances)
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'due_today')
        )
      );

    const [completedThisMonth] = await db
      .select({ count: count() })
      .from(obligationInstances)
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'completed'),
          gte(obligationInstances.completedAt, startOfMonth)
        )
      );

    // Get SSL summary
    const [totalDomains] = await db
      .select({ count: count() })
      .from(domains)
      .where(
        and(
          eq(domains.tenantId, tenantId),
          eq(domains.status, 'active')
        )
      );

    // Get domains with expiring/expired certificates
    const expiringSoon = await db
      .select({
        domain: domains,
        result: sslCheckResults,
      })
      .from(domains)
      .leftJoin(
        sslCheckResults,
        eq(sslCheckResults.domainId, domains.id)
      )
      .where(
        and(
          eq(domains.tenantId, tenantId),
          eq(domains.status, 'active'),
          inArray(sslCheckResults.checkStatus, ['warning', 'expired'])
        )
      )
      .orderBy(desc(sslCheckResults.checkedAt));

    // Count by status
    const [sslOkCount] = await db
      .select({ count: count() })
      .from(sslCheckResults)
      .innerJoin(domains, eq(domains.id, sslCheckResults.domainId))
      .where(
        and(
          eq(domains.tenantId, tenantId),
          eq(sslCheckResults.checkStatus, 'ok')
        )
      );

    const [sslWarningCount] = await db
      .select({ count: count() })
      .from(sslCheckResults)
      .innerJoin(domains, eq(domains.id, sslCheckResults.domainId))
      .where(
        and(
          eq(domains.tenantId, tenantId),
          eq(sslCheckResults.checkStatus, 'warning')
        )
      );

    const [sslExpiredCount] = await db
      .select({ count: count() })
      .from(sslCheckResults)
      .innerJoin(domains, eq(domains.id, sslCheckResults.domainId))
      .where(
        and(
          eq(domains.tenantId, tenantId),
          inArray(sslCheckResults.checkStatus, ['expired', 'handshake_failed', 'dns_failed', 'hostname_mismatch'])
        )
      );

    // Get upcoming obligations (next 7 days)
    const upcoming = await db
      .select({
        obligation: obligationInstances,
        branch: branches,
      })
      .from(obligationInstances)
      .leftJoin(branches, eq(obligationInstances.branchId, branches.id))
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'upcoming'),
          lte(obligationInstances.dueAt, sevenDaysLater),
          gte(obligationInstances.dueAt, now)
        )
      )
      .orderBy(obligationInstances.dueAt)
      .limit(5);

    // Get overdue obligations
    const overdue = await db
      .select({
        obligation: obligationInstances,
        branch: branches,
      })
      .from(obligationInstances)
      .leftJoin(branches, eq(obligationInstances.branchId, branches.id))
      .where(
        and(
          eq(obligationInstances.tenantId, tenantId),
          eq(obligationInstances.status, 'overdue')
        )
      )
      .orderBy(desc(obligationInstances.dueAt))
      .limit(5);

    return Response.json({
      summary: {
        totalBranches: branchCount?.count || 0,
        activeObligations: activeCount?.count || 0,
        upcomingCount: upcoming.length,
        overdueCount: overdueCount?.count || 0,
        dueTodayCount: dueTodayCount?.count || 0,
        completedThisMonth: completedThisMonth?.count || 0,
        // SSL Summary
        totalDomains: totalDomains?.count || 0,
        sslHealthy: sslOkCount?.count || 0,
        sslExpiringSoon: sslWarningCount?.count || 0,
        sslIssues: sslExpiredCount?.count || 0,
      },
      upcoming,
      overdue,
      sslExpiring: expiringSoon.slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return Response.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
