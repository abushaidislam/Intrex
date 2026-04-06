import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { notificationEvents, acknowledgements, activityLogs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { acknowledgeNotificationSchema } from '@/lib/connectors/validation';
import { ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  const tenantId = userWithTenant?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = db.query.notificationEvents.findMany({
    where: (events, { eq, and }) => {
      const conditions = [eq(events.tenantId, tenantId)];
      if (status && ['queued', 'sent', 'failed', 'cancelled', 'acked'].includes(status)) {
        conditions.push(eq(events.status, status as typeof events.status._.data));
      }
      return and(...conditions);
    },
    with: {
      deliveries: true,
      acknowledgement: true,
    },
    orderBy: [desc(notificationEvents.createdAt)],
    limit,
  });

  const events = await query;

  return NextResponse.json({ events });
}
