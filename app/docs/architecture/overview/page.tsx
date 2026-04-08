import { Metadata } from 'next';
import Link from 'next/link';
import { Layers, Database, Shield, Server, Clock, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'System Architecture - Intrex Documentation',
  description: 'Learn about the system architecture and components',
};

const architectureLayers = [
  {
    icon: Shield,
    title: 'Security Layer',
    components: ['JWT Session Management', 'Row Level Security (RLS)', 'Role-Based Access Control', 'Request Rate Limiting'],
  },
  {
    icon: Server,
    title: 'Application Layer',
    components: ['Next.js App Router', 'Server Components', 'Route Handlers', 'Server Actions'],
  },
  {
    icon: Database,
    title: 'Data Layer',
    components: ['PostgreSQL (Supabase)', 'Drizzle ORM', 'Connection Pooling', 'Migrations'],
  },
  {
    icon: Bell,
    title: 'Integration Layer',
    components: ['Email SMTP', 'Telegram Bot API', 'WhatsApp Business', 'Webhooks'],
  },
];

const cronJobs = [
  { endpoint: '/api/cron/ssl-scan', schedule: 'Every 12 hours', purpose: 'Check SSL certificates' },
  { endpoint: '/api/cron/process-notifications', schedule: 'Every 5 minutes', purpose: 'Send queued notifications' },
  { endpoint: '/api/cron/retries', schedule: 'Every 5 minutes', purpose: 'Retry failed deliveries' },
  { endpoint: '/api/cron/recurrence', schedule: 'Daily at 2 AM', purpose: 'Generate recurring obligations' },
];

export default function ArchitectureOverviewPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">System Architecture</h1>
        <p className="text-lg text-gray-600">
          Intrex follows a modern serverless architecture built on Next.js, Supabase, and Vercel. 
          Designed for multi-tenant SaaS with security and scalability in mind.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-400" />
          Architecture Overview
        </h3>
        <div className="space-y-4">
          {/* Client Layer */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Client Layer</div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>Next.js Client Components</span>
              <span>•</span>
              <span>SWR Data Fetching</span>
              <span>•</span>
              <span>Tailwind CSS UI</span>
            </div>
          </div>
          
          {/* Server Layer */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Server Layer (Next.js)</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-gray-400">
                <div className="font-medium text-gray-300">App Router</div>
                <div>Server Components</div>
                <div>Route Handlers</div>
              </div>
              <div className="text-gray-400">
                <div className="font-medium text-gray-300">Auth & Security</div>
                <div>JWT Sessions</div>
                <div>RBAC Middleware</div>
              </div>
              <div className="text-gray-400">
                <div className="font-medium text-gray-300">Background Jobs</div>
                <div>Cron Endpoints</div>
                <div>Edge Functions</div>
              </div>
            </div>
          </div>
          
          {/* Data Layer */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Data Layer</div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>Supabase Postgres</span>
              <span>•</span>
              <span>Drizzle ORM</span>
              <span>•</span>
              <span>RLS Policies</span>
              <span>•</span>
              <span>Supabase Storage</span>
            </div>
          </div>
          
          {/* External Services */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">External Services</div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>SMTP Servers</span>
              <span>•</span>
              <span>Telegram API</span>
              <span>•</span>
              <span>WhatsApp Business</span>
              <span>•</span>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {architectureLayers.map((layer) => (
          <div key={layer.title} className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <layer.icon className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{layer.title}</h3>
            </div>
            <ul className="space-y-2">
              {layer.components.map((component) => (
                <li key={component} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-orange-400 rounded-full" />
                  {component}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Cron Jobs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Background Jobs</h2>
        </div>
        <p className="text-gray-600">
          Vercel Cron jobs handle periodic tasks like SSL checks, notifications, and recurrence generation.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Endpoint</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Schedule</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {cronJobs.map((job) => (
                <tr key={job.endpoint} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm text-orange-600">{job.endpoint}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.schedule}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{job.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Model */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Security Model</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>
            <strong>Tenant Isolation:</strong> Row Level Security policies ensure users can only 
            access data belonging to their tenant.
          </p>
          <p>
            <strong>Authentication:</strong> JWT-based sessions with HTTP-only cookies, 
            secure flag, and SameSite=Lax.
          </p>
          <p>
            <strong>Authorization:</strong> Three-tier role system (Head Office Admin, Branch Manager, Operator) 
            with server-side enforcement.
          </p>
          <p>
            <strong>Encryption:</strong> Connector credentials encrypted at rest using AES-256-GCM.
          </p>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
            <div className="font-medium text-gray-900">Frontend</div>
            <div className="text-sm text-gray-600">Next.js 15</div>
            <div className="text-sm text-gray-600">React 19</div>
            <div className="text-sm text-gray-600">Tailwind CSS 4</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
            <div className="font-medium text-gray-900">Backend</div>
            <div className="text-sm text-gray-600">Next.js API</div>
            <div className="text-sm text-gray-600">Drizzle ORM</div>
            <div className="text-sm text-gray-600">jose (JWT)</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
            <div className="font-medium text-gray-900">Database</div>
            <div className="text-sm text-gray-600">PostgreSQL</div>
            <div className="text-sm text-gray-600">Supabase</div>
            <div className="text-sm text-gray-600">RLS Policies</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
            <div className="font-medium text-gray-900">Deployment</div>
            <div className="text-sm text-gray-600">Vercel</div>
            <div className="text-sm text-gray-600">Cron Jobs</div>
            <div className="text-sm text-gray-600">Edge Runtime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
