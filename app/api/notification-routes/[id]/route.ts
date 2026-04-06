import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { notificationRoutes } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
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

  const existingRoute = await db.query.notificationRoutes.findFirst({
    where: and(eq(notificationRoutes.id, id), eq(notificationRoutes.tenantId, tenantId)),
  });

  if (!existingRoute) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  await db
    .delete(notificationRoutes)
    .where(and(eq(notificationRoutes.id, id), eq(notificationRoutes.tenantId, tenantId)));

  return NextResponse.json({ success: true });
}
