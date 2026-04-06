import { db } from '@/lib/db/drizzle';
import { domains, branches, sslCheckResults } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, ne } from 'drizzle-orm';
import { z } from 'zod';

const domainUpdateSchema = z.object({
  hostname: z.string().min(1).max(255).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  sniHostname: z.string().max(255).optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'paused', 'deleted']).optional(),
});

// GET /api/domains/[id] - Get single domain with latest SSL result
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const results = await db
    .select({
      domain: domains,
      branch: branches,
    })
    .from(domains)
    .leftJoin(branches, eq(domains.branchId, branches.id))
    .where(
      and(
        eq(domains.id, id),
        eq(domains.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (results.length === 0) {
    return Response.json({ error: 'Domain not found' }, { status: 404 });
  }

  // Get latest SSL check result
  const latestResults = await db
    .select()
    .from(sslCheckResults)
    .where(eq(sslCheckResults.domainId, id))
    .orderBy(desc(sslCheckResults.checkedAt))
    .limit(1);

  const response = {
    ...results[0],
    latestResult: latestResults[0] || null,
  };

  return Response.json(response);
}

// PATCH /api/domains/[id] - Update domain
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify domain exists and belongs to tenant
  const existing = await db
    .select()
    .from(domains)
    .where(
      and(
        eq(domains.id, id),
        eq(domains.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Domain not found' }, { status: 404 });
  }

  const body = await request.json();
  const validated = domainUpdateSchema.safeParse(body);

  if (!validated.success) {
    const issues = validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return Response.json(
      { error: `Validation failed: ${issues}`, issues: validated.error.issues },
      { status: 400 }
    );
  }

  // Validate branch belongs to tenant if provided
  if (validated.data.branchId) {
    const branch = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.id, validated.data.branchId),
          eq(branches.tenantId, user.tenantId!)
        )
      )
      .limit(1);

    if (branch.length === 0) {
      return Response.json({ error: 'Branch not found' }, { status: 404 });
    }
  }

  // Check for duplicate if hostname/port changed
  if (validated.data.hostname || validated.data.port) {
    const hostname = validated.data.hostname || existing[0].hostname;
    const port = validated.data.port || existing[0].port;

    const duplicate = await db
      .select()
      .from(domains)
      .where(
        and(
          eq(domains.tenantId, user.tenantId!),
          eq(domains.hostname, hostname),
          eq(domains.port, port),
          ne(domains.id, id)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return Response.json(
        { error: 'Domain with this hostname and port already exists' },
        { status: 409 }
      );
    }
  }

  const [updated] = await db
    .update(domains)
    .set({
      ...validated.data,
      updatedAt: new Date(),
    })
    .where(eq(domains.id, id))
    .returning();

  return Response.json(updated);
}

// DELETE /api/domains/[id] - Soft delete domain
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify domain exists and belongs to tenant
  const existing = await db
    .select()
    .from(domains)
    .where(
      and(
        eq(domains.id, id),
        eq(domains.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Domain not found' }, { status: 404 });
  }

  // Soft delete by setting status to deleted
  const [deleted] = await db
    .update(domains)
    .set({
      status: 'deleted',
      updatedAt: new Date(),
    })
    .where(eq(domains.id, id))
    .returning();

  return Response.json(deleted);
}
