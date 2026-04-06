'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Trash2, Route } from 'lucide-react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Connector {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface NotificationRoute {
  id: string;
  connectorId: string;
  branchId: string | null;
  eventType: 'obligation_due' | 'obligation_overdue' | 'ssl_expiry' | 'ssl_failure' | 'digest';
  severityMin: 'low' | 'medium' | 'high' | 'critical';
  recipientRef: string;
  isActive: boolean;
  connector: Connector;
  branch: Branch | null;
}

const eventTypeLabels: Record<string, string> = {
  obligation_due: 'Obligation Due',
  obligation_overdue: 'Obligation Overdue',
  ssl_expiry: 'SSL Expiry',
  ssl_failure: 'SSL Failure',
  digest: 'Daily Digest',
};

const severityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

async function createRoute(
  url: string,
  { arg }: { arg: { connectorId: string; branchId?: string; eventType: string; severityMin: string; recipientRef: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create route');
  return res.json();
}

async function deleteRoute(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete route');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteRouteWrapper(_url: string, { arg: targetUrl }: { arg: string }) {
  return deleteRoute(targetUrl);
}

function RouteForm({
  connectors,
  branches,
  onSubmit,
  onCancel,
}: {
  connectors: Connector[];
  branches: Branch[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [connectorId, setConnectorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [eventType, setEventType] = useState('obligation_due');
  const [severityMin, setSeverityMin] = useState('low');
  const [recipientRef, setRecipientRef] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      connectorId,
      branchId: branchId || undefined,
      eventType,
      severityMin,
      recipientRef,
    });
  };

  const selectedConnector = connectors.find((c) => c.id === connectorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="connector">Connector</Label>
        <select
          id="connector"
          value={connectorId}
          onChange={(e) => setConnectorId(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="">Select a connector</option>
          {connectors.map((connector) => (
            <option key={connector.id} value={connector.id}>
              {connector.name} ({connector.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="branch">Branch (Optional)</Label>
        <select
          id="branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="w-full border rounded-md p-2"
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground mt-1">
          Leave empty to apply to all branches
        </p>
      </div>

      <div>
        <Label htmlFor="eventType">Event Type</Label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="obligation_due">Obligation Due</option>
          <option value="obligation_overdue">Obligation Overdue</option>
          <option value="ssl_expiry">SSL Expiry</option>
          <option value="ssl_failure">SSL Failure</option>
          <option value="digest">Daily Digest</option>
        </select>
      </div>

      <div>
        <Label htmlFor="severityMin">Minimum Severity</Label>
        <select
          id="severityMin"
          value={severityMin}
          onChange={(e) => setSeverityMin(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="low">Low - All notifications</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical only</option>
        </select>
      </div>

      <div>
        <Label htmlFor="recipientRef">
          Recipient ({selectedConnector?.type === 'email_smtp' ? 'Email' : selectedConnector?.type === 'telegram_bot' ? 'Chat ID' : selectedConnector?.type === 'whatsapp_business' ? 'Phone Number' : 'Identifier'})
        </Label>
        <input
          id="recipientRef"
          type="text"
          value={recipientRef}
          onChange={(e) => setRecipientRef(e.target.value)}
          className="w-full border rounded-md p-2"
          placeholder={
            selectedConnector?.type === 'email_smtp'
              ? 'admin@example.com'
              : selectedConnector?.type === 'telegram_bot'
              ? '@channelname or chat ID'
              : selectedConnector?.type === 'whatsapp_business'
              ? '+1234567890'
              : 'Recipient identifier'
          }
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Route</Button>
      </div>
    </form>
  );
}

export default function NotificationRoutesPage() {
  const { data: routesData, mutate: mutateRoutes } = useSWR<{ routes: NotificationRoute[] }>(
    '/api/notification-routes',
    fetcher
  );
  const { data: connectorsData } = useSWR<{ connectors: Connector[] }>('/api/connectors', fetcher);
  const { data: branchesData } = useSWR<{ branches: Branch[] }>('/api/branches', fetcher);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { trigger: createTrigger } = useSWRMutation('/api/notification-routes', createRoute, {
    onSuccess: () => {
      mutateRoutes();
      setIsCreateOpen(false);
    },
  });

  const { trigger: deleteTrigger } = useSWRMutation('/api/notification-routes', deleteRouteWrapper);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    await deleteTrigger(`/api/notification-routes/${id}`);
    mutateRoutes();
  };

  const activeConnectors = connectorsData?.connectors?.filter((c) => c.status === 'active') || [];

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg lg:text-2xl font-medium">Notification Routes</h1>
          <p className="text-sm text-muted-foreground">
            Configure where notifications are sent based on event type and severity
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Notification Route</DialogTitle>
            </DialogHeader>
            {activeConnectors.length === 0 ? (
              <div className="text-center py-6">
                <Route className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  You need at least one active connector to create a route.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/connectors">Go to Connectors</a>
                </Button>
              </div>
            ) : (
              <RouteForm
                connectors={activeConnectors}
                branches={branchesData?.branches || []}
                onSubmit={createTrigger}
                onCancel={() => setIsCreateOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connector</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Min Severity</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routesData?.routes?.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div className="font-medium">{route.connector?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {route.connector?.type}
                    </div>
                  </TableCell>
                  <TableCell>{eventTypeLabels[route.eventType]}</TableCell>
                  <TableCell>
                    <Badge variant={route.severityMin === 'critical' ? 'destructive' : 'secondary'}>
                      {severityLabels[route.severityMin]}
                    </Badge>
                  </TableCell>
                  <TableCell>{route.branch?.name || 'All Branches'}</TableCell>
                  <TableCell className="font-mono text-sm">{route.recipientRef}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!routesData?.routes?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No routes configured. Create a route to start receiving notifications.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
