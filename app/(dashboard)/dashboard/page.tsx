'use client';

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
import { AlertCircle, Building2, CheckCircle2, Clock, FileText, AlertTriangle, Shield, Globe, ShieldAlert, ShieldCheck } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardData {
  summary: {
    totalBranches: number;
    activeObligations: number;
    upcomingCount: number;
    overdueCount: number;
    dueTodayCount: number;
    completedThisMonth: number;
    totalDomains: number;
    sslHealthy: number;
    sslExpiringSoon: number;
    sslIssues: number;
  };
  upcoming: Array<{
    obligation: {
      id: string;
      title: string;
      category: string;
      status: string;
      severity: string;
      dueAt: string;
    };
    branch: {
      name: string;
    } | null;
  }>;
  overdue: Array<{
    obligation: {
      id: string;
      title: string;
      category: string;
      status: string;
      severity: string;
      dueAt: string;
    };
    branch: {
      name: string;
    } | null;
  }>;
  sslExpiring: Array<{
    domain: {
      id: string;
      hostname: string;
      port: number;
    };
    result: {
      checkStatus: string;
      daysRemaining: number | null;
      validTo: string | null;
    } | null;
  }>;
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

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  link,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: dashboardData, error } = useSWR<DashboardData>(
    '/api/dashboard/summary',
    fetcher
  );

  const formatDueDate = (dueAt: string) => {
    const date = new Date(dueAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days left`;
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Branches"
          value={dashboardData?.summary.totalBranches || 0}
          icon={Building2}
          color="bg-blue-500"
          link="/branches"
        />
        <SummaryCard
          title="Overdue"
          value={dashboardData?.summary.overdueCount || 0}
          icon={AlertCircle}
          color="bg-red-500"
          link="/obligations?status=overdue"
        />
        <SummaryCard
          title="Due Today"
          value={dashboardData?.summary.dueTodayCount || 0}
          icon={Clock}
          color="bg-yellow-500"
          link="/obligations?status=due_today"
        />
        <SummaryCard
          title="SSL Domains"
          value={dashboardData?.summary.totalDomains || 0}
          icon={Shield}
          color="bg-purple-500"
          link="/domains"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Link href="/obligations">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View All Obligations
          </Button>
        </Link>
        <Link href="/branches">
          <Button variant="outline">
            <Building2 className="w-4 h-4 mr-2" />
            Manage Branches
          </Button>
        </Link>
        <Link href="/domains">
          <Button variant="outline">
            <Globe className="w-4 h-4 mr-2" />
            SSL Monitoring
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Obligations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.upcoming?.slice(0, 5).map(({ obligation, branch }) => (
                  <TableRow key={obligation.id}>
                    <TableCell className="font-medium">
                      <Link href={`/obligations`} className="hover:underline">
                        {obligation.title}
                      </Link>
                    </TableCell>
                    <TableCell>{branch?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatDueDate(obligation.dueAt)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!dashboardData?.upcoming?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No upcoming obligations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SSL Expiring Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <ShieldAlert className="w-5 h-5" />
              SSL Certificates at Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.sslExpiring?.slice(0, 5).map(({ domain, result }) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      <Link href={`/domains/${domain.id}`} className="hover:underline text-yellow-600">
                        {domain.hostname}
                        {domain.port !== 443 && <span className="text-muted-foreground">:{domain.port}</span>}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={result?.checkStatus === 'expired' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {result?.checkStatus === 'expired' ? 'Expired' : 'Expiring Soon'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result?.daysRemaining !== null && result?.daysRemaining !== undefined ? (
                        result.daysRemaining < 0 ? (
                          <span className="text-red-600 font-medium">
                            {Math.abs(result.daysRemaining)} days ago
                          </span>
                        ) : (
                          <span className={result.daysRemaining <= 7 ? 'text-red-600 font-medium' : ''}>
                            {result.daysRemaining} days
                          </span>
                        )
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!dashboardData?.sslExpiring?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No SSL certificate risks
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Obligations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Overdue Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData?.overdue?.slice(0, 5).map(({ obligation, branch }) => (
                <TableRow key={obligation.id}>
                  <TableCell className="font-medium">
                    <Link href={`/obligations`} className="hover:underline text-red-600">
                      {obligation.title}
                    </Link>
                  </TableCell>
                  <TableCell>{branch?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {new Date(obligation.dueAt).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!dashboardData?.overdue?.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No overdue obligations
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
