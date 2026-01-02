import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PipelineBadge } from '@/components/contacts/pipeline-badge';
import { ActionButtons } from '@/components/dashboard/action-buttons';
import { getTopPriorityContacts } from '@/lib/services/stats';
import { getPriorityLevel, getPriorityColor } from '@/lib/engines/priority-calculator';
import {
  Target,
  Phone,
  Mail,
  Calendar,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Flame,
  User,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StageFilter = 'all' | 'Lead' | 'New Opportunity' | 'Active Opportunity' | 'Under Contract';

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: { stage?: StageFilter; urgency?: FilterType; date?: string };
}) {
  const stageFilter = searchParams.stage || 'all';
  const urgencyFilter = searchParams.urgency || 'all';
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0];

  // Fetch all priority contacts (we'll filter on the client for now)
  const priorityContacts = await getTopPriorityContacts(50);

  // Filter contacts
  const filteredContacts = priorityContacts.filter((contact) => {
    // Stage filter
    if (stageFilter !== 'all' && contact.pipeline_stage !== stageFilter) {
      return false;
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      const score = contact.priority_score || 0;
      if (urgencyFilter === 'critical' && score < 80) return false;
      if (urgencyFilter === 'high' && score < 60) return false;
      if (urgencyFilter === 'medium' && (score < 40 || score >= 60)) return false;
      if (urgencyFilter === 'low' && score >= 40) return false;
    }

    return true;
  });

  // Group by urgency for display
  const criticalContacts = filteredContacts.filter((c) => (c.priority_score || 0) >= 80);
  const highPriorityContacts = filteredContacts.filter((c) => (c.priority_score || 0) >= 60 && (c.priority_score || 0) < 80);
  const mediumPriorityContacts = filteredContacts.filter((c) => (c.priority_score || 0) >= 40 && (c.priority_score || 0) < 60);
  const lowPriorityContacts = filteredContacts.filter((c) => (c.priority_score || 0) < 40);

  const totalContacts = filteredContacts.length;
  const sevenDayViolations = filteredContacts.filter((c) => c.seven_day_rule_flag).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600" />
            Daily Actions
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? `${totalContacts} priority action${totalContacts !== 1 ? 's' : ''} for today`
              : `Actions for ${new Date(selectedDate).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Actions</p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalContacts.length}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">7-Day Violations</p>
                <p className="text-2xl font-bold text-orange-600">{sevenDayViolations}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Opps</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredContacts.filter((c) => c.pipeline_stage === 'Active Opportunity').length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Stage Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Stage:</label>
              <div className="flex gap-1">
                <Button
                  variant={stageFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions">All</Link>
                </Button>
                <Button
                  variant={stageFilter === 'Active Opportunity' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions?stage=Active+Opportunity">Active</Link>
                </Button>
                <Button
                  variant={stageFilter === 'New Opportunity' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions?stage=New+Opportunity">New</Link>
                </Button>
                <Button
                  variant={stageFilter === 'Lead' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions?stage=Lead">Leads</Link>
                </Button>
              </div>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Urgency:</label>
              <div className="flex gap-1">
                <Button
                  variant={urgencyFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions">All</Link>
                </Button>
                <Button
                  variant={urgencyFilter === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions?urgency=critical">Critical</Link>
                </Button>
                <Button
                  variant={urgencyFilter === 'high' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/actions?urgency=high">High</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      {filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No actions found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {stageFilter !== 'all' || urgencyFilter !== 'all'
                ? 'Try adjusting your filters to see more contacts'
                : 'Add contacts to start receiving action recommendations'}
            </p>
            {stageFilter === 'all' && urgencyFilter === 'all' && (
              <Button asChild>
                <Link href="/contacts/new">
                  <Users className="h-4 w-4 mr-2" />
                  Add Contact
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Critical Priority */}
          {criticalContacts.length > 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Critical Priority ({criticalContacts.length})
                </CardTitle>
                <CardDescription>Requires immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalContacts.map((contact) => (
                  <ActionCard key={contact.id} contact={contact} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* High Priority */}
          {highPriorityContacts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  High Priority ({highPriorityContacts.length})
                </CardTitle>
                <CardDescription>Important contacts to follow up with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {highPriorityContacts.map((contact) => (
                  <ActionCard key={contact.id} contact={contact} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Medium Priority */}
          {mediumPriorityContacts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Medium Priority ({mediumPriorityContacts.length})
                </CardTitle>
                <CardDescription>Routine follow-ups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mediumPriorityContacts.map((contact) => (
                  <ActionCard key={contact.id} contact={contact} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Low Priority */}
          {lowPriorityContacts.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  Lower Priority ({lowPriorityContacts.length})
                </CardTitle>
                <CardDescription>When time permits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowPriorityContacts.map((contact) => (
                  <ActionCard key={contact.id} contact={contact} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function ActionCard({ contact }: { contact: any }) {
  const priorityScore = contact.priority_score || 0;
  const priorityLevel = getPriorityLevel(priorityScore);
  const priorityColor = getPriorityColor(priorityScore);

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Link
            href={`/contacts/${contact.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600"
          >
            {contact.name}
          </Link>
          <PipelineBadge stage={contact.pipeline_stage} />
          <Badge variant="outline" className={`text-xs ${priorityColor}`}>
            {priorityLevel}
          </Badge>
          {contact.seven_day_rule_flag && (
            <Badge variant="destructive" className="text-xs">7-Day Violation</Badge>
          )}
        </div>

        {/* Reason */}
        <p className="text-sm text-slate-700 mb-2">{contact.priorityReason}</p>

        {/* Next Action */}
        {contact.nextAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
            <p className="text-xs font-medium text-blue-900 mb-1">
              Recommended: {contact.nextAction.type}
            </p>
            <p className="text-sm text-blue-800 italic line-clamp-2">
              "{contact.nextAction.script}"
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {contact.motivation_level && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {contact.motivation_level}
            </span>
          )}
          {contact.timeframe && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {contact.timeframe}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {contact.days_since_contact} days since contact
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons contact={contact} />
    </div>
  );
}
