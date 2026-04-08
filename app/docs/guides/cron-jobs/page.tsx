import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Globe, Bell, Repeat, Server, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cron Jobs - Intrex Documentation',
  description: 'Background job configuration and monitoring',
};

const cronJobs = [
  {
    name: 'SSL Certificate Scan',
    icon: Globe,
    schedule: 'Every 12 hours',
    cron: '0 */12 * * *',
    endpoint: '/api/cron/ssl-scan',
    description: 'Checks SSL/TLS certificates for all monitored domains and stores results.',
    actions: [
      'Retrieves all active domains from database',
      'Performs TLS handshake for each domain',
      'Parses certificate details (issuer, validity, SANs)',
      'Stores check results with status',
      'Creates notification events for expiring/failed certificates',
    ],
  },
  {
    name: 'Process Notifications',
    icon: Bell,
    schedule: 'Every 5 minutes',
    cron: '*/5 * * * *',
    endpoint: '/api/cron/process-notifications',
    description: 'Processes queued notification events and sends them through configured connectors.',
    actions: [
      'Queries queued notification events',
      'Resolves notification routes for each event',
      'Sends via Email, Telegram, WhatsApp, or Webhook',
      'Updates delivery status',
      'Creates retry entries for failed deliveries',
    ],
  },
  {
    name: 'Retry Failed Notifications',
    icon: Repeat,
    schedule: 'Every 5 minutes',
    cron: '*/5 * * * *',
    endpoint: '/api/cron/retries',
    description: 'Retries failed notification deliveries with exponential backoff.',
    actions: [
      'Finds failed notifications eligible for retry',
      'Checks retry count (max 5 attempts)',
      'Applies exponential backoff delay',
      'Attempts redelivery',
      'Moves to dead letter after max retries',
    ],
  },
  {
    name: 'Generate Recurring Obligations',
    icon: Clock,
    schedule: 'Daily at 2 AM',
    cron: '0 2 * * *',
    endpoint: '/api/cron/recurrence',
    description: 'Creates next instances of recurring obligations when current ones are completed.',
    actions: [
      'Finds completed obligations with recurrence rules',
      'Calculates next due date based on recurrence type',
      'Creates new obligation instance',
      'Copies template configuration',
      'Assigns to same branch and owner',
    ],
  },
];

export default function CronJobsGuidePage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Cron Jobs</h1>
        <p className="text-lg text-gray-600">
          Background jobs run on scheduled intervals to handle SSL monitoring, notification 
          delivery, and obligation recurrence. Configured via Vercel Cron or compatible scheduler.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-orange-400" />
          Background Job Architecture
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">1. Scheduling</div>
            <div className="text-gray-400">Vercel Cron triggers endpoints at configured intervals</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">2. Execution</div>
            <div className="text-gray-400">Route handlers process jobs server-side</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">3. Queue Management</div>
            <div className="text-gray-400">Database-backed queues with locking prevent duplicate processing</div>
          </div>
        </div>
      </div>

      {/* Cron Jobs */}
      <div className="space-y-6">
        {cronJobs.map((job) => (
          <div key={job.name} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <job.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{job.name}</h2>
                  <p className="text-gray-600">{job.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{job.schedule}</div>
                  <code className="text-xs text-gray-500">{job.cron}</code>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Endpoint: </span>
                <code className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">{job.endpoint}</code>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                <ul className="space-y-2">
                  {job.actions.map((action, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vercel Configuration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          Vercel Configuration
        </h2>
        <p className="text-gray-600">
          Cron jobs are configured in <code className="bg-gray-100 px-2 py-1 rounded">vercel.json</code>:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`{
  "crons": [
    {
      "path": "/api/cron/ssl-scan",
      "schedule": "0 */12 * * *"
    },
    {
      "path": "/api/cron/process-notifications",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/retries",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/recurrence",
      "schedule": "0 2 * * *"
    }
  ]
}`}</code>
          </pre>
        </div>
      </div>

      {/* Monitoring */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Monitoring Cron Jobs</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>
            Monitor job execution in the Vercel dashboard under your project → Cron Jobs. 
            Check for failed executions and review logs for errors.
          </p>
          <p>
            Failed jobs are automatically retried based on the schedule, but persistent 
            failures should be investigated promptly.
          </p>
        </div>
      </div>

      {/* Self-Hosted */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Self-Hosted Deployment</h2>
        <p className="text-gray-600">
          If not using Vercel, configure cron jobs using your server's scheduler:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`# Linux crontab example
# SSL Scan every 12 hours
0 */12 * * * curl -s https://your-domain.com/api/cron/ssl-scan

# Process notifications every 5 minutes
*/5 * * * * curl -s https://your-domain.com/api/cron/process-notifications

# Retry failed every 5 minutes
*/5 * * * * curl -s https://your-domain.com/api/cron/retries

# Generate recurring daily at 2 AM
0 2 * * * curl -s https://your-domain.com/api/cron/recurrence`}</code>
          </pre>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Security:</strong> Consider adding an internal API key check for cron endpoints 
            when self-hosting to prevent unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}
