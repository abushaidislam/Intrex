import { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardCheck, Repeat, Calendar, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compliance Tracking - Intrex Documentation',
  description: 'Learn about obligation tracking and compliance management',
};

const categories = [
  { name: 'Trade License', description: 'Business trade license renewals and registrations', color: 'bg-blue-100 text-blue-800' },
  { name: 'Fire Safety', description: 'Fire safety certificates and inspection renewals', color: 'bg-red-100 text-red-800' },
  { name: 'Tax/VAT', description: 'Tax returns, VAT filings, and related compliance', color: 'bg-green-100 text-green-800' },
  { name: 'Environmental Permit', description: 'Environmental and pollution control permits', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Inspection/Renewal', description: 'General inspections and renewal obligations', color: 'bg-purple-100 text-purple-800' },
];

const statuses = [
  { name: 'Upcoming', description: 'Due date is in the future, within lead time', color: 'bg-gray-100 text-gray-800' },
  { name: 'Due Today', description: 'Due date is today', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Overdue', description: 'Past the due date (including grace period)', color: 'bg-red-100 text-red-800' },
  { name: 'Completed', description: 'Marked as completed with proof uploaded', color: 'bg-green-100 text-green-800' },
  { name: 'Waived', description: 'Exceptionally waived or not applicable', color: 'bg-blue-100 text-blue-800' },
];

const recurrenceTypes = [
  { type: 'annual', description: 'Once per year (e.g., yearly license renewal)' },
  { type: 'semiannual', description: 'Twice per year (every 6 months)' },
  { type: 'quarterly', description: 'Four times per year (every 3 months)' },
  { type: 'monthly', description: 'Monthly recurring obligations' },
  { type: 'custom', description: 'Custom interval defined in days' },
];

export default function ObligationsDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Compliance Tracking</h1>
        <p className="text-lg text-gray-600">
          Track regulatory obligations, trade licenses, fire safety certificates, and other compliance 
          deadlines across all your branches with automated recurrence and smart notifications.
        </p>
      </div>

      {/* Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Obligation Templates</h3>
          <p className="text-sm text-gray-600 mb-3">
            Reusable compliance rule definitions that can be applied across branches. 
            Templates define the category, recurrence pattern, default lead time, and severity.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Jurisdiction-specific rules</li>
            <li>• Configurable recurrence</li>
            <li>• Severity-based routing</li>
          </ul>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Obligation Instances</h3>
          <p className="text-sm text-gray-600 mb-3">
            Actual compliance items created from templates or manually. Each instance has 
            a specific due date, status, and can have documents attached as proof.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Branch-specific assignments</li>
            <li>• Document attachments</li>
            <li>• Status tracking</li>
          </ul>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Obligation Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="p-4 rounded-lg border border-gray-200 bg-white">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${cat.color}`}>
                {cat.name}
              </span>
              <p className="text-sm text-gray-600">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Statuses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Status Lifecycle</h2>
        <div className="flex flex-col gap-3">
          {statuses.map((status) => (
            <div key={status.name} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.name}
              </span>
              <span className="text-sm text-gray-600">{status.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recurrence */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Recurrence Patterns</h2>
        <p className="text-gray-600">
          When an obligation is completed, the system can automatically generate the next instance 
          based on the recurrence rule. This ensures you never miss recurring compliance deadlines.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody>
              {recurrenceTypes.map((rt) => (
                <tr key={rt.type} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900 capitalize">{rt.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{rt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Obligation Lifecycle</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">1. Create</div>
            <div className="text-gray-400">From template or manual</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">2. Track</div>
            <div className="text-gray-400">Due date approaching</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">3. Notify</div>
            <div className="text-gray-400">Alert sent via routes</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">4. Complete</div>
            <div className="text-gray-400">Proof uploaded</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">5. Recur</div>
            <div className="text-gray-400">Next instance created</div>
          </div>
        </div>
      </div>

      {/* Document Management */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Document Attachments
        </h3>
        <p className="text-blue-800 mb-4">
          Upload compliance proof (certificates, renewals, inspection reports) to obligation instances. 
          Documents are stored securely in Supabase Storage with tenant isolation.
        </p>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-600 rounded-full" />
            Supported formats: PDF, images, documents
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-600 rounded-full" />
            Size limits configurable per tenant
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-600 rounded-full" />
            Access controlled by user role
          </li>
        </ul>
      </div>
    </div>
  );
}
