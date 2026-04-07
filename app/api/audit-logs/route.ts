import { db } from '@/lib/db/drizzle';
import { activityLogs, users, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(25),
  entityType: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET handler for audit logs
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only head_office_admin can view all audit logs
  if (user.role !== 'head_office_admin') {
    return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams.entries()));

  const conditions: any[] = [
    eq(activityLogs.tenantId, user.tenantId!)
  ];

  if (query.entityType) {
    conditions.push(eq(activityLogs.entityType, query.entityType));
  }

  if (query.action) {
    conditions.push(sql`${activityLogs.action} ILIKE ${'%' + query.action + '%'}`);
  }

  if (query.startDate) {
    conditions.push(sql`${activityLogs.timestamp} >= ${new Date(query.startDate)}`);
  }

  if (query.endDate) {
    conditions.push(sql`${activityLogs.timestamp} <= ${new Date(query.endDate)}`);
  }

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(and(...conditions));

  const total = Number(totalResult.count);

  // Get paginated logs with user info
  const logs = await db
    .select({
      log: activityLogs,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(activityLogs.timestamp))
    .limit(query.perPage)
    .offset((query.page - 1) * query.perPage);

  return Response.json({
    logs: logs.map(({ log, user }) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actorType: log.actorType,
      user: user || null,
      beforeJson: log.beforeJson,
      afterJson: log.afterJson,
      ipAddress: log.ipAddress,
      createdAt: log.timestamp,
    })),
    pagination: {
      total,
      page: query.page,
      perPage: query.perPage,
      totalPages: Math.ceil(total / query.perPage),
    },
  });
}
