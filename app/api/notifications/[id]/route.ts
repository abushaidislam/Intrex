import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { notificationEvents, acknowledgements, activityLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { acknowledgeNotificationSchema } from '@/lib/connectors/validation';
import { ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const event = await db.query.notificationEvents.findFirst({
    where: and(eq(notificationEvents.id, id), eq(notificationEvents.tenantId, tenantId)),
    with: {
      deliveries: true,
      acknowledgement: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const existingEvent = await db.query.notificationEvents.findFirst({
    where: and(eq(notificationEvents.id, id), eq(notificationEvents.tenantId, tenantId)),
  });

  if (!existingEvent) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  const body = await request.json();
  const validated = acknowledgeNotificationSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const [ack] = await db
    .insert(acknowledgements)
    .values({
      notificationEventId: id,
      ackByUserId: user.id,
      ackNote: validated.data.note,
    })
    .returning();

  await db
    .update(notificationEvents)
    .set({ status: 'acked' })
    .where(and(eq(notificationEvents.id, id), eq(notificationEvents.tenantId, tenantId)));

  await db.insert(activityLogs).values({
    tenantId,
    userId: user.id,
    actorType: 'user',
    action: ActivityType.ACKNOWLEDGE_NOTIFICATION,
    entityType: 'notification',
    entityId: id,
    afterJson: { note: validated.data.note },
  });

  return NextResponse.json({ acknowledgement: ack });
}
