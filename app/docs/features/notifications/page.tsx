import { Metadata } from 'next';
import Link from 'next/link';
import { Bell, Mail, MessageCircle, Webhook, Send, Clock, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications - Intrex Documentation',
  description: 'Learn about multi-channel notification system',
};

const channels = [
  {
    icon: Mail,
    name: 'Email SMTP',
    description: 'Send notifications via any SMTP provider (Gmail, Outlook, AWS SES, etc.)',
    features: ['HTML & text support', 'Attachment support', 'Custom templates'],
  },
  {
    icon: MessageCircle,
    name: 'Telegram Bot',
    description: 'Send messages via Telegram Bot API to users or groups',
    features: ['Bot token authentication', 'Group/channel support', 'Markdown formatting'],
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp Business',
    description: 'WhatsApp Business API integration for official business messaging',
    features: ['Template messages', 'Session-based messaging', 'Rich media support'],
  },
  {
    icon: Webhook,
    name: 'Webhook',
    description: 'Send events to external systems with HMAC-signed payloads',
    features: ['HMAC SHA-256 signing', 'Custom headers', 'Retry logic'],
  },
];

const eventTypes = [
  { type: 'obligation_due', description: 'Obligation approaching due date', severity: 'medium' },
  { type: 'obligation_overdue', description: 'Obligation past due date', severity: 'high' },
  { type: 'ssl_expiry', description: 'SSL certificate expiring soon', severity: 'high' },
  { type: 'ssl_failure', description: 'SSL check failed', severity: 'critical' },
  { type: 'digest', description: 'Daily/weekly summary digest', severity: 'low' },
];

const notificationStatuses = [
  { name: 'Queued', description: 'Waiting to be processed' },
  { name: 'Processing', description: 'Currently being sent' },
  { name: 'Sent', description: 'Successfully delivered' },
  { name: 'Failed', description: 'Delivery failed, will retry' },
  { name: 'Dead Letter', description: 'Max retries exceeded' },
  { name: 'Acknowledged', description: 'User acknowledged receipt' },
];

export default function NotificationsDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Smart Notifications</h1>
        <p className="text-lg text-gray-600">
          Multi-channel notification system with routing based on event types and severity. 
          Supports Email, Telegram, WhatsApp, and Webhooks with acknowledgment tracking.
        </p>
      </div>

      {/* Channels */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Notification Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((channel) => (
            <div key={channel.name} className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <channel.icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{channel.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
              <ul className="space-y-1">
                {channel.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-1 h-1 bg-orange-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Event Types */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Event Types</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Event Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Default Severity</th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((event) => (
                <tr key={event.type} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm text-orange-600">{event.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{event.description}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Flow */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-orange-400" />
          Notification Flow
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">1. Event Generation</div>
            <div className="text-gray-400">System event triggers (obligation due, SSL expiring, etc.)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">2. Route Resolution</div>
            <div className="text-gray-400">Matching notification routes based on event type, severity, and branch</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">3. Queue & Deduplicate</div>
            <div className="text-gray-400">Events queued with fingerprint deduplication</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">4. Send via Connectors</div>
            <div className="text-gray-400">Process queued events through configured connectors</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">5. Track & Retry</div>
            <div className="text-gray-400">Track delivery status with automatic retry on failure</div>
          </div>
        </div>
      </div>

      {/* Statuses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Notification Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificationStatuses.map((status) => (
            <div key={status.name} className="p-4 rounded-lg border border-gray-200 bg-white">
              <h4 className="font-medium text-gray-900">{status.name}</h4>
              <p className="text-sm text-gray-600">{status.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retry Logic */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Retry & Dead Letter
        </h3>
        <p className="text-blue-800 mb-4">
          Failed notifications are automatically retried with exponential backoff. 
          After max retries, they move to dead letter for manual review.
        </p>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Retry schedule: 1min, 5min, 15min, 30min, 1hour</p>
          <p>• Max retries: 5 attempts</p>
          <p>• Dead letter: Manual review and replay</p>
          <p>• Cron job: <code className="bg-blue-100 px-2 py-1 rounded">/api/cron/retries</code> every 5 minutes</p>
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Acknowledgment Tracking</h2>
        <p className="text-gray-600">
          Users can acknowledge notifications to confirm receipt. This creates an audit trail 
          and prevents repeated alerts for the same issue.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`// Acknowledge notification
POST /api/notifications/:id/acknowledge
{
  "note": "Received, will renew certificate this week"
}

// Response includes:
// - ackByUserId
// - ackAt timestamp
// - ackNote`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
