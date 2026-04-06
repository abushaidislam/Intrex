import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, tenants, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTenantByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTenantSubscription(
  tenantId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(tenants)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(tenants.id, tenantId));
}

export async function getUserWithTenant(userId: number) {
  const result = await db
    .select({
      user: users,
      tenantId: users.tenantId
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      tenant: true
    }
  });

  return result?.tenant || null;
}
