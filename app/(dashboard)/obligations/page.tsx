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
import { Pencil, Trash2, Plus, CheckCircle, XCircle, Calendar } from 'lucide-react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Obligation {
  obligation: {
    id: string;
    title: string;
    category: string;
    status: 'upcoming' | 'due_today' | 'overdue' | 'completed' | 'waived';
    severity: 'low' | 'medium' | 'high' | 'critical';
    dueAt: string;
    graceUntil: string | null;
    completedAt: string | null;
    notes: string | null;
  };
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Template {
  template: {
    id: string;
    title: string;
    category: string;
    defaultLeadDays: number;
    defaultGraceDays: number;
  };
}

const categoryLabels: Record<string, string> = {
  trade_license: 'Trade License',
  fire_safety: 'Fire Safety',
  tax_vat: 'Tax/VAT',
  environmental_permit: 'Environmental Permit',
  inspection_renewal: 'Inspection Renewal',
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500',
  due_today: 'bg-yellow-500',
  overdue: 'bg-red-500',
  completed: 'bg-green-500',
  waived: 'bg-gray-500',
};

function ObligationForm({
  branches,
  templates,
  onSubmit,
  onCancel,
}: {
  branches: Branch[];
  templates: Template[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    branchId: '',
    templateId: '',
    category: 'trade_license',
    title: '',
    severity: 'medium',
    dueAt: '',
    graceDays: 0,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove empty strings to pass Zod validation (.optional() expects undefined, not '')
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== '')
    );
    onSubmit(cleanedData);
  };

  const selectedTemplate = templates?.find(
    (t) => t.template.id === formData.templateId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label htmlFor="branch">Branch</Label>
        <select
          id="branch"
          value={formData.branchId}
          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select branch</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="template">Template (optional)</Label>
        <select
          id="template"
          value={formData.templateId}
          onChange={(e) => {
            const template = templates?.find(
              (t) => t.template.id === e.target.value
            );
            if (template) {
              setFormData({
                ...formData,
                templateId: e.target.value,
                category: template.template.category,
                title: template.template.title,
                graceDays: template.template.defaultGraceDays,
              });
            } else {
              setFormData({ ...formData, templateId: e.target.value });
            }
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select template</option>
          {templates?.map((t) => (
            <option key={t.template.id} value={t.template.id}>
              {t.template.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Obligation title"
          required
        />
      </div>

      <div>
        <Label htmlFor="severity">Severity</Label>
        <select
          id="severity"
          value={formData.severity}
          onChange={(e) =>
            setFormData({ ...formData, severity: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <Label htmlFor="dueAt">Due Date</Label>
        <Input
          id="dueAt"
          type="datetime-local"
          value={formData.dueAt}
          onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="graceDays">Grace Period (days)</Label>
        <Input
          id="graceDays"
          type="number"
          min={0}
          value={formData.graceDays}
          onChange={(e) =>
            setFormData({ ...formData, graceDays: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}

async function createObligation(
  url: string,
  { arg }: { arg: any }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to create obligation: ${res.status}`);
  }
  return res.json();
}

async function completeObligation(
  url: string,
  { arg }: { arg: { note?: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to complete obligation');
  return res.json();
}

async function waiveObligation(
  url: string,
  { arg }: { arg: { reason: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to waive obligation');
  return res.json();
}

async function deleteObligation(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete obligation');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteObligationWrapper(_url: string, { arg: targetUrl }: { arg: string }) {
  return deleteObligation(targetUrl);
}

export default function ObligationsPage() {
  const { data: obligations, mutate } = useSWR<Obligation[]>(
    '/api/obligations',
    fetcher
  );
  const { data: branches } = useSWR<Branch[]>('/api/branches', fetcher);
  const { data: templates } = useSWR<Template[]>(
    '/api/templates',
    fetcher
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [waivingId, setWaivingId] = useState<string | null>(null);
  const [waiveReason, setWaiveReason] = useState('');

  const { trigger: createTrigger } = useSWRMutation(
    '/api/obligations',
    createObligation,
    {
      onSuccess: () => {
        mutate();
        setIsCreateOpen(false);
      },
    }
  );

  const { trigger: completeTrigger } = useSWRMutation(
    completingId ? `/api/obligations/${completingId}/complete` : null,
    completeObligation,
    {
      onSuccess: () => {
        mutate();
        setCompletingId(null);
      },
    }
  );

  const { trigger: waiveTrigger } = useSWRMutation(
    waivingId ? `/api/obligations/${waivingId}/waive` : null,
    waiveObligation,
    {
      onSuccess: () => {
        mutate();
        setWaivingId(null);
        setWaiveReason('');
      },
    }
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    '/api/obligations',
    deleteObligationWrapper
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await deleteTrigger(`/api/obligations/${id}`);
    mutate();
  };

  const isOverdue = (dueAt: string) => new Date(dueAt) < new Date();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Compliance Obligations</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Obligation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Obligation</DialogTitle>
            </DialogHeader>
            <ObligationForm
              branches={branches || []}
              templates={templates || []}
              onSubmit={createTrigger}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Obligations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations?.map(({ obligation, branch }) => (
                <TableRow key={obligation.id}>
                  <TableCell className="font-medium">{obligation.title}</TableCell>
                  <TableCell>{branch?.name || '-'}</TableCell>
                  <TableCell>{categoryLabels[obligation.category]}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(obligation.dueAt).toLocaleDateString()}
                      {isOverdue(obligation.dueAt) &&
                        obligation.status !== 'completed' &&
                        obligation.status !== 'waived' && (
                          <span className="text-xs text-red-500">(Overdue)</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[obligation.status]}>
                      {obligation.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        obligation.severity === 'critical'
                          ? 'destructive'
                          : obligation.severity === 'high'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {obligation.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {obligation.status !== 'completed' &&
                      obligation.status !== 'waived' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCompletingId(obligation.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setWaivingId(obligation.id)}
                          >
                            <XCircle className="w-4 h-4 text-yellow-500" />
                          </Button>
                        </>
                      )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(obligation.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!obligations?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No obligations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Complete Dialog */}
      <Dialog open={!!completingId} onOpenChange={() => setCompletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Obligation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Add a completion note (optional):</p>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="Completion notes..."
              id="completeNote"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompletingId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const note = (document.getElementById('completeNote') as HTMLTextAreaElement)?.value;
                  completeTrigger({ note });
                }}
              >
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waive Dialog */}
      <Dialog open={!!waivingId} onOpenChange={() => setWaivingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Obligation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Reason for waiving (required):</p>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="Reason..."
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWaivingId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => waiveTrigger({ reason: waiveReason })}
                disabled={!waiveReason.trim()}
              >
                Waive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
