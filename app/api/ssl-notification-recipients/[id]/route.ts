import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sslNotificationRecipients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import { z } from 'zod';

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  notifyBeforeDays: z.number().min(1).max(90).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Verify recipient belongs to this tenant
    const existing = await db
      .select()
      .from(sslNotificationRecipients)
      .where(
        and(
          eq(sslNotificationRecipients.id, id),
          eq(sslNotificationRecipients.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const [recipient] = await db
      .update(sslNotificationRecipients)
      .set({
        ...validated.data,
        updatedAt: new Date(),
      })
      .where(eq(sslNotificationRecipients.id, id))
      .returning();

    return NextResponse.json({ recipient });
  } catch (error) {
    console.error('[SSL Recipients] Error updating recipient:', error);
    return NextResponse.json(
      { error: 'Failed to update recipient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const { id } = await params;

  try {
    // Verify recipient belongs to this tenant
    const existing = await db
      .select()
      .from(sslNotificationRecipients)
      .where(
        and(
          eq(sslNotificationRecipients.id, id),
          eq(sslNotificationRecipients.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    await db
      .delete(sslNotificationRecipients)
      .where(eq(sslNotificationRecipients.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SSL Recipients] Error deleting recipient:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipient' },
      { status: 500 }
    );
  }
}
