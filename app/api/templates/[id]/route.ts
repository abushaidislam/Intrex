import { db } from '@/lib/db/drizzle';
import { obligationTemplates } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const templateUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  recurrenceType: z.enum(['annual', 'semiannual', 'quarterly', 'monthly', 'custom']).optional(),
  defaultLeadDays: z.number().optional(),
  defaultGraceDays: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isActive: z.boolean().optional(),
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
  const validated = templateUpdateSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(obligationTemplates)
    .where(
      and(
        eq(obligationTemplates.id, id),
        eq(obligationTemplates.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(obligationTemplates)
    .set({
      ...validated.data,
      updatedAt: new Date(),
    })
    .where(eq(obligationTemplates.id, id))
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
    .from(obligationTemplates)
    .where(
      and(
        eq(obligationTemplates.id, id),
        eq(obligationTemplates.tenantId, user.tenantId!)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  await db.delete(obligationTemplates).where(eq(obligationTemplates.id, id));

  return Response.json({ success: true });
}
