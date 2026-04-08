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

export const metadata: Metadata = {
  title: 'Intrex Documentation - Introduction',
  description: 'Complete documentation for Intrex - B2B Compliance & SSL Monitoring Platform',
};

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
  { title: 'Quick Start', href: '/docs/quickstart', description: 'Get up and running in minutes' },
  { title: 'API Reference', href: '/docs/architecture/api', description: 'Complete API documentation' },
  { title: 'Database Schema', href: '/docs/architecture/database', description: 'Entity relationships and tables' },
  { title: 'Deployment Guide', href: '/docs/guides/deployment', description: 'Deploy to production' },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pb-8 border-b border-gray-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
          <Zap className="w-4 h-4" />
          v1.0 Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Intrex Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          B2B Compliance & SSL Monitoring Platform. Learn how to manage compliance deadlines, 
          monitor SSL certificates, and automate notifications across your organization.
        </p>
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

      {/* Getting Started CTA */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Ready to get started?</h2>
        <p className="text-gray-600">
          Follow our quick start guide to set up your compliance monitoring in minutes.
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
            Installation Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
