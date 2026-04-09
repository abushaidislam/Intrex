import type { Metadata } from 'next';
import { pageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = pageMetadata.obligations;

export default function ObligationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
