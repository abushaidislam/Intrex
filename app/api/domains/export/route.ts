import { db } from '@/lib/db/drizzle';
import { domains, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

// Helper to format date for CSV
function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

// Export domains to CSV
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const conditions: any[] = [
    eq(domains.tenantId, user.tenantId!)
  ];

  const status = searchParams.get('status');
  const branchId = searchParams.get('branchId');

  if (status) {
    conditions.push(eq(domains.status, status as any));
  }

  if (branchId) {
    conditions.push(eq(domains.branchId, branchId));
  }

  const domainList = await db
    .select({
      domain: domains,
      branch: branches,
    })
    .from(domains)
    .leftJoin(branches, eq(domains.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(desc(domains.createdAt));

  // CSV export
  if (format === 'csv') {
    const headers = [
      'ID',
      'Hostname',
      'Port',
      'SNI Hostname',
      'Status',
      'Branch',
      'Branch Code',
      'Last Checked',
      'Next Check',
      'Created At',
    ];

    const rows = domainList.map(({ domain, branch }) => [
      domain.id,
      domain.hostname,
      domain.port?.toString() || '443',
      domain.sniHostname || '',
      domain.status,
      branch?.name || '',
      branch?.code || '',
      formatDate(domain.lastCheckedAt),
      formatDate(domain.nextCheckAt),
      formatDate(domain.createdAt),
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
        'Content-Disposition': 'attachment; filename="domains.csv"',
      },
    });
  }

  // Default JSON response
  return Response.json(domainList);
}
