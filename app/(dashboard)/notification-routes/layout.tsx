import type { Metadata } from 'next';
import { createPageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = createPageMetadata({
  title: 'Notification Routes | Intrex',
  description: 'Configure notification routing rules for compliance and SSL alerts based on event types, severity, and branches.',
  path: '/notification-routes',
  keywords: ['notification routes', 'routing rules', 'alert configuration', 'compliance notifications'],
  noIndex: true,
});

export default function NotificationRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
