import { db } from '@/lib/db/drizzle';
import { obligationInstances } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const obligationUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  ownerUserId: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const validated = obligationUpdateSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.id, id),
        eq(obligationInstances.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Obligation not found' }, { status: 404 });
  }

  const updateData: any = { ...validated.data, updatedAt: new Date() };
  if (validated.data.dueAt) {
    updateData.dueAt = new Date(validated.data.dueAt);
    updateData.status = updateData.dueAt < new Date() ? 'overdue' : 'upcoming';
  }

  const [updated] = await db
    .update(obligationInstances)
    .set(updateData)
    .where(eq(obligationInstances.id, id))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db
    .select()
    .from(obligationInstances)
    .where(
      and(
        eq(obligationInstances.id, id),
        eq(obligationInstances.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Obligation not found' }, { status: 404 });
  }

  await db.delete(obligationInstances).where(eq(obligationInstances.id, id));

  return Response.json({ success: true });
}
