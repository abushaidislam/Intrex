'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTenant } from '@/lib/auth/middleware';

export const checkoutAction = withTenant(async (formData, tenant) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ tenant, priceId });
});

export const customerPortalAction = withTenant(async (_, tenant) => {
  const portalSession = await createCustomerPortalSession(tenant);
  redirect(portalSession.url);
});
