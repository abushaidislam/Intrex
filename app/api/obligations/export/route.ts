import { db } from '@/lib/db/drizzle';
import { obligationInstances, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

// Helper to format date for CSV
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

// Export obligations to CSV
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const conditions: any[] = [
    eq(obligationInstances.tenantId, user.tenantId!)
  ];

  const status = searchParams.get('status');
  const branchId = searchParams.get('branchId');

  if (status) {
    conditions.push(eq(obligationInstances.status, status as any));
  }

  if (branchId) {
    conditions.push(eq(obligationInstances.branchId, branchId));
  }

  const obligations = await db
    .select({
      obligation: obligationInstances,
      branch: branches,
    })
    .from(obligationInstances)
    .leftJoin(branches, eq(obligationInstances.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(desc(obligationInstances.dueAt));

  // CSV export
  if (format === 'csv') {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Status',
      'Severity',
      'Due Date',
      'Grace Until',
      'Branch',
      'Branch Code',
      'Notes',
      'Created At',
    ];

    const rows = obligations.map(({ obligation, branch }) => [
      obligation.id,
      obligation.title,
      obligation.category,
      obligation.status,
      obligation.severity,
      formatDate(obligation.dueAt),
      formatDate(obligation.graceUntil),
      branch?.name || '',
      branch?.code || '',
      obligation.notes || '',
      formatDate(obligation.createdAt),
    ]);

    // Escape CSV values
    const escapeCsv = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="obligations.csv"',
      },
    });
  }

  // Default JSON response
  return Response.json(obligations);
}
