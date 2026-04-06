import { db, client } from './drizzle';
import { getUser, getUserWithTenant } from './queries';

/**
 * Set RLS context for the current database session
 * This must be called before any tenant-scoped queries when using RLS
 */
export async function setRlsContext(userId: number, tenantId: string | null | undefined) {
  if (!tenantId) {
    // Clear context if no tenant
    await client`SELECT set_config('app.current_user_id', '', true)`;
    await client`SELECT set_config('app.current_tenant_id', '', true)`;
    return;
  }
  
  await client`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`;
  await client`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
}

/**
 * Clear RLS context after operations
 */
export async function clearRlsContext() {
  await client`SELECT set_config('app.current_user_id', '', true)`;
  await client`SELECT set_config('app.current_tenant_id', '', true)`;
}

/**
 * Execute a database operation with RLS context set for the current user
 */
export async function withRlsContext<T>(operation: () => Promise<T>): Promise<T> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const userWithTenant = await getUserWithTenant(user.id);
  
  try {
    await setRlsContext(user.id, userWithTenant?.tenantId);
    return await operation();
  } finally {
    await clearRlsContext();
  }
}

/**
 * Execute a database operation with a specific tenant context (for admin/cron jobs)
 */
export async function withTenantContext<T>(
  tenantId: string, 
  userId: number,
  operation: () => Promise<T>
): Promise<T> {
  try {
    await setRlsContext(userId, tenantId);
    return await operation();
  } finally {
    await clearRlsContext();
  }
}

/**
 * Check if user has permission for a specific branch
 * Used for branch-level RBAC enforcement
 */
export async function checkBranchAccess(
  userId: number, 
  userRole: string, 
  branchId: string
): Promise<boolean> {
  // Head office admin can access all branches
  if (userRole === 'head_office_admin') {
    return true;
  }
  
  // For branch_manager and operator, check if they own/have access to the branch
  // This would need a user_branch_assignments table for granular control
  // For now, allow access (implement granular control in Phase 2)
  return true;
}

/**
 * Check if user can perform an action based on their role
 */
export function checkRolePermission(
  userRole: string, 
  requiredRole: 'head_office_admin' | 'branch_manager' | 'operator'
): boolean {
  const roleHierarchy: Record<string, number> = {
    'operator': 1,
    'branch_manager': 2,
    'head_office_admin': 3
  };
  
  return (roleHierarchy[userRole] || 0) >= roleHierarchy[requiredRole];
}
