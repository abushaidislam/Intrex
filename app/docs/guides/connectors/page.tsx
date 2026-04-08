import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, Webhook, Check, AlertTriangle, Key, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Setting up Connectors - Intrex Documentation',
  description: 'Guide to configuring notification connectors',
};

const connectorGuides = [
  {
    icon: Mail,
    name: 'Email SMTP',
    steps: [
      'Navigate to Settings → Connectors',
      'Click "Add Connector" and select Email SMTP',
      'Enter SMTP server details (host, port, username, password)',
      'Configure encryption (TLS/SSL)',
      'Click "Verify" to test the connection',
      'Save and create notification routes',
    ],
    providers: [
      { name: 'Gmail', settings: 'smtp.gmail.com:587, Enable "Less Secure Apps" or use App Password' },
      { name: 'Outlook', settings: 'smtp.office365.com:587, Modern auth supported' },
      { name: 'AWS SES', settings: 'email-smtp.us-east-1.amazonaws.com:587, IAM credentials' },
      { name: 'SendGrid', settings: 'smtp.sendgrid.net:587, API key as password' },
    ],
  },
  {
    icon: MessageCircle,
    name: 'Telegram Bot',
    steps: [
      'Message @BotFather on Telegram',
      'Create new bot with /newbot command',
      'Copy the bot token (keep it secret!)',
      'Navigate to Settings → Connectors',
      'Add Telegram Bot connector and paste token',
      'Verify to confirm bot is working',
    ],
    note: 'To send to a group, add the bot to the group first, then use the chat ID as recipient.',
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp Business',
    steps: [
      'Sign up for WhatsApp Business API via Meta',
      'Complete business verification',
      'Create a WhatsApp Business account',
      'Generate API credentials (Phone Number ID, Business Account ID)',
      'Get access token from Meta Developer Console',
      'Add connector with credentials and verify',
    ],
    note: 'WhatsApp requires approved message templates for business-initiated conversations.',
  },
  {
    icon: Webhook,
    name: 'Webhook',
    steps: [
      'Navigate to Settings → Connectors',
      'Select Webhook connector type',
      'Enter your webhook endpoint URL',
      'Configure custom headers if needed',
      'Set secret for HMAC signature verification',
      'Verify endpoint is accessible and returns 200 OK',
    ],
    security: 'All webhook payloads are signed with HMAC SHA-256 using your secret.',
  },
];

export default function ConnectorsGuidePage() {
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
        <h1 className="text-4xl font-bold text-gray-900">Setting up Connectors</h1>
        <p className="text-lg text-gray-600">
          Connectors are notification channels that allow Intrex to send alerts via Email, 
          Telegram, WhatsApp, or Webhooks. This guide walks you through configuring each type.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Server className="w-5 h-5" />
          What are Connectors?
        </h3>
        <p className="text-blue-800 mb-4">
          Connectors are reusable notification channel configurations. Once set up, you can 
          create multiple notification routes using the same connector to send alerts to 
          different recipients.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <Mail className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-900">Email SMTP</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-900">Telegram</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-900">WhatsApp</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Webhook className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-900">Webhook</div>
          </div>
        </div>
      </div>

      {/* Connector Guides */}
      <div className="space-y-8">
        {connectorGuides.map((guide) => (
          <div key={guide.name} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <guide.icon className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{guide.name}</h2>
            </div>
            
            <ol className="space-y-3">
              {guide.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>

            {'providers' in guide && guide.providers && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Popular Providers</h4>
                <div className="space-y-2">
                  {guide.providers.map((provider) => (
                    <div key={provider.name} className="flex items-center gap-4">
                      <span className="font-medium text-gray-700 w-24">{provider.name}</span>
                      <span className="text-sm text-gray-600">{provider.settings}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {'note' in guide && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-800">{guide.note}</span>
                </div>
              </div>
            )}

            {'security' in guide && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Key className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800">{guide.security}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Testing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Testing Connectors</h2>
        <p className="text-gray-600">
          Always verify your connector before using it in production:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
            <code>{`1. Create connector with credentials
2. Click "Verify" to test connection
3. Check health status in connector list
4. Create a test notification route
5. Trigger a test event
6. Confirm message received`}</code>
          </pre>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Troubleshooting
        </h3>
        <div className="space-y-3 text-sm text-red-800">
          <div>
            <strong>Email: Connection refused</strong>
            <p>Check firewall rules and ensure SMTP port (587/465) is open. Some providers require TLS enabled.</p>
          </div>
          <div>
            <strong>Telegram: Bot not responding</strong>
            <p>Verify token is correct. Ensure bot hasn't been blocked. Check if bot needs to be added to group first.</p>
          </div>
          <div>
            <strong>WhatsApp: Invalid credentials</strong>
            <p>Business verification must be complete. Access token may have expired - generate new one.</p>
          </div>
          <div>
            <strong>Webhook: 403 Forbidden</strong>
            <p>Ensure webhook endpoint allows POST requests. Check firewall and CORS settings.</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Next: Create Notification Routes
        </h3>
        <p className="text-green-800 mb-4">
          Once connectors are set up, create notification routes to define who receives what alerts:
        </p>
        <Link 
          href="/docs/features/routing" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          Learn about Routing
        </Link>
      </div>
    </div>
  );
}
