import { Metadata } from 'next';
import Link from 'next/link';
import { Database, Table, Key, Link2, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Database Schema - Intrex Documentation',
  description: 'Complete database schema documentation',
};

const tables = [
  {
    name: 'tenants',
    description: 'Customer organizations',
    fields: ['id (uuid PK)', 'name (varchar)', 'status', 'stripeCustomerId', 'planName', 'createdAt'],
    relations: ['users', 'branches', 'domains', 'connectors'],
  },
  {
    name: 'users',
    description: 'Application users with roles',
    fields: ['id (serial PK)', 'tenantId (FK)', 'email', 'passwordHash', 'role (enum)', 'status'],
    relations: ['tenant', 'obligationInstances', 'acknowledgements'],
  },
  {
    name: 'branches',
    description: 'Business locations',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'code', 'name', 'cityCorporation', 'district', 'region'],
    relations: ['tenant', 'obligationInstances', 'domains'],
  },
  {
    name: 'jurisdictions',
    description: 'Geographic compliance zones',
    fields: ['id (uuid PK)', 'countryCode', 'region', 'district', 'cityCorporation', 'label'],
    relations: ['obligationTemplates'],
  },
  {
    name: 'obligation_templates',
    description: 'Reusable compliance rules',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'jurisdictionId (FK)', 'category', 'title', 'recurrenceType', 'severity'],
    relations: ['tenant', 'jurisdiction', 'instances'],
  },
  {
    name: 'obligation_instances',
    description: 'Actual compliance items',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'branchId (FK)', 'templateId (FK)', 'category', 'status', 'dueAt', 'completedAt'],
    relations: ['tenant', 'branch', 'template', 'documents'],
  },
  {
    name: 'obligation_documents',
    description: 'Proof attachments',
    fields: ['id (uuid PK)', 'obligationInstanceId (FK)', 'storageKey', 'filename', 'mimeType', 'sizeBytes'],
    relations: ['obligationInstance'],
  },
  {
    name: 'domains',
    description: 'SSL-monitored domains',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'branchId (FK)', 'hostname', 'port', 'status', 'lastCheckedAt'],
    relations: ['tenant', 'branch', 'sslCheckResults'],
  },
  {
    name: 'ssl_check_results',
    description: 'SSL check history',
    fields: ['id (uuid PK)', 'domainId (FK)', 'checkStatus', 'validFrom', 'validTo', 'daysRemaining', 'issuerCn'],
    relations: ['domain'],
  },
  {
    name: 'connectors',
    description: 'Notification channels',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'type (enum)', 'name', 'status', 'configEncryptedJson'],
    relations: ['tenant', 'routes'],
  },
  {
    name: 'notification_routes',
    description: 'Routing rules',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'branchId (FK)', 'connectorId (FK)', 'eventType', 'severityMin', 'recipientRef'],
    relations: ['tenant', 'branch', 'connector'],
  },
  {
    name: 'notification_events',
    description: 'Queued notifications',
    fields: ['id (uuid PK)', 'tenantId (FK)', 'eventType', 'fingerprint', 'payloadJson', 'scheduledFor', 'status'],
    relations: ['tenant', 'deliveries', 'acknowledgement'],
  },
  {
    name: 'notification_deliveries',
    description: 'Delivery attempts',
    fields: ['id (uuid PK)', 'notificationEventId (FK)', 'connectorId (FK)', 'attemptNo', 'deliveryStatus', 'sentAt'],
    relations: ['notificationEvent', 'connector'],
  },
  {
    name: 'acknowledgements',
    description: 'User acknowledgments',
    fields: ['id (uuid PK)', 'notificationEventId (FK)', 'ackByUserId (FK)', 'ackNote', 'ackAt'],
    relations: ['notificationEvent', 'user'],
  },
  {
    name: 'activity_logs',
    description: 'Audit trail',
    fields: ['id (serial PK)', 'tenantId (FK)', 'userId (FK)', 'action', 'entityType', 'entityId', 'beforeJson', 'afterJson'],
    relations: ['tenant', 'user'],
  },
];

