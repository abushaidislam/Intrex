import type { Metadata } from 'next';
import { pageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = pageMetadata.branches;

export default function BranchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
