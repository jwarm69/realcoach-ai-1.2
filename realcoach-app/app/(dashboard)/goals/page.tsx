'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle2, Circle } from 'lucide-react';

// Mock data - will connect to API later
const yearlyGoal = {
  title: 'GCI TARGET',
  value: '$180,000',
  period: 'Jan 2025 - Dec 2025',
  current: 34800,
  target: 180000,
};

const monthlyMetrics = [
  { title: 'APPOINTMENTS', current: 5, target: 8, status: '3 more to reach goal' },
  { title: 'ACTIONS', current: 7, target: 20, status: '13 more to reach goal' },
  { title: 'SIGNED', current: 2, target: 4, status: '2 more to reach goal' },
];

const todaysActions = [
  {
    id: 1,
    title: 'Follow up with Sarah Mitchell',
    description: 'She viewed the property on Maple Street yesterday',
    type: 'call',
  },
  {
    id: 2,
    title: 'Send market report to James Chen',
    description: 'Comparable sales for his neighborhood',
    type: 'email',
  },
  {
    id: 3,
    title: 'Call expired listing owner',
    description: 'The property on Oak Ave expired last week',
    type: 'call',
  },
];

const completedActions = [
  {
    id: 4,
    title: 'Morning review of pipeline',
    description: 'Reviewed all 12 active opportunities',
  },
  {
    id: 5,
    title: 'Email open house follow-up',
    description: 'Sent to 5 attendees from Sunday',
  },
];

export default function GoalsPage() {
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  const toggleComplete = (id: number) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Goals & Actions</h1>
        <p className="text-muted-foreground mt-1">Track your progress and daily priorities</p>
      </div>

      {/* Yearly Goal Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">{yearlyGoal.title}</p>
              <p className="text-4xl font-bold text-foreground mt-1">{yearlyGoal.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{yearlyGoal.period}</p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(yearlyGoal.current / yearlyGoal.target) * 201} 201`}
                  strokeLinecap="round"
                  className="text-accent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">
                  {Math.round((yearlyGoal.current / yearlyGoal.target) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* January Goals */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">January Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlyMetrics.map((metric) => (
              <div key={metric.title} className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {metric.current} / {metric.target}
                </p>
                <Progress
                  value={(metric.current / metric.target) * 100}
                  className="h-2 bg-muted mt-3"
                />
                <p className="text-xs text-muted-foreground mt-2">{metric.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Actions */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Today&apos;s Actions</h2>
          <div className="space-y-2">
            {todaysActions.map((action) => {
              const isCompleted = completedIds.has(action.id);
              return (
                <div
                  key={action.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors cursor-pointer ${
                    isCompleted ? 'border-muted bg-muted/30' : 'border-accent bg-muted/50'
                  }`}
                  onClick={() => toggleComplete(action.id)}
                >
                  <button className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {action.title}
                    </p>
                    <p className={`text-sm ${isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                      {action.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                    {action.type === 'call' ? 'Call' : 'Email'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Completed</h2>
          <div className="space-y-2">
            {completedActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-accent bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-foreground line-through opacity-70">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
