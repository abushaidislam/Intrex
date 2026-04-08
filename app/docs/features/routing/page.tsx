import { Metadata } from 'next';
import Link from 'next/link';
import { Route, Filter, Target, AlertTriangle, Building2, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notification Routing - Intrex Documentation',
  description: 'Learn about notification routing rules',
};

const severityLevels = [
  { level: 'Low', description: 'Informational, digest-worthy', color: 'bg-gray-100 text-gray-800' },
  { level: 'Medium', description: 'Action needed within lead time', color: 'bg-blue-100 text-blue-800' },
  { level: 'High', description: 'Urgent, due or expiring soon', color: 'bg-orange-100 text-orange-800' },
  { level: 'Critical', description: 'Immediate attention required', color: 'bg-red-100 text-red-800' },
];

const exampleRules = [
  {
    name: 'Critical Alerts to Management',
    condition: 'Severity = Critical',
    action: 'Send to Head Office Admin via Email + Telegram',
    branch: 'All branches',
  },
  {
    name: 'SSL Failures to IT Team',
    condition: 'Event Type = SSL Failure',
    action: 'Send to SSL recipients via Email',
    branch: 'All branches',
  },
  {
    name: 'Branch Manager Alerts',
    condition: 'Event Type = Obligation Due',
    action: 'Send to Branch Manager via preferred channel',
    branch: 'Specific branch',
  },
  {
    name: 'Weekly Digest',
    condition: 'Event Type = Digest',
    action: 'Send summary to all users',
    branch: 'All branches',
  },
];

export default function RoutingDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Notification Routing</h1>
        <p className="text-lg text-gray-600">
          Flexible routing rules that determine which notifications go to which recipients 
          based on event type, severity, and branch scope.
        </p>
      </div>

      {/* How Routing Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Event Matching</h3>
          <p className="text-sm text-gray-600">
            Routes match events based on type (obligation_due, ssl_expiry, etc.) 
            and minimum severity threshold.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Branch Scope</h3>
          <p className="text-sm text-gray-600">
            Routes can be global (all branches) or branch-specific. 
            Allows different alert destinations per location.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Connector Targeting</h3>
          <p className="text-sm text-gray-600">
            Each route specifies a connector (Email, Telegram, etc.) 
            and recipient reference (email, chat_id, etc.).
          </p>
        </div>
      </div>

      {/* Severity Levels */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Severity Levels</h2>
        <p className="text-gray-600">
          Routes use minimum severity thresholds. Events at or above the threshold 
          will be sent through the route.
        </p>
        <div className="flex flex-col gap-3">
          {severityLevels.map((sev) => (
            <div key={sev.level} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${sev.color}`}>
                {sev.level}
              </span>
              <span className="text-sm text-gray-600">{sev.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Structure */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Route Configuration</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`interface NotificationRoute {
  id: uuid;                    // Route identifier
  tenantId: uuid;              // Organization
  branchId: uuid | null;       // Specific branch or all
  connectorId: uuid;           // Channel to use
  eventType: NotificationEventType;  // Event filter
  severityMin: Severity;         // Minimum severity
  recipientRef: string;        // Email, chat_id, webhook URL
  isActive: boolean;            // Enable/disable
}`}</code>
          </pre>
        </div>
      </div>

      {/* Example Rules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Example Routing Rules</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Rule</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Scope</th>
              </tr>
            </thead>
            <tbody>
              {exampleRules.map((rule) => (
                <tr key={rule.name} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{rule.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{rule.condition}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{rule.action}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{rule.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Routing Algorithm */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Route className="w-5 h-5 text-orange-400" />
          Route Resolution Algorithm
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">1. Event Occurs</div>
            <div className="text-gray-400">System generates event with type and severity</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">2. Find Matching Routes</div>
            <div className="text-gray-400">Query routes where: eventType matches AND severityMin {'<='} event severity</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">3. Filter by Branch</div>
            <div className="text-gray-400">Include routes with matching branchId OR global routes (branchId = null)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">4. Create Deliveries</div>
            <div className="text-gray-400">For each matching route, create a delivery via the connector</div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Routing Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5" />
            <span><strong>Create severity-based tiers:</strong> Critical alerts to management, routine to operators</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5" />
            <span><strong>Use multiple channels:</strong> Critical alerts via Email + Telegram for redundancy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5" />
            <span><strong>Branch-specific routes:</strong> Route branch issues to respective managers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5" />
            <span><strong>Test connectors first:</strong> Verify connector health before creating routes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
