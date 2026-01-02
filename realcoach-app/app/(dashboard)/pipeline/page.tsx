'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, DollarSign, Home } from 'lucide-react';

// Mock data - will connect to API later
const metrics = [
  {
    label: 'Appointments Held',
    current: 12,
    target: 20,
    thisMonth: 5,
    icon: Target,
  },
  {
    label: 'Clients Signed',
    current: 4,
    target: 8,
    thisMonth: 2,
    icon: TrendingUp,
  },
  {
    label: 'Closed Units',
    current: 3,
    target: 6,
    thisMonth: 1,
    icon: Home,
  },
  {
    label: 'GCI',
    current: 34800,
    target: 60000,
    thisMonth: 91350,
    icon: DollarSign,
    isCurrency: true,
  },
];

const leads = [
  {
    name: 'Sarah Mitchell',
    dealAmount: '$450,000',
    gci: '$13,500',
    estClose: 'Jan 15',
    status: 'Showing',
    type: 'Buyer',
    source: 'Zillow',
  },
  {
    name: 'James Chen',
    dealAmount: '$625,000',
    gci: '$18,750',
    estClose: 'Jan 22',
    status: 'Under Contract',
    type: 'Buyer',
    source: 'Referral',
  },
  {
    name: 'Emily Rodriguez',
    dealAmount: '$380,000',
    gci: '$11,400',
    estClose: 'Feb 1',
    status: 'Active',
    type: 'Seller',
    source: 'Expired',
  },
  {
    name: 'Michael Thompson',
    dealAmount: '$520,000',
    gci: '$15,600',
    estClose: 'Feb 8',
    status: 'Showing',
    type: 'Buyer',
    source: 'Website',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Showing': 'bg-accent/20 text-accent',
    'Under Contract': 'bg-blue-500/20 text-blue-400',
    'Active': 'bg-yellow-500/20 text-yellow-400',
    'New': 'bg-purple-500/20 text-purple-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

const formatMetric = (value: number, isCurrency: boolean) => {
  if (isCurrency) {
    return `$${value.toLocaleString()}`;
  }
  return value.toString();
};

export default function PipelinePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground mt-1">Track your leads and deals</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const progress = (metric.current / metric.target) * 100;

          return (
            <Card key={metric.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-xl font-bold text-foreground">
                      {metric.isCurrency && '$'}
                      {metric.current.toLocaleString()}
                      <span className="text-sm text-muted-foreground font-normal">
                        /{metric.isCurrency && '$'}
                        {metric.target.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>

                <Progress value={progress} className="h-2 bg-muted" />

                <p className="text-xs text-muted-foreground mt-2">
                  {metric.thisMonth} {metric.isCurrency ? 'in pipeline' : 'this month'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leads Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Lead Name</TableHead>
                <TableHead className="text-muted-foreground">Deal Amount</TableHead>
                <TableHead className="text-muted-foreground">GCI</TableHead>
                <TableHead className="text-muted-foreground">Est Close</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.dealAmount}</TableCell>
                  <TableCell className="text-accent font-medium">{lead.gci}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.estClose}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.type}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
