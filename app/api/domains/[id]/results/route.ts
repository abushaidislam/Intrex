import { db } from '@/lib/db/drizzle';
import { domains, sslCheckResults } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/domains/[id]/results - Get SSL check history for a domain
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

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

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Get SSL check results
  const results = await db
    .select()
    .from(sslCheckResults)
    .where(eq(sslCheckResults.domainId, id))
    .orderBy(desc(sslCheckResults.checkedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sslCheckResults)
    .where(eq(sslCheckResults.domainId, id));

  const total = countResult[0]?.count || 0;

  return Response.json({
    results,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + results.length < total,
    },
  });
}
