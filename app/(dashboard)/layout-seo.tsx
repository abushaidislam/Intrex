import type { Metadata } from 'next';
import { createPageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = createPageMetadata({
  title: 'Intrex - B2B Compliance & SSL Monitoring Platform',
  description: 'Multi-tenant SaaS platform for B2B compliance management and SSL certificate monitoring. Track regulatory deadlines, manage branches, and get automated notifications.',
  path: '/',
  keywords: ['compliance', 'SSL monitoring', 'B2B SaaS', 'regulatory deadlines', 'trade license', 'fire safety', 'tax compliance', 'certificate expiry'],
});
