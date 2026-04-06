import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sslNotificationRecipients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import { z } from 'zod';

const recipientSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().optional(),
  notifyBeforeDays: z.number().min(1).max(90).default(30),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const recipients = await db
    .select()
    .from(sslNotificationRecipients)
    .where(eq(sslNotificationRecipients.tenantId, tenantId))
    .orderBy(sslNotificationRecipients.createdAt);

  return NextResponse.json({ recipients });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validated = recipientSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name, notifyBeforeDays, isActive } = validated.data;

    // Check if email already exists for this tenant
    const existing = await db
      .select()
      .from(sslNotificationRecipients)
      .where(
        and(
          eq(sslNotificationRecipients.tenantId, tenantId),
          eq(sslNotificationRecipients.email, email)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists as a recipient' },
        { status: 409 }
      );
    }

    const [recipient] = await db
      .insert(sslNotificationRecipients)
      .values({
        tenantId,
        email,
        name: name || null,
        notifyBeforeDays,
        isActive,
      })
      .returning();

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    console.error('[SSL Recipients] Error creating recipient:', error);
    return NextResponse.json(
      { error: 'Failed to create recipient' },
      { status: 500 }
    );
  }
}
