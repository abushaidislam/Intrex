import { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Server, Shield, Database, Bell, Globe, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Reference - Intrex Documentation',
  description: 'Complete API reference for Intrex',
};

const apiCategories = [
  {
    icon: Building2,
    name: 'Branches',
    basePath: '/api/branches',
    endpoints: [
      { method: 'GET', path: '/api/branches', description: 'List all branches' },
      { method: 'POST', path: '/api/branches', description: 'Create a new branch' },
      { method: 'PATCH', path: '/api/branches/:id', description: 'Update branch' },
      { method: 'DELETE', path: '/api/branches/:id', description: 'Delete branch' },
    ],
  },
  {
    icon: Database,
    name: 'Obligations',
    basePath: '/api/obligations',
    endpoints: [
      { method: 'GET', path: '/api/obligations', description: 'List obligations with filters' },
      { method: 'POST', path: '/api/obligations', description: 'Create obligation' },
      { method: 'PATCH', path: '/api/obligations/:id', description: 'Update obligation' },
      { method: 'DELETE', path: '/api/obligations/:id', description: 'Delete obligation' },
      { method: 'POST', path: '/api/obligations/:id/complete', description: 'Mark as complete' },
      { method: 'POST', path: '/api/obligations/:id/documents', description: 'Upload document' },
      { method: 'POST', path: '/api/obligations/import', description: 'Bulk import' },
    ],
  },
  {
    icon: Globe,
    name: 'Domains',
    basePath: '/api/domains',
    endpoints: [
      { method: 'GET', path: '/api/domains', description: 'List monitored domains' },
      { method: 'POST', path: '/api/domains', description: 'Add domain' },
      { method: 'DELETE', path: '/api/domains/:id', description: 'Remove domain' },
      { method: 'POST', path: '/api/domains/:id/check', description: 'Manual SSL check' },
      { method: 'GET', path: '/api/domains/:id/history', description: 'Check history' },
      { method: 'POST', path: '/api/domains/import', description: 'Bulk import' },
    ],
  },
  {
    icon: Bell,
    name: 'Notifications',
    basePath: '/api/notifications',
    endpoints: [
      { method: 'GET', path: '/api/notifications', description: 'List notifications' },
      { method: 'POST', path: '/api/notifications/:id/acknowledge', description: 'Acknowledge' },
      { method: 'GET', path: '/api/notifications/stats', description: 'Statistics' },
    ],
  },
  {
    icon: Code2,
    name: 'Connectors',
    basePath: '/api/connectors',
    endpoints: [
      { method: 'GET', path: '/api/connectors', description: 'List connectors' },
      { method: 'POST', path: '/api/connectors', description: 'Create connector' },
      { method: 'PATCH', path: '/api/connectors/:id', description: 'Update connector' },
      { method: 'DELETE', path: '/api/connectors/:id', description: 'Delete connector' },
      { method: 'POST', path: '/api/connectors/:id/verify', description: 'Verify connector' },
      { method: 'GET', path: '/api/connectors/health', description: 'Health check' },
    ],
  },
  {
    icon: Server,
    name: 'System',
    basePath: '/api',
    endpoints: [
      { method: 'GET', path: '/api/user', description: 'Current user info' },
      { method: 'GET', path: '/api/dashboard', description: 'Dashboard stats' },
      { method: 'GET', path: '/api/audit-logs', description: 'Activity logs' },
      { method: 'GET', path: '/api/jurisdictions', description: 'List jurisdictions' },
      { method: 'GET', path: '/api/health', description: 'Health check' },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500',
  POST: 'bg-green-500',
  PATCH: 'bg-yellow-500',
  DELETE: 'bg-red-500',
};

export default function APIReferencePage() {
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
        <h1 className="text-4xl font-bold text-gray-900">API Reference</h1>
        <p className="text-lg text-gray-600">
          Complete reference for all REST API endpoints. All APIs require authentication via 
          session cookie and enforce tenant isolation.
        </p>
      </div>

      {/* Authentication */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Authentication
        </h3>
        <p className="text-gray-400 mb-4">
          All API requests must include a valid session cookie. The session is established 
          during sign-in and automatically refreshed by the middleware.
        </p>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-orange-400 font-medium mb-2">Session Cookie</div>
          <code className="text-sm text-gray-300">Cookie: session=&lt;jwt-token&gt;</code>
        </div>
      </div>

      {/* Response Format */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Response Format</h2>
        <p className="text-gray-600">
          All API responses are JSON. Success responses return data directly; error responses 
          include a message field.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-green-400 font-medium mb-2">Success (200)</div>
            <pre className="text-sm text-gray-300 font-mono">
              <code>{`{
  "id": "...",
  "name": "Branch Name",
  "status": "active"
}`}</code>
            </pre>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-red-400 font-medium mb-2">Error (4xx/5xx)</div>
            <pre className="text-sm text-gray-300 font-mono">
              <code>{`{
  "error": "Not found",
  "message": "Branch not found"
}`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* API Categories */}
      <div className="space-y-8">
        {apiCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <div className="flex items-center gap-3">
              <category.icon className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <code className="text-sm text-gray-500">{category.basePath}</code>
            </div>
            <div className="space-y-2">
              {category.endpoints.map((endpoint) => (
                <div 
                  key={endpoint.path} 
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white hover:border-orange-300 transition-colors"
                >
                  <span className={`px-2 py-1 text-white text-xs rounded font-medium ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                  <span className="text-sm text-gray-500 ml-auto">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Query Parameters */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Common Query Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">limit</td>
                <td className="py-3 px-4 text-sm text-gray-600">integer</td>
                <td className="py-3 px-4 text-sm text-gray-600">Number of results (default: 20, max: 100)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">offset</td>
                <td className="py-3 px-4 text-sm text-gray-600">integer</td>
                <td className="py-3 px-4 text-sm text-gray-600">Pagination offset</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">status</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">Filter by status</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">branchId</td>
                <td className="py-3 px-4 text-sm text-gray-600">uuid</td>
                <td className="py-3 px-4 text-sm text-gray-600">Filter by branch</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">from</td>
                <td className="py-3 px-4 text-sm text-gray-600">date</td>
                <td className="py-3 px-4 text-sm text-gray-600">Start date filter</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">to</td>
                <td className="py-3 px-4 text-sm text-gray-600">date</td>
                <td className="py-3 px-4 text-sm text-gray-600">End date filter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Codes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Error Codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">400</span>
              <span className="font-medium text-gray-900">Bad Request</span>
            </div>
            <p className="text-sm text-gray-600">Invalid request parameters or missing required fields</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">401</span>
              <span className="font-medium text-gray-900">Unauthorized</span>
            </div>
            <p className="text-sm text-gray-600">Invalid or expired session</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">403</span>
              <span className="font-medium text-gray-900">Forbidden</span>
            </div>
            <p className="text-sm text-gray-600">Insufficient permissions for this action</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">404</span>
              <span className="font-medium text-gray-900">Not Found</span>
            </div>
            <p className="text-sm text-gray-600">Requested resource does not exist</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">409</span>
              <span className="font-medium text-gray-900">Conflict</span>
            </div>
            <p className="text-sm text-gray-600">Resource already exists or conflict in operation</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">429</span>
              <span className="font-medium text-gray-900">Rate Limited</span>
            </div>
            <p className="text-sm text-gray-600">Too many requests, please slow down</p>
          </div>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Rate Limiting</h3>
        <p className="text-blue-800 mb-4">
          API endpoints are rate-limited to prevent abuse. Limits vary by endpoint:
        </p>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• General API: 100 requests per minute per user</li>
          <li>• Auth endpoints: 10 requests per minute per IP</li>
          <li>• Webhook receivers: 1000 requests per minute per tenant</li>
        </ul>
      </div>
    </div>
  );
}
