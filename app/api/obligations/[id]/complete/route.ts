import { db } from '@/lib/db/drizzle';
import { obligationInstances, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const completeSchema = z.object({
  note: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const validated = completeSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed' },
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

  const [updated] = await db
    .update(obligationInstances)
    .set({
      status: 'completed',
      completedAt: new Date(),
      notes: validated.data.note
        ? `${existing[0].notes || ''}\n\nCompletion note: ${validated.data.note}`
        : existing[0].notes,
      updatedAt: new Date(),
    })
    .where(eq(obligationInstances.id, id))
    .returning();

  await db.insert(activityLogs).values({
    tenantId: user.tenantId!,
    userId: user.id,
    action: 'COMPLETE_OBLIGATION',
    entityType: 'obligation',
    entityId: id,
    beforeJson: { status: existing[0].status },
    afterJson: { status: 'completed' },
  });

  return Response.json(updated);
}
