import { Metadata } from 'next';
import Link from 'next/link';
import { Settings, Download, Database, Shield, Check, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Installation - Intrex Documentation',
  description: 'Installation and setup guide',
};

const prerequisites = [
  { name: 'Node.js', version: '20+', description: 'JavaScript runtime' },
  { name: 'pnpm', version: '8+', description: 'Package manager (npm install -g pnpm)' },
  { name: 'Git', version: '2.30+', description: 'Version control' },
  { name: 'Supabase', version: '-', description: 'Database and Auth (free tier works)' },
];

const envVars = [
  { name: 'POSTGRES_URL', required: true, description: 'Supabase PostgreSQL connection string (use connection pooler)', example: 'postgresql://...' },
  { name: 'AUTH_SECRET', required: true, description: '32+ char random string for JWT signing (HS256)', example: 'openssl rand -base64 32' },
  { name: 'BASE_URL', required: true, description: 'Application base URL (no trailing slash)', example: 'https://app.yourdomain.com' },
  { name: 'PLATFORM_SMTP_HOST', required: true, description: 'SMTP server host for transactional emails', example: 'smtp.gmail.com' },
  { name: 'PLATFORM_SMTP_PORT', required: true, description: 'SMTP port (587 for TLS, 465 for SSL)', example: '587' },
  { name: 'PLATFORM_SMTP_USER', required: true, description: 'SMTP username/email address', example: 'noreply@yourdomain.com' },
  { name: 'PLATFORM_SMTP_PASS', required: true, description: 'SMTP password or app-specific password', example: '****' },
  { name: 'PLATFORM_EMAIL_FROM', required: true, description: 'Default sender name and email', example: '"Intrex" <noreply@yourdomain.com>' },
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key for billing (prod)', example: 'sk_live_...' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook endpoint secret', example: 'whsec_...' },
  { name: 'SENTRY_DSN', required: false, description: 'Sentry DSN for error monitoring', example: 'https://...' },
  { name: 'LOG_LEVEL', required: false, description: 'Logging level (debug, info, warn, error)', example: 'info' },
];

export default function InstallationPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Installation</h1>
        <p className="text-lg text-gray-600">
          Production-ready installation guide for Intrex. Includes environment setup, 
          database configuration, and deployment preparation.
        </p>
        
        {/* Environment Tabs */}
        <div className="flex gap-2 mt-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
            Development
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
            Staging
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
            Production
          </span>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Download className="w-6 h-6 text-orange-500" />
          Prerequisites
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prerequisites.map((item) => (
            <div key={item.name} className="p-4 rounded-lg border border-gray-200 bg-white flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <span className="text-sm text-gray-500">{item.version}</span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Clone */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Step 1: Clone Repository</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>git clone https://github.com/your-org/intrex.git
cd intrex</code>
          </pre>
        </div>
      </div>

      {/* Step 2: Install */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Step 2: Install Dependencies</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>pnpm install</code>
          </pre>
        </div>
      </div>

      {/* Step 3: Environment */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          Step 3: Configure Environment
        </h2>
        <p className="text-gray-600">
          Copy the example environment file and fill in your credentials:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="text-sm text-gray-300 font-mono">
            <code>cp .env.example .env</code>
          </pre>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Variable</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Required</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Example</th>
              </tr>
            </thead>
            <tbody>
              {envVars.map((env) => (
                <tr key={env.name} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm text-orange-600">{env.name}</td>
                  <td className="py-3 px-4">
                    {env.required ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Optional</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{env.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{env.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 4: Database */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-orange-500" />
          Step 4: Setup Database
        </h2>
        <p className="text-gray-600">
          Run migrations to create the database schema, then seed initial data:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code># Run database migrations
pnpm db:migrate

# Seed Bangladesh jurisdiction data and templates
pnpm db:seed</code>
          </pre>
        </div>
      </div>

      {/* Step 5: Start */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Step 5: Start Development Server</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>pnpm dev

# Application will be available at:
# http://localhost:3000</code>
          </pre>
        </div>
      </div>

      {/* Production Build */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-500" />
          Production Build
        </h2>
        <p className="text-gray-600">
          For production deployment, build the application first:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code># Build for production
pnpm build

# Start production server
pnpm start

# Or deploy to Vercel (recommended)
vercel --prod</code>
          </pre>
        </div>
      </div>

      {/* Production Checklist */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Production Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Database connection string uses connection pooler
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              AUTH_SECRET is 32+ characters and unique
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              SMTP credentials verified working
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              BASE_URL matches production domain
            </li>
          </ul>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              RLS policies enabled in Supabase
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Cron jobs configured in Vercel
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Error monitoring (Sentry) configured
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Database backups enabled
            </li>
          </ul>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Common Issues & Solutions
        </h3>
        <div className="space-y-4 text-sm text-yellow-800">
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <strong className="block mb-1">AUTH_SECRET too short</strong>
            <p>Must be at least 32 characters. Generate with: <code className="bg-yellow-100 px-2 py-1 rounded">openssl rand -base64 32</code></p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <strong className="block mb-1">Database connection failed</strong>
            <p>Check POSTGRES_URL format and ensure IP is allowed in Supabase settings. Use connection pooler for serverless.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <strong className="block mb-1">Migration fails</strong>
            <p>Ensure database exists and user has CREATE privileges. Check that extensions are enabled.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <strong className="block mb-1">Build fails on Vercel</strong>
            <p>Ensure all environment variables are set in Vercel dashboard. Check that Node.js version is 20+.</p>
          </div>
        </div>
      </div>

      {/* Verify */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Verify Installation
        </h3>
        <p className="text-green-800 mb-4">
          After starting the server, verify everything is working:
        </p>
        <ul className="space-y-2 text-sm text-green-800">
          <li>✓ Landing page loads at http://localhost:3000</li>
          <li>✓ Sign-up page accessible at /sign-up</li>
          <li>✓ Can create new account</li>
          <li>✓ Dashboard loads after login</li>
          <li>✓ Can create a test branch</li>
        </ul>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/docs/quickstart" className="p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-300">
            <h3 className="font-semibold text-gray-900 mb-1">Quick Start</h3>
            <p className="text-sm text-gray-600">Get up and running quickly</p>
          </Link>
          <Link href="/docs/guides/connectors" className="p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-300">
            <h3 className="font-semibold text-gray-900 mb-1">Setup Connectors</h3>
            <p className="text-sm text-gray-600">Configure notifications</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
