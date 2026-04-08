import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Shield, Building2, ClipboardCheck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'User Roles - Intrex Documentation',
  description: 'Guide to user roles and permissions',
};

const roles = [
  {
    name: 'Head Office Admin',
    icon: Shield,
    description: 'Full administrative access to the entire organization',
    permissions: [
      { action: 'Manage Users', details: 'Create, edit, delete users across all branches' },
      { action: 'Manage Branches', details: 'Create and configure all branches' },
      { action: 'Manage Templates', details: 'Create obligation templates for entire organization' },
      { action: 'View All Data', details: 'Access obligations, domains, and logs for all branches' },
      { action: 'Configure Connectors', details: 'Setup notification channels' },
      { action: 'Manage Billing', details: 'View and manage subscription details' },
      { action: 'View Activity Logs', details: 'Complete audit trail access' },
    ],
  },
  {
    name: 'Branch Manager',
    icon: Building2,
    description: 'Manage a specific branch and its compliance activities',
    permissions: [
      { action: 'View Branch', details: 'Access assigned branch only' },
      { action: 'Manage Obligations', details: 'Create and edit obligations for their branch' },
      { action: 'Complete Obligations', details: 'Mark items as complete with document upload' },
      { action: 'View Notifications', details: 'See alerts related to their branch' },
      { action: 'Acknowledge Alerts', details: 'Confirm receipt of notifications' },
      { action: 'View Activity', details: 'See activity logs for their branch' },
    ],
    limitations: [
      'Cannot create new branches',
      'Cannot manage other branches',
      'Cannot manage users outside their branch',
      'Cannot configure global connectors',
    ],
  },
  {
    name: 'Operator',
    icon: ClipboardCheck,
    description: 'Basic role for day-to-day compliance tasks',
    permissions: [
      { action: 'View Assigned Obligations', details: 'See obligations assigned to them' },
      { action: 'Update Status', details: 'Update progress on assigned items' },
      { action: 'Upload Documents', details: 'Attach compliance proof documents' },
      { action: 'View Notifications', details: 'Receive and view personal notifications' },
    ],
    limitations: [
      'Cannot create new obligations',
      'Cannot delete records',
      'Cannot view other users data',
      'Limited to assigned tasks only',
    ],
  },
];

export default function RolesGuidePage() {
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
        <h1 className="text-4xl font-bold text-gray-900">User Roles</h1>
        <p className="text-lg text-gray-600">
          Intrex uses a three-tier role system to control access. Each role has specific 
          permissions designed for different responsibilities within your organization.
        </p>
      </div>

      {/* Roles Overview */}
      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.name} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Role Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <role.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{role.name}</h2>
                  <p className="text-gray-600">{role.description}</p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {role.permissions.map((perm) => (
                  <div key={perm.action} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <div className="font-medium text-gray-900">{perm.action}</div>
                      <div className="text-sm text-gray-500">{perm.details}</div>
                    </div>
                  </div>
                ))}
              </div>

              {'limitations' in role && (
                <>
                  <h3 className="font-semibold text-gray-900 mt-6 mb-4">Limitations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {role.limitations.map((limit) => (
                      <div key={limit} className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400 mt-2" />
                        <span className="text-sm text-gray-600">{limit}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Assignment */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Assigning Roles</h2>
        <p className="text-gray-600">
          Roles are assigned when creating or editing users. Only Head Office Admins can 
          assign roles to other users.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`// Role assignment via UI
1. Go to Settings → Team
2. Click "Add User" or edit existing user
3. Select role from dropdown
4. For Branch Manager/Operator, select assigned branch
5. Save changes

// User receives email with login credentials`}</code>
          </pre>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Role Assignment Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Principle of Least Privilege:</strong> Assign the minimum role needed for the job</li>
          <li>• <strong>Head Office Admins:</strong> Limit to 2-3 trusted personnel</li>
          <li>• <strong>Branch Managers:</strong> One per branch for clear accountability</li>
          <li>• <strong>Operators:</strong> Can be multiple per branch for day-to-day tasks</li>
          <li>• <strong>Regular Review:</strong> Audit roles quarterly to ensure appropriate access</li>
        </ul>
      </div>

      {/* Security Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Security Considerations
        </h3>
        <div className="space-y-3 text-sm text-yellow-800">
          <p>
            Role changes take effect immediately. When a user's role is demoted, they may lose 
            access to previously visible data on their next request.
          </p>
          <p>
            Deleted users retain their historical actions in audit logs, but their personal 
            information is anonymized per data retention policies.
          </p>
        </div>
      </div>
    </div>
  );
}
