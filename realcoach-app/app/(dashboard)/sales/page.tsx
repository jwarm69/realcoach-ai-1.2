import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesMetricCard } from '@/components/dashboard/sales-metric-card';
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel';
import { LeadSourceChart } from '@/components/dashboard/lead-source-chart';
import { Calendar, DollarSign, Home, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { getSalesMetrics, getConversionFunnel, getLeadSourceDistribution, type TimePeriod } from '@/lib/services/sales';

async function getSalesData(period: TimePeriod) {
  try {
    const [metrics, funnel, leadSources] = await Promise.all([
      getSalesMetrics(period),
      getConversionFunnel(),
      getLeadSourceDistribution(),
    ]);
    return { metrics, funnel, leadSources, error: null };
  } catch (error: any) {
    console.error('Sales dashboard error:', error);
    return {
      metrics: null,
      funnel: null,
      leadSources: null,
      error: error.message || 'Failed to load sales data',
    };
  }
}

export default async function SalesDashboardPage({
  searchParams,
}: {
  searchParams: { period?: TimePeriod };
}) {
  const period = searchParams.period || 'month';
  const { metrics, funnel, leadSources, error } = await getSalesData(period);

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return undefined;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  // Show error state if data fetching failed
  if (error || !metrics || !funnel || !leadSources) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sales Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Track your 4 Conversations and performance metrics</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Unable to load sales data</h3>
                <p className="text-sm text-red-700 mt-1">{error || 'Please try again later or contact support if the problem persists.'}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sales Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Track your 4 Conversations and performance metrics</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue={period} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm text-slate-500">Time Period</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <TabsTrigger value="today" asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href="/sales?period=today">Today</a>
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="week" asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href="/sales?period=week">Week</a>
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="month" asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href="/sales?period=month">Month</a>
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="quarter" asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href="/sales?period=quarter">Quarter</a>
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="year" asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href="/sales?period=year">Year</a>
                  </Button>
                </TabsTrigger>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <SalesMetricCard
          title="Appointments"
          value={metrics.appointments}
          previousValue={metrics.previousPeriod?.appointments}
          unit=""
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
          trend={getTrend(metrics.appointments, metrics.previousPeriod?.appointments)}
        />
        <SalesMetricCard
          title="Listings"
          value={metrics.listings}
          previousValue={metrics.previousPeriod?.listings}
          unit=""
          icon={<Home className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
          trend={getTrend(metrics.listings, metrics.previousPeriod?.listings)}
        />
        <SalesMetricCard
          title="Closings"
          value={metrics.closings}
          previousValue={metrics.previousPeriod?.closings}
          unit=""
          icon={<FileText className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
          trend={getTrend(metrics.closings, metrics.previousPeriod?.closings)}
        />
        <SalesMetricCard
          title="GCI"
          value={metrics.gci}
          previousValue={metrics.previousPeriod?.gci}
          unit="$"
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          color="bg-amber-100"
          trend={getTrend(metrics.gci, metrics.previousPeriod?.gci)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Funnel: horizontal scroll on mobile */}
        <ConversionFunnel funnel={funnel} />
        <LeadSourceChart data={leadSources} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {funnel.length > 0 && funnel[0].count > 0
                  ? `${Math.round((funnel[4].count / funnel[0].count) * 100)}%`
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lead to Closed</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Avg Deal Value</p>
              <p className="text-2xl font-bold text-slate-900">
                {metrics.closings > 0
                  ? `$${Math.round(metrics.gci / metrics.closings).toLocaleString()}`
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Per closing</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Active Pipeline</p>
              <p className="text-2xl font-bold text-slate-900">
                {funnel.slice(0, 3).reduce((sum, f) => sum + f.count, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Leads through Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
