import type { Metadata } from 'next';
import { pageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = pageMetadata.connectors;

export default function ConnectorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
