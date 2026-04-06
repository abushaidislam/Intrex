'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Mail, MessageSquare, Phone, Webhook, TestTube } from 'lucide-react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Connector {
  id: string;
  name: string;
  type: 'email_smtp' | 'telegram_bot' | 'whatsapp_business' | 'webhook';
  status: 'active' | 'disabled' | 'error' | 'pending_verification';
  config: Record<string, unknown>;
  lastVerifiedAt: string | null;
}

const connectorTypeIcons = {
  email_smtp: Mail,
  telegram_bot: MessageSquare,
  whatsapp_business: Phone,
  webhook: Webhook,
};

const connectorTypeLabels = {
  email_smtp: 'Email (SMTP)',
  telegram_bot: 'Telegram Bot',
  whatsapp_business: 'WhatsApp Business',
  webhook: 'Webhook',
};

async function createConnector(
  url: string,
  { arg }: { arg: { name: string; type: string; config: Record<string, unknown> } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create connector');
  return res.json();
}

async function deleteConnector(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete connector');
  return res.json();
}

async function testConnector(
  url: string,
  { arg }: { arg: { testRecipient?: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to test connector');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteConnectorWrapper(_url: string, { arg: targetUrl }: { arg: string }) {
  return deleteConnector(targetUrl);
}

function ConnectorForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<Connector['type']>('email_smtp');
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, unknown>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, config });
  };

  const renderConfigFields = () => {
    switch (type) {
      case 'email_smtp':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">SMTP Host</Label>
                <Input
                  id="host"
                  value={(config.host as string) || ''}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={(config.port as string) || '587'}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="secure"
                checked={(config.secure as boolean) || false}
                onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
              />
              <Label htmlFor="secure">Use TLS/SSL</Label>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={((config.auth as { user?: string })?.user) || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    auth: { ...(config.auth as object), user: e.target.value },
                  })
                }
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={((config.auth as { pass?: string })?.pass) || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    auth: { ...(config.auth as object), pass: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={(config.fromName as string) || ''}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="Compliance OS"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={(config.fromEmail as string) || ''}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                  placeholder="noreply@example.com"
                  required
                />
              </div>
            </div>
          </>
        );
      case 'telegram_bot':
        return (
          <>
            <div>
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                value={(config.botToken as string) || ''}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get this from @BotFather on Telegram
              </p>
            </div>
            <div>
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                value={(config.chatId as string) || ''}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                placeholder="-1001234567890 or @channelname"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Channel or group where notifications will be sent
              </p>
            </div>
          </>
        );
      case 'whatsapp_business':
        return (
          <>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                value={(config.provider as string) || 'twilio'}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="twilio">Twilio</option>
                <option value="messagebird">MessageBird</option>
                <option value="meta">Meta (WhatsApp Business API)</option>
                <option value="custom">Custom Provider</option>
              </select>
            </div>
            {(config.provider === 'twilio' || !config.provider) && (
              <>
                <div>
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    value={(config.accountSid as string) || ''}
                    onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    value={(config.authToken as string) || ''}
                    onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromNumber">From WhatsApp Number</Label>
                  <Input
                    id="fromNumber"
                    value={(config.fromNumber as string) || ''}
                    onChange={(e) => setConfig({ ...config, fromNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </>
            )}
            {config.provider === 'messagebird' && (
              <>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={(config.apiKey as string) || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromNumber">From Number</Label>
                  <Input
                    id="fromNumber"
                    value={(config.fromNumber as string) || ''}
                    onChange={(e) => setConfig({ ...config, fromNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </>
            )}
            {config.provider === 'meta' && (
              <>
                <div>
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={(config.accessToken as string) || ''}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    value={(config.phoneNumberId as string) || ''}
                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                  />
                </div>
              </>
            )}
            {config.provider === 'custom' && (
              <>
                <div>
                  <Label htmlFor="customEndpoint">API Endpoint</Label>
                  <Input
                    id="customEndpoint"
                    value={(config.customEndpoint as string) || ''}
                    onChange={(e) => setConfig({ ...config, customEndpoint: e.target.value })}
                    placeholder="https://api.example.com/whatsapp/send"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={(config.apiKey as string) || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  />
                </div>
              </>
            )}
          </>
        );
      case 'webhook':
        return (
          <>
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                value={(config.url as string) || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-app.com/webhooks/compliance"
                required
              />
            </div>
            <div>
              <Label htmlFor="secret">Secret Key (for HMAC signature)</Label>
              <Input
                id="secret"
                type="password"
                value={(config.secret as string) || ''}
                onChange={(e) => setConfig({ ...config, secret: e.target.value })}
                placeholder="min 16 characters"
                required
              />
            </div>
            <div>
              <Label htmlFor="retryAttempts">Max Retry Attempts</Label>
              <Input
                id="retryAttempts"
                type="number"
                min={1}
                max={10}
                value={(config.retryAttempts as string) || '3'}
                onChange={(e) =>
                  setConfig({ ...config, retryAttempts: parseInt(e.target.value) })
                }
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <Label htmlFor="name">Connector Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Primary Email"
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Connector Type</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as Connector['type']);
            setConfig({});
          }}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="email_smtp">Email (SMTP)</option>
          <option value="telegram_bot">Telegram Bot</option>
          <option value="whatsapp_business">WhatsApp Business</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>
      <div className="space-y-4">{renderConfigFields()}</div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Connector</Button>
      </div>
    </form>
  );
}

export default function ConnectorsPage() {
  const { data, mutate } = useSWR<{ connectors: Connector[] }>('/api/connectors', fetcher);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [testingConnector, setTestingConnector] = useState<Connector | null>(null);
  const [testRecipient, setTestRecipient] = useState('');

  const { trigger: createTrigger } = useSWRMutation('/api/connectors', createConnector, {
    onSuccess: () => {
      mutate();
      setIsCreateOpen(false);
    },
  });

  const { trigger: deleteTrigger } = useSWRMutation('/api/connectors', deleteConnectorWrapper);

  const { trigger: testTrigger, data: testResult } = useSWRMutation(
    testingConnector ? `/api/connectors/${testingConnector.id}` : null,
    testConnector
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connector?')) return;
    await deleteTrigger(`/api/connectors/${id}`);
    mutate();
  };

  const handleTest = async () => {
    if (!testingConnector) return;
    await testTrigger({ testRecipient });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Notification Connectors</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Connector
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Connector</DialogTitle>
            </DialogHeader>
            <ConnectorForm
              onSubmit={createTrigger}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.connectors?.map((connector) => {
                const Icon = connectorTypeIcons[connector.type];
                return (
                  <TableRow key={connector.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">
                          {connectorTypeLabels[connector.type]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{connector.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          connector.status === 'active'
                            ? 'default'
                            : connector.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {connector.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {connector.lastVerifiedAt
                        ? new Date(connector.lastVerifiedAt).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTestingConnector(connector)}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(connector.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!data?.connectors?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No connectors found. Create your first connector to send notifications.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test Connector Dialog */}
      <Dialog open={!!testingConnector} onOpenChange={() => setTestingConnector(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Test {testingConnector?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {testingConnector?.type === 'email_smtp' && (
              <div>
                <Label>Test Email Recipient</Label>
                <Input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            )}
            {testingConnector?.type === 'whatsapp_business' && (
              <div>
                <Label>Test Phone Number</Label>
                <Input
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            )}
            {(testingConnector?.type === 'telegram_bot' ||
              testingConnector?.type === 'webhook') && (
              <p className="text-sm text-muted-foreground">
                This will send a test {testingConnector.type === 'telegram_bot' ? 'message' : 'payload'} to the configured{' '}
                {testingConnector.type === 'telegram_bot' ? 'chat' : 'endpoint'}.
              </p>
            )}
            <Button onClick={handleTest} className="w-full">
              Send Test
            </Button>
            {testResult && (
              <div
                className={`p-3 rounded-md text-sm ${
                  testResult.testResult?.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {testResult.testResult?.message}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
