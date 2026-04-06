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

interface Branch {
  id: string;
  code: string;
  name: string;
  addressLine: string | null;
  cityCorporation: string | null;
  district: string | null;
  status: 'active' | 'inactive';
}

async function createBranch(
  url: string,
  { arg }: { arg: Omit<Branch, 'id'> }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create branch');
  return res.json();
}

async function updateBranch(
  url: string,
  { arg }: { arg: Partial<Branch> }
) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to update branch');
  return res.json();
}

async function deleteBranch(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete branch');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteBranchWrapper(_url: string, { arg: targetUrl }: { arg: string }) {
  return deleteBranch(targetUrl);
}

function BranchForm({
  branch,
  onSubmit,
  onCancel,
}: {
  branch?: Branch;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: branch?.code || '',
    name: branch?.name || '',
    addressLine: branch?.addressLine || '',
    cityCorporation: branch?.cityCorporation || '',
    district: branch?.district || '',
    region: '',
    countryCode: 'BD',
    status: branch?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">Branch Code</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., DHK-001"
          required
        />
      </div>
      <div>
        <Label htmlFor="name">Branch Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Dhaka Gulshan Branch"
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.addressLine}
          onChange={(e) =>
            setFormData({ ...formData, addressLine: e.target.value })
          }
          placeholder="Full address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City Corporation</Label>
          <Input
            id="city"
            value={formData.cityCorporation}
            onChange={(e) =>
              setFormData({ ...formData, cityCorporation: e.target.value })
            }
            placeholder="e.g., Dhaka North"
          />
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) =>
              setFormData({ ...formData, district: e.target.value })
            }
            placeholder="e.g., Dhaka"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{branch ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

export default function BranchesPage() {
  const { data: branches, mutate } = useSWR<Branch[]>('/api/branches', fetcher);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { trigger: createTrigger } = useSWRMutation(
    '/api/branches',
    createBranch,
    {
      onSuccess: () => {
        mutate();
        setIsCreateOpen(false);
      },
    }
  );

  const { trigger: updateTrigger } = useSWRMutation(
    editingBranch ? `/api/branches/${editingBranch.id}` : null,
    updateBranch,
    {
      onSuccess: () => {
        mutate();
        setEditingBranch(null);
      },
    }
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    '/api/branches',
    deleteBranchWrapper
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    await deleteTrigger(`/api/branches/${id}`);
    mutate();
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Branches</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
            </DialogHeader>
            <BranchForm
              onSubmit={createTrigger}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City/District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.code}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>
                    {branch.cityCorporation || '-'}
                    {branch.district && branch.cityCorporation
                      ? `, ${branch.district}`
                      : branch.district || ''}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={branch.status === 'active' ? 'default' : 'secondary'}
                    >
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBranch(branch)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!branches?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No branches found. Create your first branch to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingBranch} onOpenChange={() => setEditingBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {editingBranch && (
            <BranchForm
              branch={editingBranch}
              onSubmit={updateTrigger}
              onCancel={() => setEditingBranch(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
