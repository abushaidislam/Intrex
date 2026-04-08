import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, UserCheck, Key, Fingerprint } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication - Intrex Documentation',
  description: 'Learn about authentication and authorization in Intrex',
};

const authFeatures = [
  {
    icon: Lock,
    title: 'JWT Session Management',
    description: 'Secure JWT-based sessions with 24-hour expiration. Tokens are signed with HS256 and stored in HTTP-only cookies.',
  },
  {
    icon: UserCheck,
    title: 'Role-Based Access Control',
    description: 'Three-tier hierarchy: Head Office Admin, Branch Manager, and Operator. Each role has scoped permissions.',
  },
  {
    icon: Shield,
    title: 'Row Level Security',
    description: 'Database-level tenant isolation using PostgreSQL RLS policies. Users can only access their tenant data.',
  },
  {
    icon: Key,
    title: 'Password Security',
    description: 'Passwords hashed using bcrypt with salt rounds. Secure comparison to prevent timing attacks.',
  },
];

const roles = [
  {
    name: 'Head Office Admin',
    permissions: [
      'Full access to all branches',
      'Manage users and roles',
      'Configure connectors',
      'View all activity logs',
      'Manage billing/subscription',
    ],
  },
  {
    name: 'Branch Manager',
    permissions: [
      'Manage assigned branch',
      'Create/edit obligations',
      'View branch activity',
      'Acknowledge notifications',
      'Upload compliance documents',
    ],
  },
  {
    name: 'Operator',
    permissions: [
      'View assigned obligations',
      'Update obligation status',
      'Upload documents',
      'View own notifications',
    ],
  },
];

export default function AuthDocsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Authentication & Authorization</h1>
        <p className="text-lg text-gray-600">
          Intrex implements a comprehensive security model with JWT sessions, 
          role-based access control, and database-level tenant isolation.
        </p>
      </div>

      {/* Auth Flow Diagram */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-orange-400" />
          Authentication Flow
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">1. Sign In</div>
            <div className="text-gray-400">Email + Password</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">2. Verify</div>
            <div className="text-gray-400">bcrypt compare</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">3. Issue JWT</div>
            <div className="text-gray-400">HS256 signed token</div>
          </div>
          <div className="text-gray-500">→</div>
          <div className="bg-gray-800 rounded-lg p-4 text-center flex-1">
            <div className="text-orange-400 font-medium">4. Set Cookie</div>
            <div className="text-gray-400">HTTP-only, Secure</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {authFeatures.map((feature) => (
          <div key={feature.title} className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
              <feature.icon className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Roles Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">User Roles</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900 align-top">{role.name}</td>
                  <td className="py-4 px-4">
                    <ul className="space-y-1">
                      {role.permissions.map((perm) => (
                        <li key={perm} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-orange-400 rounded-full" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
        <p className="text-gray-600">
          Sessions are managed using JWT tokens with automatic refresh on each GET request:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`// Middleware refreshes sessions automatically
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  
  if (sessionCookie && request.method === 'GET') {
    const parsed = await verifyToken(sessionCookie.value);
    // Refresh session for another 24 hours
    res.cookies.set({
      name: 'session',
      value: await signToken({ ...parsed, expires: newDate }),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }
}`}</code>
          </pre>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Required Environment Variables</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">AUTH_SECRET</code>
            <span className="text-blue-800">32+ character random string for JWT signing</span>
          </div>
          <div className="flex gap-4">
            <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">POSTGRES_URL</code>
            <span className="text-blue-800">Supabase PostgreSQL connection string</span>
          </div>
        </div>
      </div>
    </div>
  );
}
