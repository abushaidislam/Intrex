'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Shield, ShieldAlert, ShieldCheck, RefreshCw, Plus, Search, Trash2, Edit, AlertCircle, Clock, XCircle, CheckCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DomainData {
  domain: {
    id: string;
    hostname: string;
    port: number;
    sniHostname: string | null;
    status: 'active' | 'paused' | 'deleted';
    lastCheckedAt: string | null;
    nextCheckAt: string | null;
    createdAt: string;
  };
  branch: {
    id: string;
    name: string;
  } | null;
}

interface SSLResult {
  id: string;
  checkStatus: 'ok' | 'warning' | 'expired' | 'handshake_failed' | 'dns_failed' | 'timeout' | 'hostname_mismatch';
  validTo: string | null;
  daysRemaining: number | null;
  issuerCn: string | null;
  checkedAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string; badge: string }> = {
  active: { color: 'bg-green-500', icon: CheckCircle, label: 'Active', badge: 'bg-green-100 text-green-800' },
  paused: { color: 'bg-yellow-500', icon: Clock, label: 'Paused', badge: 'bg-yellow-100 text-yellow-800' },
  deleted: { color: 'bg-gray-500', icon: XCircle, label: 'Deleted', badge: 'bg-gray-100 text-gray-800' },
};

const sslStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string; badge: string }> = {
  ok: { color: 'text-green-600', icon: ShieldCheck, label: 'OK', badge: 'bg-green-100 text-green-800' },
  warning: { color: 'text-yellow-600', icon: ShieldAlert, label: 'Expiring Soon', badge: 'bg-yellow-100 text-yellow-800' },
  expired: { color: 'text-red-600', icon: ShieldAlert, label: 'Expired', badge: 'bg-red-100 text-red-800' },
  handshake_failed: { color: 'text-red-600', icon: AlertCircle, label: 'Handshake Failed', badge: 'bg-red-100 text-red-800' },
  dns_failed: { color: 'text-red-600', icon: AlertCircle, label: 'DNS Failed', badge: 'bg-red-100 text-red-800' },
  timeout: { color: 'text-orange-600', icon: Clock, label: 'Timeout', badge: 'bg-orange-100 text-orange-800' },
  hostname_mismatch: { color: 'text-red-600', icon: AlertCircle, label: 'Hostname Mismatch', badge: 'bg-red-100 text-red-800' },
};

export default function DomainsPage() {
  const { data: domainsData, error, isLoading } = useSWR<DomainData[]>('/api/domains', fetcher);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ domainId: string; result: SSLResult } | null>(null);

  const handleCheckNow = async (domainId: string) => {
    setIsChecking(domainId);
    setCheckResult(null);
    try {
      const response = await fetch(`/api/domains/${domainId}/check-now`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setCheckResult({ domainId, result: data.result });
        mutate('/api/domains'); // Refresh the list
      } else {
        alert(data.error || 'Check failed');
      }
    } catch (err) {
      alert('Failed to check SSL');
    } finally {
      setIsChecking(null);
    }
  };

  const handleAddDomain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      hostname: formData.get('hostname') as string,
      port: parseInt(formData.get('port') as string) || 443,
      sniHostname: formData.get('sniHostname') as string || undefined,
      branchId: formData.get('branchId') as string || undefined,
    };

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        mutate('/api/domains');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add domain');
      }
    } catch (err) {
      alert('Failed to add domain');
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">SSL Certificate Monitoring</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Monitor SSL certificate for a new domain or subdomain.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <Label htmlFor="hostname">Hostname *</Label>
                <Input
                  id="hostname"
                  name="hostname"
                  placeholder="example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    defaultValue="443"
                    min="1"
                    max="65535"
                  />
                </div>
                <div>
                  <Label htmlFor="sniHostname">SNI Hostname (optional)</Label>
                  <Input
                    id="sniHostname"
                    name="sniHostname"
                    placeholder="www.example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input
                  id="branchId"
                  name="branchId"
                  placeholder="Branch ID"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Domain
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SSL Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Domains</p>
              <p className="text-2xl font-bold">{domainsData?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold">
                {domainsData?.filter(d => d.domain.status === 'active').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100">
              <ShieldAlert className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">
                {domainsData?.filter(d => d.domain.status === 'active').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issues</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monitored Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>SSL Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading domains...
                  </TableCell>
                </TableRow>
              )}
              {domainsData?.map(({ domain, branch }) => {
                const status = statusConfig[domain.status];
                const StatusIcon = status?.icon || Globe;
                
                return (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        {domain.hostname}
                        {domain.port !== 443 && (
                          <span className="text-muted-foreground">:{domain.port}</span>
                        )}
                      </div>
                      {domain.sniHostname && (
                        <p className="text-xs text-muted-foreground mt-1">
                          SNI: {domain.sniHostname}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{branch?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={status?.badge || 'bg-gray-100'}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status?.label || domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {domain.lastCheckedAt ? (
                        new Date(domain.lastCheckedAt).toLocaleString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {checkResult?.domainId === domain.id ? (
                        <Badge className={sslStatusConfig[checkResult.result.checkStatus]?.badge || 'bg-gray-100'}>
                          {sslStatusConfig[checkResult.result.checkStatus]?.label || checkResult.result.checkStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckNow(domain.id)}
                          disabled={isChecking === domain.id || domain.status === 'deleted'}
                        >
                          <RefreshCw className={`w-4 h-4 ${isChecking === domain.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Link href={`/domains/${domain.id}`}>
                          <Button variant="ghost" size="sm">
                            <Search className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && domainsData?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No domains monitored yet. Add your first domain above.
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