const enums = [
  { name: 'app_role', values: ['head_office_admin', 'branch_manager', 'operator'] },
  { name: 'obligation_category', values: ['trade_license', 'fire_safety', 'tax_vat', 'environmental_permit', 'inspection_renewal'] },
  { name: 'obligation_status', values: ['upcoming', 'due_today', 'overdue', 'completed', 'waived'] },
  { name: 'severity', values: ['low', 'medium', 'high', 'critical'] },
  { name: 'connector_type', values: ['email_smtp', 'telegram_bot', 'whatsapp_business', 'webhook'] },
  { name: 'connector_status', values: ['active', 'disabled', 'error', 'pending_verification'] },
  { name: 'ssl_check_status', values: ['ok', 'warning', 'expired', 'handshake_failed', 'dns_failed', 'timeout', 'hostname_mismatch'] },
  { name: 'notification_event_type', values: ['obligation_due', 'obligation_overdue', 'ssl_expiry', 'ssl_failure', 'digest'] },
  { name: 'notification_status', values: ['queued', 'processing', 'sent', 'failed', 'cancelled', 'acked', 'dead_letter'] },
];

export default function DatabaseSchemaPage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Database Schema</h1>
        <p className="text-lg text-gray-600">
          Complete reference of all database tables, relationships, and enums in the Intrex schema.
        </p>
      </div>

      {/* Entity Relationship Overview */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-orange-400" />
          Entity Relationships
        </h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p><span className="text-orange-400">tenants</span> → users, branches, domains, connectors, templates, instances</p>
          <p><span className="text-orange-400">branches</span> → obligation_instances, domains, notification_routes</p>
          <p><span className="text-orange-400">obligation_templates</span> → obligation_instances</p>
          <p><span className="text-orange-400">obligation_instances</span> → obligation_documents</p>
          <p><span className="text-orange-400">domains</span> → ssl_check_results</p>
          <p><span className="text-orange-400">connectors</span> → notification_routes, notification_deliveries</p>
          <p><span className="text-orange-400">notification_events</span> → notification_deliveries, acknowledgements</p>
        </div>
      </div>

      {/* Tables */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Tables</h2>
        <div className="grid grid-cols-1 gap-4">
          {tables.map((table) => (
            <div key={table.name} className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <Table className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900 font-mono">{table.name}</h3>
                <span className="text-sm text-gray-500">— {table.description}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Fields:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {table.fields.map((field) => (
                      <code key={field} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {field}
                      </code>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Relations:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {table.relations.map((rel) => (
                      <span key={rel} className="text-xs text-orange-600">
                        {rel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enums */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Enumerations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enums.map((enumItem) => (
            <div key={enumItem.name} className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-orange-500" />
                <code className="font-semibold text-orange-600">{enumItem.name}</code>
              </div>
              <div className="flex flex-wrap gap-2">
                {enumItem.values.map((value) => (
                  <span key={value} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RLS Note */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Row Level Security
        </h3>
        <p className="text-green-800 mb-4">
          All tenant-scoped tables have RLS policies enforced. Users can only access rows where 
          <code className="bg-green-100 px-2 py-1 rounded mx-1">tenantId</code> 
          matches their session tenant.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`-- Example RLS Policy
CREATE POLICY tenant_isolation ON obligation_instances
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);`}</code>
          </pre>
        </div>
      </div>

      {/* Indexes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Key Indexes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Table</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Index</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">obligation_instances</td>
                <td className="py-3 px-4 font-mono text-sm">(tenant_id, status, due_at)</td>
                <td className="py-3 px-4 text-sm text-gray-600">Dashboard filtering</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">notification_events</td>
                <td className="py-3 px-4 font-mono text-sm">(fingerprint)</td>
                <td className="py-3 px-4 text-sm text-gray-600">Deduplication</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">ssl_check_results</td>
                <td className="py-3 px-4 font-mono text-sm">(domain_id, checked_at)</td>
                <td className="py-3 px-4 text-sm text-gray-600">History queries</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-mono text-sm">activity_logs</td>
                <td className="py-3 px-4 font-mono text-sm">(tenant_id, timestamp)</td>
                <td className="py-3 px-4 text-sm text-gray-600">Audit queries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
