import { db } from '@/lib/db/drizzle';
import { branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const branchUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  addressLine: z.string().optional(),
  cityCorporation: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  countryCode: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
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
  const validated = branchUpdateSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(branches)
    .where(and(eq(branches.id, id), eq(branches.tenantId, user.tenantId!)))
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Branch not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(branches)
    .set({
      ...validated.data,
      updatedAt: new Date(),
    })
    .where(eq(branches.id, id))
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
    .from(branches)
    .where(and(eq(branches.id, id), eq(branches.tenantId, user.tenantId!)))
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: 'Branch not found' }, { status: 404 });
  }

  await db.delete(branches).where(eq(branches.id, id));

  return Response.json({ success: true });
}
