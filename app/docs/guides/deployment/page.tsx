import { Metadata } from 'next';
import Link from 'next/link';
import { Rocket, Database, Shield, Settings, Check, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Deployment - Intrex Documentation',
  description: 'Deploy Intrex to production',
};

const deploymentSteps = [
  {
    title: 'Prepare Environment',
    icon: Settings,
    items: [
      'Set up production Supabase project',
      'Configure production environment variables',
      'Generate strong AUTH_SECRET (32+ chars)',
      'Configure SMTP for production email',
    ],
  },
  {
    title: 'Database Setup',
    icon: Database,
    items: [
      'Run migrations: pnpm db:migrate',
      'Seed jurisdictions: pnpm db:seed',
      'Enable RLS policies on all tables',
      'Configure connection pooling',
    ],
  },
  {
    title: 'Vercel Deployment',
    icon: Rocket,
    items: [
      'Push code to GitHub',
      'Import project in Vercel dashboard',
      'Add environment variables',
      'Configure build settings (Next.js default)',
      'Deploy and verify',
    ],
  },
  {
    title: 'Post-Deployment',
    icon: Shield,
    items: [
      'Verify SSL certificates are valid',
      'Test notification connectors',
      'Create admin user',
      'Configure cron jobs',
      'Set up monitoring',
    ],
  },
];

const envVars = [
  { name: 'POSTGRES_URL', importance: 'Critical', description: 'Production database connection' },
  { name: 'AUTH_SECRET', importance: 'Critical', description: 'JWT signing secret (generate new)' },
  { name: 'BASE_URL', importance: 'Critical', description: 'Production domain URL' },
  { name: 'PLATFORM_SMTP_HOST', importance: 'Recommended', description: 'Production SMTP server' },
  { name: 'PLATFORM_EMAIL_FROM', importance: 'Recommended', description: 'Verified sender address' },
  { name: 'STRIPE_SECRET_KEY', importance: 'Optional', description: 'If using Stripe billing' },
];

export default function DeploymentGuidePage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Deployment Guide</h1>
        <p className="text-lg text-gray-600">
          Deploy Intrex to production using Vercel (recommended) or your preferred hosting platform.
        </p>
      </div>

      {/* Deployment Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border-2 border-orange-500 bg-orange-50">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Vercel (Recommended)</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Native Next.js support</li>
            <li>✓ Built-in cron jobs</li>
            <li>✓ Automatic scaling</li>
            <li>✓ Edge network</li>
            <li>✓ Preview deployments</li>
          </ul>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Self-Hosted</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Docker or PM2 deployment</li>
            <li>• Manual cron job setup</li>
            <li>• Configure reverse proxy</li>
            <li>• Manage SSL certificates</li>
            <li>• Self-managed scaling</li>
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Deployment Steps</h2>
        {deploymentSteps.map((step, index) => (
          <div key={step.title} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              {index < deploymentSteps.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 my-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-3 mb-3">
                <step.icon className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              </div>
              <ul className="space-y-2">
                {step.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Environment Variables */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Production Environment Variables</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Variable</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Importance</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody>
              {envVars.map((env) => (
                <tr key={env.name} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm text-orange-600">{env.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      env.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                      env.importance === 'Recommended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {env.importance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{env.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vercel Deploy Button */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Deploy to Vercel</h3>
        <p className="text-gray-400 mb-4">
          Click below to deploy your own instance of Intrex to Vercel:
        </p>
        <a 
          href="https://vercel.com/new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Rocket className="w-5 h-5" />
          Deploy to Vercel
        </a>
      </div>

      {/* Security Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Production Security Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>Strong AUTH_SECRET generated (32+ chars)</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>Database RLS policies enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>HTTPS enforced on all routes</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>Production SMTP configured</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>Cron jobs configured</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" readOnly />
            <span>Error monitoring enabled (Sentry recommended)</span>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Common Deployment Issues
        </h3>
        <div className="space-y-3 text-sm text-yellow-800">
          <div>
            <strong>Build fails:</strong> Check Node.js version (20+ required). 
            Verify all dependencies are in package.json.
          </div>
          <div>
            <strong>Database connection errors:</strong> Verify POSTGRES_URL format. 
            Check Supabase IP allowlist includes Vercel IPs.
          </div>
          <div>
            <strong>Cron jobs not running:</strong> Verify vercel.json configuration. 
            Check Vercel dashboard Cron section.
          </div>
          <div>
            <strong>Auth issues:</strong> Ensure AUTH_SECRET is set and 32+ characters. 
            Check cookie settings (secure: true in production).
          </div>
        </div>
      </div>
    </div>
  );
}
