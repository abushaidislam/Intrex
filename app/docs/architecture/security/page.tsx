import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Key, Server, Database, Fingerprint } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security - Intrex Documentation',
  description: 'Security architecture and best practices',
};

const securityLayers = [
  {
    icon: Fingerprint,
    title: 'Authentication',
    description: 'JWT-based session management with secure cookie storage',
    details: [
      'HS256-signed JWT tokens',
      '24-hour session expiration with auto-refresh',
      'HTTP-only, Secure, SameSite=Lax cookies',
      'Password hashing with bcrypt (salt rounds: 10)',
    ],
  },
  {
    icon: Lock,
    title: 'Authorization',
    description: 'Role-based access control with three permission tiers',
    details: [
      'Head Office Admin: Full access',
      'Branch Manager: Branch-scoped access',
      'Operator: Task-level access',
      'Server-side permission enforcement',
    ],
  },
  {
    icon: Database,
    title: 'Data Isolation',
    description: 'Row Level Security ensures tenant data separation',
    details: [
      'RLS policies on all tenant tables',
      'Automatic tenant context injection',
      'Users cannot access other tenant data',
      'Cascading deletes for data cleanup',
    ],
  },
  {
    icon: Key,
    title: 'Encryption',
    description: 'Sensitive data encrypted at rest and in transit',
    details: [
      'AES-256-GCM for connector secrets',
      'TLS 1.2+ for all connections',
      'Database connections encrypted',
      'Webhook HMAC-SHA256 signing',
    ],
  },
];

export default function SecurityPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Security</h1>
        <p className="text-lg text-gray-600">
          Security is built into every layer of Intrex. From authentication to data isolation, 
          we implement defense-in-depth to protect your compliance data.
        </p>
      </div>

      {/* Security Model */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Security Model Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Tenant Isolation</div>
            <div className="text-gray-400">Each customer organization is completely isolated with RLS policies preventing cross-tenant data access.</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Least Privilege</div>
            <div className="text-gray-400">Users receive minimum permissions needed for their role. No elevation without explicit admin action.</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Defense in Depth</div>
            <div className="text-gray-400">Multiple security layers: auth checks, middleware validation, RLS policies, and application logic.</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-2">Audit Trail</div>
            <div className="text-gray-400">Immutable activity logs track all actions with before/after state for compliance auditing.</div>
          </div>
        </div>
      </div>

      {/* Security Layers */}
      <div className="space-y-6">
        {securityLayers.map((layer) => (
          <div key={layer.title} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <layer.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{layer.title}</h2>
                  <p className="text-gray-600">{layer.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {layer.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Session Security */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Session Security</h2>
        <p className="text-gray-600">
          Sessions use industry-standard JWT with secure configuration:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`// Cookie configuration
{
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: 'lax',   // CSRF protection
  maxAge: 86400      // 24 hours
}

// JWT configuration
{
  algorithm: 'HS256',
  expiration: '1 day',
  secret: 32+ characters
}`}</code>
          </pre>
        </div>
      </div>

      {/* RLS Policies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Row Level Security</h2>
        <p className="text-gray-600">
          PostgreSQL RLS policies enforce tenant isolation at the database level:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`-- Example RLS policy
CREATE POLICY tenant_isolation ON obligation_instances
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Applied to all tenant tables:
-- - obligation_instances
-- - branches
-- - domains
-- - connectors
-- - notification_events
-- - etc.`}</code>
          </pre>
        </div>
      </div>

      {/* Connector Security */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Connector Security</h2>
        <p className="text-gray-600">
          Notification connector credentials are encrypted before storage:
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Encryption:</strong> AES-256-GCM with random IV</li>
            <li>• <strong>Key Management:</strong> AUTH_SECRET used as encryption key</li>
            <li>• <strong>Decryption:</strong> Only performed server-side when sending</li>
            <li>• <strong>Storage:</strong> Never store plaintext credentials</li>
          </ul>
        </div>
      </div>

      {/* Webhook Security */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Webhook Security</h2>
        <p className="text-gray-600">
          Outgoing webhooks include HMAC-SHA256 signatures for verification:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`// Webhook payload signature
X-Intrex-Signature: sha256=<hmac_hex>

// Verification (receiver side)
expected = HMAC_SHA256(payload, webhook_secret)
secure_compare(received_signature, expected)`}</code>
          </pre>
        </div>
      </div>

      {/* Security Headers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Security Headers</h2>
        <p className="text-gray-600">
          Application sends security headers on all responses:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin`}</code>
          </pre>
        </div>
      </div>

      {/* Production Hardening */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Production Hardening</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-red-200 bg-red-50">
            <h3 className="font-semibold text-red-900 mb-3">Database Security</h3>
            <ul className="space-y-2 text-sm text-red-800">
              <li>✓ Enable RLS policies on all tables</li>
              <li>✓ Use connection pooling for serverless</li>
              <li>✓ Configure backup retention (7+ days)</li>
              <li>✓ Enable Point-in-Time Recovery (PITR)</li>
              <li>✓ Restrict database access by IP</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-orange-200 bg-orange-50">
            <h3 className="font-semibold text-orange-900 mb-3">Application Security</h3>
            <ul className="space-y-2 text-sm text-orange-800">
              <li>✓ Use strong AUTH_SECRET (32+ chars)</li>
              <li>✓ Enable secure cookie settings</li>
              <li>✓ Configure CORS properly</li>
              <li>✓ Set up rate limiting</li>
              <li>✓ Use production SMTP (not test)</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3">Infrastructure</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ HTTPS with valid SSL certificate</li>
              <li>✓ HSTS headers enabled</li>
              <li>✓ Security headers configured</li>
              <li>✓ Error monitoring (Sentry)</li>
              <li>✓ Logging to external service</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-green-200 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-3">Operational</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Regular security audits</li>
              <li>✓ Dependency updates (monthly)</li>
              <li>✓ Access review (quarterly)</li>
              <li>✓ Incident response plan</li>
              <li>✓ Data retention policies</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Production Checklist */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Pre-Launch Security Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>All environment variables set correctly</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Database RLS policies enabled and tested</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>SMTP credentials verified working</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>SSL certificate valid and auto-renews</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Error monitoring configured</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Database backups enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Cron jobs scheduled and tested</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Security headers verified</span>
            </label>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Security Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <strong>Environment Variables</strong>
            <p>Never commit .env files. Use strong, unique secrets for production. Rotate secrets regularly.</p>
          </div>
          <div>
            <strong>Regular Updates</strong>
            <p>Keep dependencies updated. Monitor security advisories. Enable Dependabot alerts.</p>
          </div>
          <div>
            <strong>Access Review</strong>
            <p>Audit user roles quarterly. Remove unused accounts. Enforce least privilege.</p>
          </div>
          <div>
            <strong>Backup Strategy</strong>
            <p>Regular database backups. Test restore procedures. Store backups in separate region.</p>
          </div>
          <div>
            <strong>Monitoring</strong>
            <p>Set up alerts for failed logins, errors, and anomalies. Monitor SSL expiry.</p>
          </div>
          <div>
            <strong>HTTPS Everywhere</strong>
            <p>Enforce HTTPS in production. Use HSTS headers. Redirect HTTP to HTTPS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
