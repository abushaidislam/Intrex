import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade License Compliance Software | Intrex',
  description: 'Automated trade license tracking and compliance management. Monitor renewal deadlines, manage multiple locations, and never miss a regulatory deadline.',
  keywords: ['trade license compliance', 'license tracking software', 'trade license renewal', 'regulatory compliance', 'business license management'],
  openGraph: {
    title: 'Trade License Compliance Software | Intrex',
    description: 'Automated trade license tracking and compliance management.',
    url: 'https://intrex.flinkeo.online/trade-license',
  },
};

export default function TradeLicenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
