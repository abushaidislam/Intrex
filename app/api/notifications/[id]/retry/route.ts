import { db } from '@/lib/db/drizzle';
import { notificationEvents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import { z } from 'zod';

const retrySchema = z.object({
  resetAttempts: z.boolean().default(false),
});

// POST /api/notifications/[id]/retry - Admin retry for dead-letter notifications
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

  // Only head office admins can retry dead-lettered notifications
  if (user.role !== 'head_office_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validated = retrySchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date();

  try {
    const event = await db.query.notificationEvents.findFirst({
      where: and(
        eq(notificationEvents.id, id),
        eq(notificationEvents.tenantId, tenantId)
      ),
    });

    if (!event) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (event.status !== 'dead_letter') {
      return NextResponse.json(
        { error: 'Only dead_letter notifications can be retried' },
        { status: 400 }
      );
    }

    const updates: Partial<typeof notificationEvents.$inferInsert> = {
      status: 'queued',
      lockedAt: null,
      lockedBy: null,
      deadLetteredAt: null,
      nextAttemptAt: now,
      updatedAt: now,
    };

    if (validated.data.resetAttempts) {
      updates.attemptCount = 0;
      updates.lastError = null;
    }

    const [updated] = await db
      .update(notificationEvents)
      .set(updates)
      .where(eq(notificationEvents.id, id))
      .returning();

    console.log(JSON.stringify({
      job: 'admin_retry',
      action: 'retry_dead_letter',
      notificationId: id,
      tenantId,
      adminUserId: user.id,
      resetAttempts: validated.data.resetAttempts,
      timestamp: now.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      event: updated,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error(JSON.stringify({
      job: 'admin_retry',
      action: 'error',
      notificationId: id,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        error: 'Retry failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
