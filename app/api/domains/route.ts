import { db } from '@/lib/db/drizzle';
import { domains, branches, sslCheckResults } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const domainSchema = z.object({
  hostname: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535).default(443),
  sniHostname: z.string().max(255).optional(),
  branchId: z.string().uuid().optional(),
  status: z.enum(['active', 'paused', 'deleted']).default('active'),
});

const domainUpdateSchema = z.object({
  hostname: z.string().min(1).max(255).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  sniHostname: z.string().max(255).optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'paused', 'deleted']).optional(),
});

// GET /api/domains - List all domains for tenant
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const branchId = searchParams.get('branchId');

  const conditions: any[] = [
    eq(domains.tenantId, user.tenantId!)
  ];

  if (status) {
    conditions.push(eq(domains.status, status));
  }

  if (branchId) {
    conditions.push(eq(domains.branchId, branchId));
  }

  const results = await db
    .select({
      domain: domains,
      branch: branches,
    })
    .from(domains)
    .leftJoin(branches, eq(domains.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(desc(domains.createdAt));

  return Response.json(results);
}

// POST /api/domains - Create new domain
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = domainSchema.safeParse(body);

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

  // Check for duplicate hostname+port within tenant
  const existing = await db
    .select()
    .from(domains)
    .where(
      and(
        eq(domains.tenantId, user.tenantId!),
        eq(domains.hostname, validated.data.hostname),
        eq(domains.port, validated.data.port)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return Response.json(
      { error: 'Domain with this hostname and port already exists' },
      { status: 409 }
    );
  }

  // Set next check to now so it's picked up soon
  const nextCheckAt = new Date();

  const [newDomain] = await db
    .insert(domains)
    .values({
      tenantId: user.tenantId!,
      branchId: validated.data.branchId || null,
      hostname: validated.data.hostname,
      port: validated.data.port,
      sniHostname: validated.data.sniHostname || null,
      status: validated.data.status,
      nextCheckAt,
    })
    .returning();

  return Response.json(newDomain, { status: 201 });
}

// PATCH /api/domains - Bulk update (not used, individual updates via [id])
export async function PATCH(request: Request) {
  return Response.json({ error: 'Use PUT /api/domains/[id] for individual updates' }, { status: 400 });
}
