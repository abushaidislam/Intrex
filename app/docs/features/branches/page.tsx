import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, Users, Globe, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Branch Management - Intrex Documentation',
  description: 'Learn about multi-branch organization structure',
};

export default function BranchesDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Branch Management</h1>
        <p className="text-lg text-gray-600">
          Manage multiple business locations with hierarchical organization structure. 
          Each branch can have its own compliance obligations, SSL domains, and notification routes.
        </p>
      </div>

      {/* Organization Structure */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-400" />
          Organization Hierarchy
        </h3>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-orange-500 text-white rounded-lg px-6 py-3 font-medium">
            Tenant (Organization)
          </div>
          <div className="text-gray-500">▼</div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="bg-gray-800 text-gray-300 rounded-lg px-4 py-3 text-center text-sm">
              <Building2 className="w-4 h-4 mx-auto mb-1" />
              Head Office
            </div>
            <div className="bg-gray-800 text-gray-300 rounded-lg px-4 py-3 text-center text-sm">
              <Building2 className="w-4 h-4 mx-auto mb-1" />
              Branch A
            </div>
            <div className="bg-gray-800 text-gray-300 rounded-lg px-4 py-3 text-center text-sm">
              <Building2 className="w-4 h-4 mx-auto mb-1" />
              Branch B
            </div>
          </div>
        </div>
      </div>

      {/* Branch Fields */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Branch Properties</h2>
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
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">code</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">Unique branch code (e.g., HQ-001, BR-DHK-01)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">name</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">Display name of the branch</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">addressLine</td>
                <td className="py-3 px-4 text-sm text-gray-600">text</td>
                <td className="py-3 px-4 text-sm text-gray-600">Full street address</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">cityCorporation</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">City corporation (e.g., Dhaka North, Chattogram)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">district</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">District name for jurisdiction rules</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">region</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">Region/division</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">countryCode</td>
                <td className="py-3 px-4 text-sm text-gray-600">string</td>
                <td className="py-3 px-4 text-sm text-gray-600">ISO country code (default: BD)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm text-orange-600">status</td>
                <td className="py-3 px-4 text-sm text-gray-600">enum</td>
                <td className="py-3 px-4 text-sm text-gray-600">active, inactive, archived</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Jurisdiction Support</h3>
          <p className="text-sm text-gray-600">
            Branches are linked to jurisdictions for applying location-specific compliance templates. 
            City corporations and districts determine which obligation templates apply.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Globe className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">SSL Domain Assignment</h3>
          <p className="text-sm text-gray-600">
            Domains can be assigned to specific branches for organized SSL monitoring. 
            Each branch can have multiple associated domains.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">User Assignment</h3>
          <p className="text-sm text-gray-600">
            Users can be associated with branches through roles. Branch Managers see only their 
            assigned branches, while Head Office Admins see all.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Branch-Specific Routes</h3>
          <p className="text-sm text-gray-600">
            Notification routes can be configured per branch, allowing different alert 
            destinations for different locations.
          </p>
        </div>
      </div>

      {/* API Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">API Endpoints</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-medium">GET</span>
              <code className="text-gray-300">/api/branches</code>
            </div>
            <p className="text-sm text-gray-400">List all branches for the current tenant</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-medium">POST</span>
              <code className="text-gray-300">/api/branches</code>
            </div>
            <p className="text-sm text-gray-400">Create a new branch</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded font-medium">PATCH</span>
              <code className="text-gray-300">/api/branches/:id</code>
            </div>
            <p className="text-sm text-gray-400">Update branch details</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-medium">DELETE</span>
              <code className="text-gray-300">/api/branches/:id</code>
            </div>
            <p className="text-sm text-gray-400">Delete a branch (cascades to related data)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
