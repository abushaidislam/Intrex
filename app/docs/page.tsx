import { Metadata } from 'next';
import { 
  ArrowRight, 
  Shield, 
  Building2, 
  ClipboardCheck, 
  Globe, 
  Bell, 
  Zap,
  Users,
  Database,
  Route
} from 'lucide-react';
import Link from 'next/link';
import { createPageMetadata } from '@/components/seo/metadata-helper';

export const metadata: Metadata = createPageMetadata({
  title: 'Documentation | Intrex',
  description: 'Enterprise-grade B2B Compliance & SSL Monitoring Platform. Complete documentation for deployment, configuration, and production operations.',
  path: '/docs',
  keywords: ['docs', 'documentation', 'compliance software', 'SSL monitoring'],
});

const features = [
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    description: 'Row-level security with tenant isolation, JWT authentication, and role-based access control.',
    href: '/docs/features/auth',
  },
  {
    icon: Building2,
    title: 'Branch Management',
    description: 'Hierarchical organization structure with head office and multiple branches support.',
    href: '/docs/features/branches',
  },
  {
    icon: ClipboardCheck,
    title: 'Compliance Tracking',
    description: 'Track regulatory obligations, trade licenses, renewals with automated recurrence.',
    href: '/docs/features/obligations',
  },
  {
    icon: Globe,
    title: 'SSL Monitoring',
    description: 'Automated SSL certificate expiry monitoring with 12-hour check intervals.',
    href: '/docs/features/ssl-monitoring',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Multi-channel alerts via Email, Telegram, WhatsApp, and Webhooks.',
    href: '/docs/features/notifications',
  },
  {
    icon: Route,
    title: 'Notification Routing',
    description: 'Flexible routing rules based on event types, severity, and branches.',
    href: '/docs/features/routing',
  },
];

const quickLinks = [
  { title: 'Quick Start', href: '/docs/quickstart', description: 'Get up and running in 5 minutes' },
  { title: 'Installation', href: '/docs/installation', description: 'Production-ready setup guide' },
  { title: 'API Reference', href: '/docs/architecture/api', description: 'Complete REST API documentation' },
  { title: 'Deployment', href: '/docs/guides/deployment', description: 'Deploy to Vercel or self-host' },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pb-8 border-b border-gray-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <Shield className="w-4 h-4" />
          Production Ready
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Intrex Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Enterprise-grade B2B Compliance & SSL Monitoring Platform. 
          Complete documentation for deployment, configuration, and production operations.
        </p>
      </div>

      {/* Production Features Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <Shield className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-blue-900">Enterprise Security</h3>
          <p className="text-sm text-blue-700">JWT auth, RLS policies, encrypted credentials</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <Database className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-semibold text-purple-900">Multi-Tenant</h3>
          <p className="text-sm text-purple-700">Complete tenant isolation at database level</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <Globe className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-orange-900">Auto-Scaling</h3>
          <p className="text-sm text-orange-700">Serverless architecture on Vercel Edge</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                {link.title}
              </h3>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
            </div>
            <p className="text-sm text-gray-500">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group p-6 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <feature.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold">Built with Modern Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Frontend</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Next.js 15</li>
              <li>React 19</li>
              <li>TypeScript</li>
              <li>Tailwind CSS 4</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Backend</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Supabase Auth</li>
              <li>PostgreSQL</li>
              <li>Drizzle ORM</li>
              <li>Row Level Security</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Notifications</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>SMTP Email</li>
              <li>Telegram Bot</li>
              <li>WhatsApp Business</li>
              <li>Webhooks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Deployment</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Vercel</li>
              <li>Cron Jobs</li>
              <li>Stripe Payments</li>
              <li>Edge Functions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Production Checklist */}
      <div className="bg-gray-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold">Production Deployment Checklist</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Environment variables configured
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Database migrations applied
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              RLS policies enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              SSL certificate valid
            </li>
          </ul>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              SMTP/email configured
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Cron jobs scheduled
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Monitoring enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Backup strategy in place
            </li>
          </ul>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <Link 
            href="/docs/guides/deployment"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
          >
            View Deployment Guide →
          </Link>
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Ready to deploy?</h2>
        <p className="text-gray-600">
          Choose your path: quick local setup or production deployment.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Quick Start
          </Link>
          <Link
            href="/docs/installation"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Production Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
