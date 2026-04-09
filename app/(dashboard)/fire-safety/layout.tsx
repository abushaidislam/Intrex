import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fire Safety Certificate Tracking | Intrex',
  description: 'Automated fire safety compliance tracking and certificate management. Monitor NFPA inspections, fire extinguisher certifications, and safety audits.',
  keywords: ['fire safety compliance', 'fire certificate tracking', 'NFPA compliance', 'fire extinguisher certification', 'fire safety audit'],
  openGraph: {
    title: 'Fire Safety Certificate Tracking | Intrex',
    description: 'Automated fire safety compliance tracking and certificate management.',
    url: 'https://intrex.flinkeo.online/fire-safety',
  },
};

export default function FireSafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
