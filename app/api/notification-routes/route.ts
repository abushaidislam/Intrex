import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { notificationRoutes, connectors, branches } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notificationRouteSchema } from '@/lib/connectors/validation';
import { getUser, getUserWithTenant } from '@/lib/db/queries';

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

  const routes = await db.query.notificationRoutes.findMany({
    where: eq(notificationRoutes.tenantId, tenantId),
    with: {
      connector: true,
      branch: true,
    },
    orderBy: (notificationRoutes, { desc }) => [desc(notificationRoutes.createdAt)],
  });

  return NextResponse.json({ routes });
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

  const body = await request.json();
  const validated = notificationRouteSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const { connectorId, branchId, eventType, severityMin, recipientRef } = validated.data;

  const connector = await db.query.connectors.findFirst({
    where: and(eq(connectors.id, connectorId), eq(connectors.tenantId, tenantId)),
  });

  if (!connector) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  if (branchId) {
    const branch = await db.query.branches.findFirst({
      where: and(eq(branches.id, branchId), eq(branches.tenantId, tenantId)),
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
  }

  const [route] = await db
    .insert(notificationRoutes)
    .values({
      tenantId,
      connectorId,
      branchId,
      eventType,
      severityMin,
      recipientRef,
    })
    .returning();

  return NextResponse.json({ route }, { status: 201 });
}
