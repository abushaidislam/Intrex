import { db } from '@/lib/db/drizzle';
import { obligationTemplates, jurisdictions } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, isNull, or } from 'drizzle-orm';
import { z } from 'zod';

const templateSchema = z.object({
  jurisdictionId: z.string().uuid().optional(),
  category: z.enum(['trade_license', 'fire_safety', 'tax_vat', 'environmental_permit', 'inspection_renewal']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  recurrenceType: z.enum(['annual', 'semiannual', 'quarterly', 'monthly', 'custom']).optional(),
  defaultLeadDays: z.number().default(30),
  defaultGraceDays: z.number().default(0),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const includeSystem = searchParams.get('includeSystem') === 'true';

  const conditions: any[] = [];

  if (includeSystem) {
    conditions.push(
      or(
        eq(obligationTemplates.tenantId, user.tenantId!),
        isNull(obligationTemplates.tenantId)
      )
    );
  } else {
    conditions.push(eq(obligationTemplates.tenantId, user.tenantId!));
  }

  if (category) {
    conditions.push(eq(obligationTemplates.category, category as any));
  }

  const templates = await db
    .select({
      template: obligationTemplates,
      jurisdiction: jurisdictions,
    })
    .from(obligationTemplates)
    .leftJoin(jurisdictions, eq(obligationTemplates.jurisdictionId, jurisdictions.id))
    .where(and(...conditions))
    .orderBy(obligationTemplates.title);

  return Response.json(templates);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = templateSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  const [newTemplate] = await db
    .insert(obligationTemplates)
    .values({
      ...validated.data,
      tenantId: user.tenantId!,
    })
    .returning();

  return Response.json(newTemplate, { status: 201 });
}
