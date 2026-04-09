import type { Metadata } from 'next';
import { pageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = pageMetadata.dashboard;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
