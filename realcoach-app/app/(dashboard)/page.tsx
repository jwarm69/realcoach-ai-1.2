import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PipelineBadge } from '@/components/contacts/pipeline-badge';
import {
  Users,
  Target,
  TrendingUp,
  Flame,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { getDashboardStats, getTopPriorityContacts } from '@/lib/services/stats';
import { getPriorityLevel, getPriorityColor } from '@/lib/engines/priority-calculator';

export default async function DashboardPage() {
  // Fetch real data
  const stats = await getDashboardStats();
  const priorityContacts = await getTopPriorityContacts(5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to RealCoach AI</h2>
        <p className="text-blue-100 mb-4">
          Your behavioral intelligence assistant for real estate success. Let&apos;s get you started!
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/contacts/new">
              <Users className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
          <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10" asChild>
            <Link href="/contacts">
              View All Contacts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Contacts</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalContacts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Opportunities</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeOpportunities}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Today&apos;s Actions</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.completedToday}/{stats.todayActions}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-slate-900">{stats.streak} days</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Priority Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Today&apos;s Priority Actions
                </CardTitle>
                <CardDescription>Your most important contacts to reach out to today</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {priorityContacts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">No contacts yet</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Add your first contact to start receiving daily action recommendations
                </p>
                <Button asChild>
                  <Link href="/contacts/new">
                    <Users className="h-4 w-4 mr-2" />
                    Add Contact
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {priorityContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-medium text-slate-900 hover:text-blue-600"
                        >
                          {contact.name}
                        </Link>
                        <PipelineBadge stage={contact.pipeline_stage} />
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(contact.priority_score)}`}
                        >
                          {getPriorityLevel(contact.priority_score)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{contact.priorityReason}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {contact.motivation_level && (
                          <span>{contact.motivation_level} motivation</span>
                        )}
                        {contact.timeframe && (
                          <span>{contact.timeframe}</span>
                        )}
                        <span>{contact.days_since_contact} days since contact</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${contact.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {contact.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${contact.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button size="sm" asChild>
                        <Link href={`/contacts/${contact.id}`}>
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consistency Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Consistency Score
            </CardTitle>
            <CardDescription>Your 5-contacts-per-day goal progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${stats.consistencyScore * 3.52} 352`}
                    strokeLinecap="round"
                    className="text-orange-500 transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-slate-900">
                  {stats.consistencyScore}%
                </span>
              </div>
            </div>

            {/* Last 7 Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current Streak</span>
                <span className="font-medium text-slate-900">{stats.streak} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Today&apos;s Progress</span>
                <span className="font-medium text-slate-900">
                  {stats.completedToday}/5 contacts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Rating</span>
                <Badge variant="outline" className="bg-slate-100">
                  Getting Started
                </Badge>
              </div>
            </div>

            {/* Weekly Chart Placeholder */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500 mb-2">Last 7 Days</p>
              <div className="flex items-end gap-1 h-16">
                {[0, 0, 0, 0, 0, 0, 0].map((count, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-slate-200 rounded-t"
                    style={{ height: `${Math.max((count / 5) * 100, 10)}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-400">Mon</span>
                <span className="text-xs text-slate-400">Sun</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>Your contacts organized by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { stage: 'Lead' as const, count: stats.contactsByStage.Lead, color: 'bg-slate-500' },
              { stage: 'New Opportunity' as const, count: stats.contactsByStage['New Opportunity'], color: 'bg-blue-500' },
              { stage: 'Active Opportunity' as const, count: stats.contactsByStage['Active Opportunity'], color: 'bg-green-500' },
              { stage: 'Under Contract' as const, count: stats.contactsByStage['Under Contract'], color: 'bg-yellow-500' },
              { stage: 'Closed' as const, count: stats.contactsByStage.Closed, color: 'bg-purple-500' },
            ].map((pipeline) => (
              <Link
                key={pipeline.stage}
                href={`/contacts?stage=${encodeURIComponent(pipeline.stage)}`}
                className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className={`w-3 h-3 ${pipeline.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-bold text-slate-900">{pipeline.count}</p>
                <p className="text-xs text-slate-500">{pipeline.stage}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Import Contacts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Sync with Mailchimp
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Generate Daily Actions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.sevenDayViolations > 0 ? (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 text-sm">7-Day Rule Violations</p>
                      <p className="text-sm text-red-700 mt-1">
                        {stats.sevenDayViolations} active {stats.sevenDayViolations === 1 ? 'opportunity' : 'opportunities'} haven't been contacted in 7+ days
                      </p>
                      <Button size="sm" variant="outline" className="mt-2 border-red-300 text-red-700 hover:bg-red-100" asChild>
                        <Link href="/contacts?sevenDayRule=true">
                          Review Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-slate-600">No alerts at this time</p>
                <p className="text-xs text-slate-500 mt-1">All active opportunities are engaged</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
