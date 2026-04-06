import { db } from '@/lib/db/drizzle';
import { obligationInstances, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const obligationSchema = z.object({
  branchId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  category: z.enum(['trade_license', 'fire_safety', 'tax_vat', 'environmental_permit', 'inspection_renewal']),
  title: z.string().min(1).max(200),
  ownerUserId: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  dueAt: z.string(), // datetime-local format: "2024-01-15T14:30"
  graceDays: z.number().default(0),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const branchId = searchParams.get('branchId');

  const conditions: any[] = [
    eq(obligationInstances.tenantId, user.tenantId!)
  ];

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

  return Response.json(obligations);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = obligationSchema.safeParse(body);

  if (!validated.success) {
    const issues = validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return Response.json(
      { error: `Validation failed: ${issues}`, issues: validated.error.issues },
      { status: 400 }
    );
  }

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

  const dueAt = new Date(validated.data.dueAt);
  const graceUntil = validated.data.graceDays > 0
    ? new Date(dueAt.getTime() + validated.data.graceDays * 24 * 60 * 60 * 1000)
    : null;

  const [newObligation] = await db
    .insert(obligationInstances)
    .values({
      tenantId: user.tenantId!,
      branchId: validated.data.branchId,
      templateId: validated.data.templateId || null,
      category: validated.data.category,
      title: validated.data.title,
      ownerUserId: validated.data.ownerUserId || null,
      severity: validated.data.severity,
      dueAt,
      graceUntil,
      notes: validated.data.notes || null,
      status: dueAt < new Date() ? 'overdue' : 'upcoming',
    })
    .returning();

  return Response.json(newObligation, { status: 201 });
}
