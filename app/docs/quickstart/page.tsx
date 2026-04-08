import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Terminal, Database, Bell, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quick Start - Intrex Documentation',
  description: 'Get started with Intrex in minutes',
};

const steps = [
  {
    icon: Terminal,
    number: '01',
    title: 'Clone and Install',
    description: 'Clone the repository and install dependencies with pnpm.',
    code: `git clone https://github.com/your-org/intrex.git
cd intrex
pnpm install`,
  },
  {
    icon: Database,
    number: '02',
    title: 'Configure Environment',
    description: 'Set up your environment variables for Supabase and other services.',
    code: `cp .env.example .env

# Edit .env with your credentials:
POSTGRES_URL=postgresql://...
AUTH_SECRET=your-secret-key
BASE_URL=http://localhost:3000`,
  },
  {
    icon: Shield,
    number: '03',
    title: 'Setup Database',
    description: 'Run migrations and seed initial data including jurisdictions.',
    code: `pnpm db:migrate
pnpm db:seed`,
  },
  {
    icon: Bell,
    number: '04',
    title: 'Start Development',
    description: 'Launch the development server with Turbopack.',
    code: `pnpm dev

# Visit http://localhost:3000`,
  },
];

const nextSteps = [
  { title: 'Production Deployment', href: '/docs/guides/deployment', description: 'Deploy to Vercel or self-host' },
  { title: 'Create your first branch', href: '/docs/features/branches', description: 'Set up your organization structure' },
  { title: 'Configure connectors', href: '/docs/guides/connectors', description: 'Set up email, Telegram, or WhatsApp' },
  { title: 'Add SSL domains', href: '/docs/features/ssl-monitoring', description: 'Monitor certificate expirations' },
];

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/docs" 
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          ← Back to Documentation
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-gray-900">Quick Start</h1>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
            5 min setup
          </span>
        </div>
        <p className="text-lg text-gray-600">
          Get Intrex running locally for development or evaluation. For production deployment, 
          see the <Link href="/docs/guides/deployment" className="text-orange-600 hover:underline">Deployment Guide</Link>.
        </p>
      </div>

      {/* Two Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl border-2 border-orange-500 bg-orange-50">
          <h3 className="font-bold text-gray-900 mb-2">Development</h3>
          <p className="text-sm text-gray-600 mb-4">Local setup for development and testing</p>
          <ul className="space-y-1 text-sm text-gray-600 mb-4">
            <li>✓ Local PostgreSQL or Supabase</li>
            <li>✓ Development SMTP (optional)</li>
            <li>✓ Hot reload enabled</li>
          </ul>
          <span className="text-xs font-medium text-orange-600">Follow steps below →</span>
        </div>
        <Link 
          href="/docs/guides/deployment" 
          className="p-6 rounded-xl border border-gray-200 bg-white hover:border-orange-300 transition-colors"
        >
          <h3 className="font-bold text-gray-900 mb-2">Production</h3>
          <p className="text-sm text-gray-600 mb-4">Deploy for real-world usage</p>
          <ul className="space-y-1 text-sm text-gray-600 mb-4">
            <li>✓ Production Supabase</li>
            <li>✓ Verified SMTP credentials</li>
            <li>✓ Vercel or self-hosted</li>
          </ul>
          <span className="text-xs font-medium text-orange-600">View deployment guide →</span>
        </Link>
      </div>

      {/* Prerequisites */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Prerequisites</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Node.js 20+ installed
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            pnpm package manager (npm install -g pnpm)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Supabase account (free tier works)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Git installed
          </li>
        </ul>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            <div className="flex gap-6">
              {/* Step Number & Icon */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 my-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Verify Installation
        </h3>
        <p className="text-green-800 mb-4">
          Once the dev server is running, verify everything works:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Landing page loads at localhost:3000
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Sign-up page works
            </li>
          </ul>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Can create test branch
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Dashboard loads correctly
            </li>
          </ul>
        </div>
      </div>

      {/* Production Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Ready for Production?</h3>
        <p className="text-sm text-blue-800 mb-3">
          This quick start sets up a local development environment. For production deployment:
        </p>
        <ul className="space-y-1 text-sm text-blue-800 mb-4">
          <li>• Use production Supabase project (not local)</li>
          <li>• Configure verified SMTP credentials</li>
          <li>• Set up proper environment variables</li>
          <li>• Enable database backups</li>
        </ul>
        <Link 
          href="/docs/guides/deployment"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          View Production Deployment Guide →
        </Link>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
        <p className="text-gray-600">
          Now that you have Intrex running, explore these guides to set up your compliance monitoring:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                  {step.title}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
              </div>
              <p className="text-sm text-gray-500">{step.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
