import { db } from '@/lib/db/drizzle';
import { connectors, notificationDeliveries, notificationEvents } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, sql, count, desc, gte } from 'drizzle-orm';

// GET handler for connector health
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only head_office_admin can view connector health
  if (user.role !== 'head_office_admin') {
    return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // Get all connectors for the tenant
  const tenantConnectors = await db
    .select()
    .from(connectors)
    .where(eq(connectors.tenantId, user.tenantId!));

  // Get delivery stats for last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const connectorHealth = await Promise.all(
    tenantConnectors.map(async (connector) => {
      // Get delivery stats
      const deliveryStats = await db
        .select({
          status: notificationDeliveries.deliveryStatus,
          count: count(),
        })
        .from(notificationDeliveries)
        .where(
          and(
            eq(notificationDeliveries.connectorId, connector.id),
            gte(notificationDeliveries.createdAt, sevenDaysAgo)
          )
        )
        .groupBy(notificationDeliveries.deliveryStatus);

      const stats = {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        delivered: 0,
      };

      for (const stat of deliveryStats) {
        stats.total += Number(stat.count);
        if (stat.status === 'sent') stats.sent += Number(stat.count);
        if (stat.status === 'failed') stats.failed += Number(stat.count);
        if (stat.status === 'pending') stats.pending += Number(stat.count);
        if (stat.status === 'delivered' || stat.status === 'provider_delivered') {
          stats.delivered += Number(stat.count);
        }
      }

      // Calculate success rate
      const successRate = stats.total > 0 
        ? Math.round(((stats.total - stats.failed) / stats.total) * 100) 
        : 100;

      // Get recent errors
      const recentErrors = await db
        .select({
          id: notificationDeliveries.id,
          status: notificationDeliveries.deliveryStatus,
          responseCode: notificationDeliveries.responseCode,
          responseBody: notificationDeliveries.responseBody,
          createdAt: notificationDeliveries.createdAt,
        })
        .from(notificationDeliveries)
        .where(
          and(
            eq(notificationDeliveries.connectorId, connector.id),
            eq(notificationDeliveries.deliveryStatus, 'failed')
          )
        )
        .orderBy(desc(notificationDeliveries.createdAt))
        .limit(5);

      return {
        id: connector.id,
        name: connector.name,
        type: connector.type,
        status: connector.status,
        lastVerifiedAt: connector.lastVerifiedAt,
        createdAt: connector.createdAt,
        updatedAt: connector.updatedAt,
        deliveryStats: {
          ...stats,
          successRate,
        },
        recentErrors: recentErrors.map(err => ({
          id: err.id,
          status: err.status,
          responseCode: err.responseCode,
          responseBody: err.responseBody?.substring(0, 200), // Truncate long responses
          createdAt: err.createdAt,
        })),
      };
    })
  );

  return Response.json({
    connectors: connectorHealth,
    summary: {
      total: connectorHealth.length,
      active: connectorHealth.filter(c => c.status === 'active').length,
      error: connectorHealth.filter(c => c.status === 'error').length,
      disabled: connectorHealth.filter(c => c.status === 'disabled').length,
      pendingVerification: connectorHealth.filter(c => c.status === 'pending_verification').length,
    },
  });
}
