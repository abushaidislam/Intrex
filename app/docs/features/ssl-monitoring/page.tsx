import { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Shield, Clock, AlertTriangle, CheckCircle, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SSL Monitoring - Intrex Documentation',
  description: 'Learn about SSL certificate monitoring and expiry alerts',
};

const checkStatuses = [
  { name: 'OK', description: 'Certificate valid and not expiring soon', color: 'bg-green-100 text-green-800' },
  { name: 'Warning', description: 'Valid but expiring within threshold', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Expired', description: 'Certificate has expired', color: 'bg-red-100 text-red-800' },
  { name: 'Handshake Failed', description: 'TLS handshake could not complete', color: 'bg-red-100 text-red-800' },
  { name: 'DNS Failed', description: 'Domain name resolution failed', color: 'bg-gray-100 text-gray-800' },
  { name: 'Timeout', description: 'Connection timed out', color: 'bg-gray-100 text-gray-800' },
  { name: 'Hostname Mismatch', description: 'Certificate CN does not match hostname', color: 'bg-red-100 text-red-800' },
];

const sslFields = [
  { field: 'hostname', type: 'string', description: 'Domain name to monitor (e.g., example.com)' },
  { field: 'port', type: 'integer', description: 'Port to check (default: 443)' },
  { field: 'sniHostname', type: 'string', description: 'SNI hostname if different from hostname' },
  { field: 'status', type: 'enum', description: 'active, paused, archived' },
  { field: 'lastCheckedAt', type: 'timestamp', description: 'Last successful check timestamp' },
  { field: 'nextCheckAt', type: 'timestamp', description: 'Scheduled next check timestamp' },
];

export default function SSLMonitoringDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">SSL Certificate Monitoring</h1>
        <p className="text-lg text-gray-600">
          Automated SSL/TLS certificate monitoring with 12-hour check intervals. 
          Get notified before certificates expire to prevent service disruptions.
        </p>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Automated Checks</h3>
          <p className="text-sm text-gray-600">
            Cron job runs every 12 hours to check all monitored domains. 
            Performs TLS handshake and parses certificate details.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Expiry Alerts</h3>
          <p className="text-sm text-gray-600">
            Configurable notification thresholds (default: 30 days before expiry). 
            Escalating severity as expiration approaches.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Failure Detection</h3>
          <p className="text-sm text-gray-600">
            Detects DNS failures, timeouts, handshake errors, and hostname mismatches 
            with immediate high-severity alerts.
          </p>
        </div>
      </div>

      {/* Domain Properties */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Domain Properties</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody>
              {sslFields.map((field) => (
                <tr key={field.field} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm text-orange-600">{field.field}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{field.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Check Result Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkStatuses.map((status) => (
            <div key={status.name} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.name}
              </span>
              <span className="text-sm text-gray-600">{status.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SSL Check Algorithm */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-orange-400" />
          SSL Check Algorithm
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">1. DNS Resolution</div>
            <div className="text-gray-400">Resolve hostname to IP address. If fails → DNS_FAILED</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">2. TCP Connection</div>
            <div className="text-gray-400">Connect to port (default 443) with 10s timeout. If fails → TIMEOUT</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">3. TLS Handshake</div>
            <div className="text-gray-400">Perform TLS handshake and retrieve certificate. If fails → HANDSHAKE_FAILED</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">4. Certificate Validation</div>
            <div className="text-gray-400">Check validity dates, hostname match, and issuer chain</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">5. Store Results</div>
            <div className="text-gray-400">Save to ssl_check_results with parsed certificate data</div>
          </div>
        </div>
      </div>

      {/* Notification Recipients */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          SSL Notification Recipients
        </h3>
        <p className="text-blue-800 mb-4">
          Configure dedicated email recipients for SSL expiry notifications separately from 
          general notification routes. This allows IT teams to receive certificate alerts.
        </p>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Configure via: <code className="bg-blue-100 px-2 py-1 rounded">Settings → SSL Recipients</code></p>
          <p>Set notification lead time: default 30 days before expiry</p>
          <p>Multiple recipients supported with individual lead time preferences</p>
        </div>
      </div>

      {/* Cron Job */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Cron Job Configuration</h2>
        <p className="text-gray-600">
          SSL checks run automatically via Vercel Cron jobs. Configure in vercel.json:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`{
  "crons": [
    {
      "path": "/api/cron/ssl-scan",
      "schedule": "0 */12 * * *"
    }
  ]
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
