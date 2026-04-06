import { db } from '@/lib/db/drizzle';
import {
  obligationInstances,
  obligationTemplates,
  activityLogs,
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, lte, isNull, or } from 'drizzle-orm';
import { z } from 'zod';

// Generate next due date based on recurrence
function getNextDueDate(currentDueAt: Date, recurrenceType: string): Date {
  const next = new Date(currentDueAt);
  switch (recurrenceType) {
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'semiannual':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'annual':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow cron-like execution or admin users
  const authHeader = request.headers.get('authorization');
  const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCronRequest && user.role !== 'head_office_admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Find completed obligations with recurrence rules that need regeneration
    const completedWithRecurrence = await db
      .select({
        instance: obligationInstances,
        template: obligationTemplates,
      })
      .from(obligationInstances)
      .leftJoin(
        obligationTemplates,
        eq(obligationInstances.templateId, obligationTemplates.id)
      )
      .where(
        and(
          eq(obligationInstances.tenantId, user.tenantId!),
          eq(obligationInstances.status, 'completed'),
          isNull(obligationInstances.recurrenceRule), // hasn't been regenerated yet
          or(
            isNull(obligationTemplates.recurrenceType),
            and(
              lte(obligationInstances.completedAt, new Date()),
            )
          )
        )
      );

    const generated: any[] = [];

    for (const { instance, template } of completedWithRecurrence) {
      // Skip if no template or template is not recurring
      if (!template || !template.recurrenceType) continue;

      const nextDueAt = getNextDueDate(
        new Date(instance.dueAt),
        template.recurrenceType
      );

      const graceUntil = template.defaultGraceDays > 0
        ? new Date(nextDueAt.getTime() + template.defaultGraceDays * 24 * 60 * 60 * 1000)
        : null;

      const [newInstance] = await db
        .insert(obligationInstances)
        .values({
          tenantId: instance.tenantId,
          branchId: instance.branchId,
          templateId: instance.templateId,
          category: instance.category,
          title: instance.title,
          ownerUserId: instance.ownerUserId,
          severity: instance.severity,
          dueAt: nextDueAt,
          graceUntil,
          source: 'template',
          notes: `Auto-generated from completion of ${instance.id}`,
        })
        .returning();

      // Mark original as having been regenerated
      await db
        .update(obligationInstances)
        .set({
          recurrenceRule: `regenerated:${newInstance.id}`,
          updatedAt: new Date(),
        })
        .where(eq(obligationInstances.id, instance.id));

      await db.insert(activityLogs).values({
        tenantId: user.tenantId!,
        userId: null,
        actorType: 'system',
        action: 'CREATE_OBLIGATION',
        entityType: 'obligation',
        entityId: newInstance.id,
        afterJson: {
          fromInstanceId: instance.id,
          dueAt: nextDueAt,
        },
      });

      generated.push(newInstance);
    }

    return Response.json({
      processed: completedWithRecurrence.length,
      generated: generated.length,
      items: generated,
    });
  } catch (error) {
    console.error('Recurrence generation error:', error);
    return Response.json(
      { error: 'Failed to generate recurring obligations' },
      { status: 500 }
    );
  }
}
