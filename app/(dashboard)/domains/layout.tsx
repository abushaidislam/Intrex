import type { Metadata } from 'next';
import { pageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = pageMetadata.domains;

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
