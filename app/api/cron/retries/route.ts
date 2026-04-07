import { db } from '@/lib/db/drizzle';
import { notificationEvents } from '@/lib/db/schema';
import { and, eq, isNotNull, lt, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/cron/retries - Re-queue stuck processing notification events
// Intended to be called by Vercel Cron
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const lockTimeoutMs = 10 * 60 * 1000;
  const lockExpiredBefore = new Date(now.getTime() - lockTimeoutMs);

  try {
    const stuck = await db
      .select({ id: notificationEvents.id })
      .from(notificationEvents)
      .where(
        and(
          eq(notificationEvents.status, 'processing'),
          isNotNull(notificationEvents.lockedAt),
          lt(notificationEvents.lockedAt, lockExpiredBefore)
        )
      )
      .limit(200);

    if (stuck.length === 0) {
      console.log(JSON.stringify({
        job: 'cron_retries',
        action: 'noop',
        stuck: 0,
        timestamp: now.toISOString(),
      }));

      return Response.json({ success: true, stuck: 0, requeued: 0, timestamp: now.toISOString() });
    }

    const ids = stuck.map((s) => s.id);

    const updated = await db
      .update(notificationEvents)
      .set({
        status: 'queued',
        lockedAt: null,
        lockedBy: null,
        updatedAt: now,
      })
      .where(or(...ids.map((id) => eq(notificationEvents.id, id))))
      .returning({ id: notificationEvents.id });

    console.log(JSON.stringify({
      job: 'cron_retries',
      action: 'requeue_stuck_processing',
      stuck: ids.length,
      requeued: updated.length,
      timestamp: now.toISOString(),
    }));

    return Response.json({
      success: true,
      stuck: ids.length,
      requeued: updated.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error(JSON.stringify({
      job: 'cron_retries',
      action: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: now.toISOString(),
    }));

    return Response.json(
      {
        error: 'Retry cron failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
