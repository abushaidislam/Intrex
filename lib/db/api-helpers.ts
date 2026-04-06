import { NextRequest } from 'next/server';
import { getUser, getUserWithTenant } from './queries';
import { setRlsContext, clearRlsContext, checkRolePermission } from './rls';

export interface ApiContext {
  userId: number;
  tenantId: string;
  role: string;
  email: string;
}

export type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<Response>;

/**
 * Wrap an API handler with authentication and RLS context
 */
export function withAuth(handler: ApiHandler): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTenant = await getUserWithTenant(user.id);
    if (!userWithTenant?.tenantId) {
      return Response.json({ error: 'No tenant assigned' }, { status: 403 });
    }

    const ctx: ApiContext = {
      userId: user.id,
      tenantId: userWithTenant.tenantId,
      role: user.role,
      email: user.email,
    };

    try {
      await setRlsContext(ctx.userId, ctx.tenantId);
      const response = await handler(req, ctx);
      await clearRlsContext();
      return response;
    } catch (error) {
      await clearRlsContext();
      console.error('API error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Wrap an API handler with authentication, RLS context, and role permission check
 */
export function withRole(
  requiredRole: 'head_office_admin' | 'branch_manager' | 'operator',
  handler: ApiHandler
): (req: NextRequest) => Promise<Response> {
  return withAuth(async (req, ctx) => {
    if (!checkRolePermission(ctx.role, requiredRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return handler(req, ctx);
  });
}

/**
 * Get client IP from request headers
 */
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}
