'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { CheckCircle, Mail, MessageSquare, Phone, Webhook, Bell } from 'lucide-react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NotificationEvent {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  status: 'queued' | 'sent' | 'failed' | 'cancelled' | 'acked';
  scheduledFor: string;
  createdAt: string;
  payloadJson: {
    severity?: string;
    branch?: { name: string };
    entity?: { title?: string; hostname?: string };
    daysRemaining?: number;
  };
  deliveries: {
    id: string;
    connectorId: string;
    deliveryStatus: string;
    sentAt: string | null;
  }[];
  acknowledgement: {
    id: string;
    ackAt: string;
    ackNote: string | null;
  } | null;
}

const eventTypeLabels: Record<string, string> = {
  obligation_due: 'Obligation Due',
  obligation_overdue: 'Obligation Overdue',
  ssl_expiry: 'SSL Expiry',
  ssl_failure: 'SSL Failure',
  digest: 'Daily Digest',
};

const statusIcons: Record<string, React.ReactNode> = {
  email_smtp: <Mail className="w-4 h-4" />,
  telegram_bot: <MessageSquare className="w-4 h-4" />,
  whatsapp_business: <Phone className="w-4 h-4" />,
  webhook: <Webhook className="w-4 h-4" />,
};

async function acknowledgeNotification(
  url: string,
  { arg }: { arg: { note?: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to acknowledge notification');
  return res.json();
}

export default function NotificationsPage() {
  const { data, mutate } = useSWR<{ events: NotificationEvent[] }>(
    '/api/notifications?limit=50',
    fetcher
  );
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [ackNote, setAckNote] = useState('');

  const { trigger: ackTrigger } = useSWRMutation(
    acknowledgingId ? `/api/notifications/${acknowledgingId}` : null,
    acknowledgeNotification,
    {
      onSuccess: () => {
        mutate();
        setAcknowledgingId(null);
        setAckNote('');
      },
    }
  );

  const handleAcknowledge = async () => {
    await ackTrigger({ note: ackNote });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg lg:text-2xl font-medium">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            View and acknowledge notification events
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="font-medium">
                      {eventTypeLabels[event.eventType] || event.eventType}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.payloadJson?.branch?.name || 'All Branches'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === 'acked'
                          ? 'default'
                          : event.status === 'sent'
                          ? 'secondary'
                          : event.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.payloadJson?.entity?.title && (
                      <div className="text-sm">{event.payloadJson.entity.title}</div>
                    )}
                    {event.payloadJson?.entity?.hostname && (
                      <div className="text-sm font-mono">
                        {event.payloadJson.entity.hostname}
                      </div>
                    )}
                    {event.payloadJson?.daysRemaining !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {event.payloadJson.daysRemaining} days remaining
                      </div>
                    )}
                    {event.payloadJson?.severity && (
                      <Badge
                        variant={
                          event.payloadJson.severity === 'critical'
                            ? 'destructive'
                            : event.payloadJson.severity === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                        className="mt-1"
                      >
                        {event.payloadJson.severity}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {event.deliveries?.map((delivery) => (
                        <div
                          key={delivery.id}
                          className={`w-2 h-2 rounded-full ${
                            delivery.deliveryStatus === 'sent' ||
                            delivery.deliveryStatus === 'provider_delivered'
                              ? 'bg-green-500'
                              : delivery.deliveryStatus === 'failed'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          title={delivery.deliveryStatus}
                        />
                      ))}
                      {!event.deliveries?.length && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(event.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {event.status !== 'acked' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAcknowledgingId(event.id)}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Acknowledged
                        {event.acknowledgement?.ackNote && (
                          <span className="text-muted-foreground">
                            ({event.acknowledgement.ackNote})
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!data?.events?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No notifications yet. They will appear here when scheduled.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acknowledgement Dialog */}
      {acknowledgingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium mb-4">Acknowledge Notification</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add an optional note about the action taken:
            </p>
            <textarea
              value={ackNote}
              onChange={(e) => setAckNote(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
              rows={3}
              placeholder="e.g., License renewed, case closed"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAcknowledgingId(null);
                  setAckNote('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAcknowledge}>Acknowledge</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
