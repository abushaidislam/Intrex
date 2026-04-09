import type { Metadata } from 'next';

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

const baseUrl = process.env.BASE_URL || 'https://intrex.flinkeo.online';

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path = '',
    keywords = [],
    ogImage = '/og-image.png',
    noIndex = false,
  } = options;

  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    keywords,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Intrex',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Predefined metadata for common pages
export const pageMetadata = {
  dashboard: createPageMetadata({
    title: 'Dashboard | Intrex',
    description: 'Manage your compliance obligations, SSL certificates, and branch operations from your centralized dashboard.',
    path: '/dashboard',
    noIndex: true,
  }),

  obligations: createPageMetadata({
    title: 'Compliance Obligations | Intrex',
    description: 'Track and manage regulatory compliance deadlines across all your branches. Trade licenses, fire safety, tax/VAT, and more.',
    path: '/obligations',
    keywords: ['compliance', 'obligations', 'trade license', 'fire safety', 'tax compliance'],
    noIndex: true,
  }),

  branches: createPageMetadata({
    title: 'Branch Management | Intrex',
    description: 'Manage all your business locations, assign compliance tasks, and monitor branch-specific obligations.',
    path: '/branches',
    keywords: ['branch management', 'multi-location', 'business branches'],
    noIndex: true,
  }),

  domains: createPageMetadata({
    title: 'SSL Certificate Monitoring | Intrex',
    description: 'Monitor SSL certificate expiration dates across all your domains. Get automated alerts before certificates expire.',
    path: '/domains',
    keywords: ['SSL monitoring', 'certificate expiry', 'domain security', 'TLS'],
    noIndex: true,
  }),

  connectors: createPageMetadata({
    title: 'Notification Connectors | Intrex',
    description: 'Configure notification channels including Email, Telegram, WhatsApp, and Webhooks for compliance alerts.',
    path: '/connectors',
    keywords: ['notifications', 'email alerts', 'telegram bot', 'webhooks'],
    noIndex: true,
  }),

  templates: createPageMetadata({
    title: 'Compliance Templates | Intrex',
    description: 'Create and manage reusable compliance templates for trade licenses, fire safety, tax/VAT, and environmental permits.',
    path: '/templates',
    keywords: ['compliance templates', 'regulatory templates', 'obligation templates'],
    noIndex: true,
  }),

  notifications: createPageMetadata({
    title: 'Notification History | Intrex',
    description: 'View notification delivery history and acknowledgment status for all compliance alerts.',
    path: '/notifications',
    noIndex: true,
  }),

  signIn: createPageMetadata({
    title: 'Sign In | Intrex',
    description: 'Sign in to your Intrex account to manage compliance and SSL monitoring.',
    path: '/sign-in',
    noIndex: true,
  }),

  signUp: createPageMetadata({
    title: 'Sign Up | Intrex',
    description: 'Create your Intrex account and start managing compliance across all your business branches.',
    path: '/sign-up',
    noIndex: true,
  }),

  docs: createPageMetadata({
    title: 'Documentation | Intrex',
    description: 'Complete documentation for Intrex B2B Compliance & SSL Monitoring Platform.',
    path: '/docs',
    keywords: ['documentation', 'help', 'guides', 'API docs'],
  }),
};
