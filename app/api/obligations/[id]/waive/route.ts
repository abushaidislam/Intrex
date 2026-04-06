import { db } from '@/lib/db/drizzle';
import { obligationInstances, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const waiveSchema = z.object({
  reason: z.string().min(1),
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
  const validated = waiveSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed - reason is required' },
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
      status: 'waived',
      notes: `${existing[0].notes || ''}\n\nWaived reason: ${validated.data.reason}`,
      updatedAt: new Date(),
    })
    .where(eq(obligationInstances.id, id))
    .returning();

  await db.insert(activityLogs).values({
    tenantId: user.tenantId!,
    userId: user.id,
    action: 'WAIVE_OBLIGATION',
    entityType: 'obligation',
    entityId: id,
    beforeJson: { status: existing[0].status },
    afterJson: { status: 'waived', reason: validated.data.reason },
  });

  return Response.json(updated);
}
