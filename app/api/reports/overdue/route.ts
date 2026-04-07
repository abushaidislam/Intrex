import { db } from '@/lib/db/drizzle';
import { obligationInstances, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, count, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  const conditions: any[] = [
    eq(obligationInstances.tenantId, user.tenantId!),
    eq(obligationInstances.status, 'overdue')
  ];

  if (branchId) {
    conditions.push(eq(obligationInstances.branchId, branchId));
  }

  // Get overdue obligations with branch info
  const overdue = await db
    .select({
      obligation: obligationInstances,
      branch: branches,
    })
    .from(obligationInstances)
    .leftJoin(branches, eq(obligationInstances.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(obligationInstances.dueAt);

  // Stats by branch
  const byBranch = await db
    .select({
      branchId: branches.id,
      branchName: branches.name,
      branchCode: branches.code,
      count: count(),
    })
    .from(obligationInstances)
    .leftJoin(branches, eq(obligationInstances.branchId, branches.id))
    .where(and(...conditions))
    .groupBy(branches.id, branches.name, branches.code);

  // Stats by category
  const byCategory = await db
    .select({
      category: obligationInstances.category,
      count: count(),
    })
    .from(obligationInstances)
    .where(and(...conditions))
    .groupBy(obligationInstances.category);

  // Stats by severity
  const bySeverity = await db
    .select({
      severity: obligationInstances.severity,
      count: count(),
    })
    .from(obligationInstances)
    .where(and(...conditions))
    .groupBy(obligationInstances.severity);

  // Days overdue distribution
  const daysOverdue = await db
    .select({
      obligation: obligationInstances,
    })
    .from(obligationInstances)
    .where(and(...conditions));

  const distribution = {
    '1-7': 0,
    '8-14': 0,
    '15-30': 0,
    '30+': 0,
  };

  const now = new Date();
  for (const { obligation } of daysOverdue) {
    const days = Math.floor((now.getTime() - new Date(obligation.dueAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) distribution['1-7']++;
    else if (days <= 14) distribution['8-14']++;
    else if (days <= 30) distribution['15-30']++;
    else distribution['30+']++;
  }

  return Response.json({
    total: overdue.length,
    items: overdue,
    byBranch: byBranch.map(b => ({
      branchId: b.branchId,
      branchName: b.branchName,
      branchCode: b.branchCode,
      count: Number(b.count),
    })),
    byCategory: byCategory.map(c => ({
      category: c.category,
      count: Number(c.count),
    })),
    bySeverity: bySeverity.map(s => ({
      severity: s.severity,
      count: Number(s.count),
    })),
    daysOverdueDistribution: distribution,
  });
}
