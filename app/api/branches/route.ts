import { db } from '@/lib/db/drizzle';
import { branches } from '@/lib/db/schema';
import { getUser, getUserWithTenant } from '@/lib/db/queries';
import { setRlsContext, clearRlsContext, checkRolePermission } from '@/lib/db/rls';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const branchSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  addressLine: z.string().optional(),
  cityCorporation: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  countryCode: z.string().default('BD'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  if (!userWithTenant?.tenantId) {
    return Response.json({ error: 'No tenant assigned' }, { status: 403 });
  }

  try {
    await setRlsContext(user.id, userWithTenant.tenantId);
    
    const userBranches = await db
      .select()
      .from(branches)
      .orderBy(branches.createdAt);
    
    await clearRlsContext();
    return Response.json(userBranches);
  } catch (error) {
    await clearRlsContext();
    console.error('Error fetching branches:', error);
    return Response.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only head_office_admin and branch_manager can create branches
  if (!checkRolePermission(user.role, 'branch_manager')) {
    return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const userWithTenant = await getUserWithTenant(user.id);
  if (!userWithTenant?.tenantId) {
    return Response.json({ error: 'No tenant assigned' }, { status: 403 });
  }

  const body = await request.json();
  const validated = branchSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: 'Validation failed', issues: validated.error.issues },
      { status: 400 }
    );
  }

  try {
    await setRlsContext(user.id, userWithTenant.tenantId);

    const existing = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.tenantId, userWithTenant.tenantId),
          eq(branches.code, validated.data.code)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await clearRlsContext();
      return Response.json(
        { error: 'Branch code already exists' },
        { status: 409 }
      );
    }

    const [newBranch] = await db
      .insert(branches)
      .values({
        ...validated.data,
        tenantId: userWithTenant.tenantId,
      })
      .returning();

    await clearRlsContext();
    return Response.json(newBranch, { status: 201 });
  } catch (error) {
    await clearRlsContext();
    console.error('Error creating branch:', error);
    return Response.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
