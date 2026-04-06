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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Shield, ShieldAlert, ShieldCheck, RefreshCw, ArrowLeft, AlertCircle, Clock, XCircle, CheckCircle, Copy, Check } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DomainDetail {
  domain: {
    id: string;
    hostname: string;
    port: number;
    sniHostname: string | null;
    status: 'active' | 'paused' | 'deleted';
    lastCheckedAt: string | null;
    nextCheckAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  branch: {
    id: string;
    name: string;
  } | null;
  latestResult: SSLResult | null;
}

interface SSLResult {
  id: string;
  checkStatus: 'ok' | 'warning' | 'expired' | 'handshake_failed' | 'dns_failed' | 'timeout' | 'hostname_mismatch';
  validFrom: string | null;
  validTo: string | null;
  issuerCn: string | null;
  subjectCn: string | null;
  sanJson: string | null;
  daysRemaining: number | null;
  fingerprintSha256: string | null;
  errorMessage: string | null;
  checkedAt: string;
}

interface ResultsData {
  results: SSLResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string; badge: string }> = {
  active: { color: 'bg-green-500', icon: CheckCircle, label: 'Active', badge: 'bg-green-100 text-green-800' },
  paused: { color: 'bg-yellow-500', icon: Clock, label: 'Paused', badge: 'bg-yellow-100 text-yellow-800' },
  deleted: { color: 'bg-gray-500', icon: XCircle, label: 'Deleted', badge: 'bg-gray-100 text-gray-800' },
};

const sslStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string; badge: string; alert: string }> = {
  ok: { 
    color: 'text-green-600', 
    icon: ShieldCheck, 
    label: 'Valid', 
    badge: 'bg-green-100 text-green-800',
    alert: 'bg-green-50 border-green-200 text-green-800'
  },
  warning: { 
    color: 'text-yellow-600', 
    icon: ShieldAlert, 
    label: 'Expiring Soon', 
    badge: 'bg-yellow-100 text-yellow-800',
    alert: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  expired: { 
    color: 'text-red-600', 
    icon: ShieldAlert, 
    label: 'Expired', 
    badge: 'bg-red-100 text-red-800',
    alert: 'bg-red-50 border-red-200 text-red-800'
  },
  handshake_failed: { 
    color: 'text-red-600', 
    icon: AlertCircle, 
    label: 'Handshake Failed', 
    badge: 'bg-red-100 text-red-800',
    alert: 'bg-red-50 border-red-200 text-red-800'
  },
  dns_failed: { 
    color: 'text-red-600', 
    icon: AlertCircle, 
    label: 'DNS Failed', 
    badge: 'bg-red-100 text-red-800',
    alert: 'bg-red-50 border-red-200 text-red-800'
  },
  timeout: { 
    color: 'text-orange-600', 
    icon: Clock, 
    label: 'Timeout', 
    badge: 'bg-orange-100 text-orange-800',
    alert: 'bg-orange-50 border-orange-200 text-orange-800'
  },
  hostname_mismatch: { 
    color: 'text-red-600', 
    icon: AlertCircle, 
    label: 'Hostname Mismatch', 
    badge: 'bg-red-100 text-red-800',
    alert: 'bg-red-50 border-red-200 text-red-800'
  },
};

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.id as string;
  
  const { data: domainData, error: domainError, isLoading: domainLoading } = useSWR<DomainDetail>(
    `/api/domains/${domainId}`,
    fetcher
  );
  const { data: resultsData, isLoading: resultsLoading } = useSWR<ResultsData>(
    `/api/domains/${domainId}/results`,
    fetcher
  );
  
  const [isChecking, setIsChecking] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/domains/${domainId}/check-now`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        mutate(`/api/domains/${domainId}`);
        mutate(`/api/domains/${domainId}/results`);
      } else {
        alert(data.error || 'Check failed');
      }
    } catch (err) {
      alert('Failed to check SSL');
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (domainLoading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">Loading domain details...</div>
      </section>
    );
  }

  if (domainError || !domainData) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load domain details</AlertDescription>
        </Alert>
      </section>
    );
  }

  const { domain, branch, latestResult } = domainData;
  const status = statusConfig[domain.status];
  const sslStatus = latestResult ? sslStatusConfig[latestResult.checkStatus] : null;

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Button>
          </Link>
        </div>
        <Button
          onClick={handleCheckNow}
          disabled={isChecking || domain.status === 'deleted'}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Now'}
        </Button>
      </div>

      {/* Domain Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Globe className="w-6 h-6 text-muted-foreground" />
          {domain.hostname}
          {domain.port !== 443 && (
            <span className="text-lg text-muted-foreground">:{domain.port}</span>
          )}
        </h1>
        {branch && (
          <p className="text-muted-foreground mt-1">
            Branch: {branch.name}
          </p>
        )}
      </div>

      {/* Status Alert */}
      {latestResult && (
        <Alert className={`mb-6 ${sslStatus?.alert || ''}`}>
          {sslStatus && <sslStatus.icon className="h-4 w-4" />}
          <AlertDescription className="flex items-center gap-2">
            <span className="font-medium">
              {sslStatus?.label || latestResult.checkStatus}
            </span>
            {latestResult.daysRemaining !== null && latestResult.daysRemaining >= 0 && (
              <span>({latestResult.daysRemaining} days remaining)</span>
            )}
            {latestResult.daysRemaining !== null && latestResult.daysRemaining < 0 && (
              <span>(Expired {Math.abs(latestResult.daysRemaining)} days ago)</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestResult ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={sslStatus?.badge || 'bg-gray-100'}>
                      {sslStatus?.label || latestResult.checkStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className="font-medium">
                      {latestResult.daysRemaining !== null 
                        ? `${latestResult.daysRemaining} days`
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {latestResult.validFrom && (
                  <div>
                    <p className="text-sm text-muted-foreground">Valid From</p>
                    <p className="font-medium">
                      {new Date(latestResult.validFrom).toLocaleString()}
                    </p>
                  </div>
                )}

                {latestResult.validTo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">
                      {new Date(latestResult.validTo).toLocaleString()}
                    </p>
                  </div>
                )}

                {latestResult.issuerCn && (
                  <div>
                    <p className="text-sm text-muted-foreground">Issuer</p>
                    <p className="font-medium">{latestResult.issuerCn}</p>
                  </div>
                )}

                {latestResult.subjectCn && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject CN</p>
                    <p className="font-medium">{latestResult.subjectCn}</p>
                  </div>
                )}

                {latestResult.sanJson && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject Alternative Names</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(latestResult.sanJson).map((san: string) => (
                        <Badge key={san} variant="outline" className="text-xs">
                          {san}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {latestResult.fingerprintSha256 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fingerprint (SHA-256)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
                        {latestResult.fingerprintSha256}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(latestResult.fingerprintSha256!, 'fingerprint')}
                      >
                        {copiedField === 'fingerprint' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {latestResult.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Error:</span> {latestResult.errorMessage}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No SSL check performed yet</p>
                <p className="text-sm mt-1">Click "Check Now" to get certificate details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={status?.badge || 'bg-gray-100'}>
                  {status?.label || domain.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Port</p>
                <p className="font-medium">{domain.port}</p>
              </div>
            </div>

            {domain.sniHostname && (
              <div>
                <p className="text-sm text-muted-foreground">SNI Hostname</p>
                <p className="font-medium">{domain.sniHostname}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Branch Assignment</p>
              <p className="font-medium">{branch?.name || 'Unassigned'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Last Checked</p>
                <p className="font-medium">
                  {domain.lastCheckedAt 
                    ? new Date(domain.lastCheckedAt).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Check</p>
                <p className="font-medium">
                  {domain.nextCheckAt 
                    ? new Date(domain.nextCheckAt).toLocaleString()
                    : 'Pending'
                  }
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(domain.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Issuer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultsLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading history...
                  </TableCell>
                </TableRow>
              )}
              {resultsData?.results?.map((result) => {
                const resultStatus = sslStatusConfig[result.checkStatus];
                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      {new Date(result.checkedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={resultStatus?.badge || 'bg-gray-100'}>
                        {resultStatus?.label || result.checkStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.validTo 
                        ? new Date(result.validTo).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {result.daysRemaining !== null 
                        ? `${result.daysRemaining} days`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{result.issuerCn || '-'}</TableCell>
                  </TableRow>
                );
              })}
              {!resultsLoading && resultsData?.results?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No check history available
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
