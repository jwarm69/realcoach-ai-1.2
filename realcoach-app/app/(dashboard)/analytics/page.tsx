import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getAnalyticsOverview,
  type TimePeriod,
} from '@/lib/services/analytics';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  Flame,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

type FilterPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: FilterPeriod };
}) {
  const period = (searchParams.period || 'all') as TimePeriod;

  let analytics;
  let error = null;

  try {
    analytics = await getAnalyticsOverview(period);
  } catch (err: any) {
    console.error('Analytics page error:', err);
    error = err.message || 'Failed to load analytics';
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              Advanced Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Deep dive into your pipeline performance
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Unable to load analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error || 'Please try again later'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into your pipeline performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-medium">Time Period</p>
            <div className="flex flex-wrap gap-1">
              <PeriodButton period="week" current={period} />
              <PeriodButton period="month" current={period} />
              <PeriodButton period="quarter" current={period} />
              <PeriodButton period="year" current={period} />
              <PeriodButton period="all" current={period} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Contacts"
          value={summary.totalContacts}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          label="Active Opps"
          value={summary.activeOpportunities}
          icon={<Target className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          label="Closed Deals"
          value={summary.closedDeals}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary.overallConversionRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
          color="bg-indigo-100"
        />
        <StatCard
          label="Avg Pipeline Days"
          value={summary.avgPipelineVelocity}
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      {/* Pipeline Velocity */}
      {analytics.pipelineVelocity.length > 0 && (
        <PipelineVelocityChart data={analytics.pipelineVelocity} />
      )}

      {/* Stage Conversions */}
      {analytics.stageConversions.length > 0 && (
        <StageConversions data={analytics.stageConversions} />
      )}

      {/* Activity Trends */}
      {analytics.activityTrends.length > 0 && (
        <ActivityTrendsChart data={analytics.activityTrends} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Performance */}
        {analytics.sourcePerformance.length > 0 && (
          <SourcePerformanceChart data={analytics.sourcePerformance} />
        )}

        {/* Motivation Distribution */}
        {analytics.motivationDistribution.length > 0 && (
          <MotivationDistribution data={analytics.motivationDistribution} />
        )}
      </div>

      {/* Timeframe Distribution */}
      {analytics.timeframeDistribution.length > 0 && (
        <TimeframeDistribution data={analytics.timeframeDistribution} />
      )}

      {/* Empty State */}
      {analytics.pipelineVelocity.length === 0 &&
       analytics.stageConversions.length === 0 &&
       analytics.sourcePerformance.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No analytics data</h3>
            <p className="text-sm text-slate-500 mb-4">
              Add contacts and track their progress to see analytics
            </p>
            <Button asChild>
              <Link href="/contacts/new">
                <Users className="h-4 w-4 mr-2" />
                Add Contact
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===========================================
// Sub-components
// ===========================================

function PeriodButton({ period, current }: { period: FilterPeriod; current: TimePeriod }) {
  const isActive = period === current;
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      asChild
    >
      <Link href={`/analytics?period=${period}`}>
        {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
      </Link>
    </Button>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`h-10 w-10 ${color} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PipelineVelocityChartProps {
  data: Array<{
    stage: string;
    averageDays: number;
    contactCount: number;
    benchmarkDays: number;
    variance: number;
  }>;
}

function PipelineVelocityChart({ data }: PipelineVelocityChartProps) {
  const maxDays = Math.max(...data.map((d) => d.averageDays), 1);

  const getVarianceIcon = (variance: number) => {
    if (variance > 10) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (variance < -10) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return 'text-red-600 bg-red-50';
    if (variance < -10) return 'text-green-600 bg-green-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Pipeline Velocity
        </CardTitle>
        <CardDescription>Average days contacts spend in each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{item.stage}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.contactCount} contacts
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.averageDays} days</span>
                  <span className="text-xs text-slate-500">Benchmark: {item.benchmarkDays}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getVarianceColor(item.variance)}`}>
                    {getVarianceIcon(item.variance)}
                    <span className="text-xs font-medium">{item.variance > 0 ? '+' : ''}{item.variance}%</span>
                  </div>
                </div>
              </div>
              <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                  style={{ width: `${(item.averageDays / maxDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface StageConversionsProps {
  data: Array<{
    fromStage: string;
    toStage: string;
    conversions: number;
    rate: number;
    avgTimeToConvert: number;
  }>;
}

function StageConversions({ data }: StageConversionsProps) {
  const maxRate = Math.max(...data.map((d) => d.rate), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-blue-600" />
          Stage Conversion Rates
        </CardTitle>
        <CardDescription>How contacts move through your pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={`${item.fromStage}-${item.toStage}`} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{item.fromStage}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-900">{item.toStage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-600">{item.rate}%</span>
                  <span className="text-slate-500">{item.conversions} converted</span>
                  {item.avgTimeToConvert > 0 && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Avg {item.avgTimeToConvert} days
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${(item.rate / maxRate) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityTrendsChartProps {
  data: Array<{
    date: string;
    contacts: number;
    conversations: number;
    stageChanges: number;
    newLeads: number;
  }>;
}

function ActivityTrendsChart({ data }: ActivityTrendsChartProps) {
  const maxActivity = Math.max(
    ...data.map((d) => Math.max(d.contacts, d.conversations, d.stageChanges)),
    1
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Activity Trends
        </CardTitle>
        <CardDescription>Your activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(-12).map((item) => (
            <div key={item.date} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{formatDate(item.date)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-green-600">{item.newLeads} new</span>
                  <span className="text-blue-600">{item.conversations} conv</span>
                  <span className="text-purple-600">{item.stageChanges} changes</span>
                </div>
              </div>
              <div className="flex gap-1 h-8">
                <div
                  className="bg-green-500 rounded-l"
                  style={{ width: `${(item.newLeads / maxActivity) * 100}%`, minWidth: item.newLeads > 0 ? '4px' : 0 }}
                  title={`${item.newLeads} new leads`}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(item.conversations / maxActivity) * 100}%`, minWidth: item.conversations > 0 ? '4px' : 0 }}
                  title={`${item.conversations} conversations`}
                />
                <div
                  className="bg-purple-500 rounded-r"
                  style={{ width: `${(item.stageChanges / maxActivity) * 100}%`, minWidth: item.stageChanges > 0 ? '4px' : 0 }}
                  title={`${item.stageChanges} stage changes`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>New Leads</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Conversations</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span>Stage Changes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SourcePerformanceChartProps {
  data: Array<{
    source: string;
    totalContacts: number;
    activeContacts: number;
    closedDeals: number;
    conversionRate: number;
    avgDaysToClose: number;
  }>;
}

function SourcePerformanceChart({ data }: SourcePerformanceChartProps) {
  const maxContacts = Math.max(...data.map((d) => d.totalContacts), 1);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-600" />
          Lead Source Performance
        </CardTitle>
        <CardDescription>Which sources bring the best deals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.source} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <span className="font-medium text-slate-900">{item.source}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600">{item.totalContacts} total</span>
                  <span className="text-green-600">{item.closedDeals} closed</span>
                  <Badge variant="outline" className="text-xs">
                    {item.conversionRate}% rate
                  </Badge>
                </div>
              </div>
              <div className="relative h-5 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${(item.totalContacts / maxContacts) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MotivationDistributionProps {
  data: Array<{
    level: 'High' | 'Medium' | 'Low';
    count: number;
    percentage: number;
    avgPriorityScore: number;
  }>;
}

function MotivationDistribution({ data }: MotivationDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'High': return <Flame className="h-4 w-4 text-green-600" />;
      case 'Medium': return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <AlertCircle className="h-4 w-4 text-slate-600" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-600" />
          Motivation Distribution
        </CardTitle>
        <CardDescription>Contact motivation levels breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.level} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getLevelIcon(item.level)}
                  <span className="font-medium text-slate-900">{item.level} Motivation</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                  <Badge variant="outline" className="text-xs">
                    Avg: {item.avgPriorityScore}
                  </Badge>
                </div>
              </div>
              <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${getLevelColor(item.level)} transition-all duration-500`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TimeframeDistributionProps {
  data: Array<{
    timeframe: string;
    count: number;
    percentage: number;
    closedDeals: number;
  }>;
}

function TimeframeDistribution({ data }: TimeframeDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'Immediate': return 'bg-red-500';
      case '1-3 months': return 'bg-orange-500';
      case '3-6 months': return 'bg-yellow-500';
      case '6+ months': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getUrgencyIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'Immediate': return <Zap className="h-4 w-4 text-red-600" />;
      case '1-3 months': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case '3-6 months': return <Clock className="h-4 w-4 text-yellow-600" />;
      case '6+ months': return <Calendar className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Timeframe Distribution
        </CardTitle>
        <CardDescription>Buyer timeframe breakdown and close rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.timeframe} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getUrgencyIcon(item.timeframe)}
                  <span className="font-medium text-slate-900">{item.timeframe}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                  {item.closedDeals > 0 && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                      {item.closedDeals} closed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${getTimeframeColor(item.timeframe)} transition-all duration-500`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
