import { db } from '@/lib/db/drizzle';
import { obligationInstances, branches, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, lte, gte, count, sql, desc } from 'drizzle-orm';

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
      },
      upcoming,
      overdue,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return Response.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
