import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'https://intrex.flinkeo.online'),
  title: {
    default: 'Intrex - B2B Compliance & SSL Monitoring Platform',
    template: '%s | Intrex',
  },
  description: 'Multi-tenant SaaS platform for B2B compliance management and SSL certificate monitoring. Track regulatory deadlines, manage branches, and get automated notifications.',
  keywords: ['compliance', 'SSL monitoring', 'B2B SaaS', 'regulatory deadlines', 'trade license', 'fire safety', 'tax compliance', 'certificate expiry'],
  authors: [{ name: 'Flinkeo' }],
  creator: 'Flinkeo',
  publisher: 'Flinkeo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Intrex',
    title: 'Intrex - B2B Compliance & SSL Monitoring Platform',
    description: 'Multi-tenant SaaS platform for B2B compliance management and SSL certificate monitoring. Track regulatory deadlines, manage branches, and get automated notifications.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intrex - B2B Compliance & SSL Monitoring Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intrex - B2B Compliance & SSL Monitoring Platform',
    description: 'Multi-tenant SaaS platform for B2B compliance management and SSL certificate monitoring.',
    images: ['/og-image.png'],
    creator: '@flinkeo',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/logo.svg',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const manrope = Manrope({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50" suppressHydrationWarning>
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
