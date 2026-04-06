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
import { Pencil, Trash2, Plus } from 'lucide-react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Template {
  template: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    recurrenceType: string | null;
    defaultLeadDays: number;
    defaultGraceDays: number;
    severity: string;
    isActive: boolean;
  };
  jurisdiction: {
    label: string;
  } | null;
}

const categoryLabels: Record<string, string> = {
  trade_license: 'Trade License',
  fire_safety: 'Fire Safety',
  tax_vat: 'Tax/VAT',
  environmental_permit: 'Environmental Permit',
  inspection_renewal: 'Inspection Renewal',
};

const recurrenceLabels: Record<string, string> = {
  annual: 'Annual',
  semiannual: 'Semi-Annual',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  custom: 'Custom',
};

function TemplateForm({
  template,
  onSubmit,
  onCancel,
}: {
  template?: Template['template'];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    category: template?.category || 'trade_license',
    title: template?.title || '',
    description: template?.description || '',
    recurrenceType: template?.recurrenceType || '',
    defaultLeadDays: template?.defaultLeadDays || 30,
    defaultGraceDays: template?.defaultGraceDays || 0,
    severity: template?.severity || 'medium',
    isActive: template?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
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
        <Label htmlFor="title">Template Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Dhaka North Trade License Renewal"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          placeholder="Template description..."
        />
      </div>

      <div>
        <Label htmlFor="recurrence">Recurrence</Label>
        <select
          id="recurrence"
          value={formData.recurrenceType || ''}
          onChange={(e) =>
            setFormData({ ...formData, recurrenceType: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">One-time</option>
          {Object.entries(recurrenceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leadDays">Lead Days</Label>
          <Input
            id="leadDays"
            type="number"
            min={0}
            value={formData.defaultLeadDays}
            onChange={(e) =>
              setFormData({
                ...formData,
                defaultLeadDays: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="graceDays">Grace Days</Label>
          <Input
            id="graceDays"
            type="number"
            min={0}
            value={formData.defaultGraceDays}
            onChange={(e) =>
              setFormData({
                ...formData,
                defaultGraceDays: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="severity">Default Severity</Label>
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

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="rounded border-input"
        />
        <Label htmlFor="isActive" className="mb-0">Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{template ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

async function createTemplate(
  url: string,
  { arg }: { arg: any }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

async function updateTemplate(
  url: string,
  { arg }: { arg: any }
) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

async function deleteTemplate(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteTemplateWrapper(_url: string, { arg: targetUrl }: { arg: string }) {
  return deleteTemplate(targetUrl);
}

export default function TemplatesPage() {
  const { data: templates, mutate } = useSWR<Template[]>(
    '/api/templates',
    fetcher
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template['template'] | null>(null);

  const { trigger: createTrigger } = useSWRMutation(
    '/api/templates',
    createTemplate,
    {
      onSuccess: () => {
        mutate();
        setIsCreateOpen(false);
      },
    }
  );

  const { trigger: updateTrigger } = useSWRMutation(
    editingTemplate ? `/api/templates/${editingTemplate.id}` : null,
    updateTemplate,
    {
      onSuccess: () => {
        mutate();
        setEditingTemplate(null);
      },
    }
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    '/api/templates',
    deleteTemplateWrapper
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await deleteTrigger(`/api/templates/${id}`);
    mutate();
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Obligation Templates</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              onSubmit={createTrigger}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Lead/Grace Days</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((t) => (
                <TableRow key={t.template.id}>
                  <TableCell className="font-medium">{t.template.title}</TableCell>
                  <TableCell>{categoryLabels[t.template.category]}</TableCell>
                  <TableCell>
                    {t.template.recurrenceType
                      ? recurrenceLabels[t.template.recurrenceType]
                      : 'One-time'}
                  </TableCell>
                  <TableCell>
                    {t.template.defaultLeadDays} / {t.template.defaultGraceDays}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.template.severity === 'critical'
                          ? 'destructive'
                          : t.template.severity === 'high'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {t.template.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.template.isActive ? 'default' : 'secondary'}
                    >
                      {t.template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(t.template)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(t.template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!templates?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No templates found. Create templates to quickly add obligations.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              template={editingTemplate}
              onSubmit={updateTrigger}
              onCancel={() => setEditingTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
