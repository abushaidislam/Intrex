import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSL Certificate Monitoring Tool | Intrex',
  description: 'Automated SSL certificate monitoring for all your domains. Get instant alerts before expiration, track SSL health, and prevent downtime. Free trial available.',
  keywords: ['SSL monitoring', 'SSL certificate expiration', 'domain SSL checker', 'SSL health monitoring', 'certificate expiry alerts'],
  openGraph: {
    title: 'SSL Certificate Monitoring Tool | Intrex',
    description: 'Automated SSL certificate monitoring for all your domains. Get instant alerts before expiration.',
    url: 'https://intrex.flinkeo.online/ssl-monitoring',
  },
};

export default function SSLLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
