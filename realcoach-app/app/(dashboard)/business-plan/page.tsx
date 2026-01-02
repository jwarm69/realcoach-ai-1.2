'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - will connect to API later
const mainGoal = {
  title: 'Close $180,000 in GCI',
  subtitle: '2025 Business Goal',
  metric: '15 closed transactions',
};

const columns = [
  {
    title: 'Lead Generation',
    items: [
      'Contact 5 expired listings weekly',
      'Host 2 open houses per month',
      'Post daily on social media',
      'Attend 1 networking event monthly',
      'Follow up with all internet leads within 15 minutes',
    ],
  },
  {
    title: 'Client Experience',
    items: [
      'Send weekly market updates to active clients',
      'Provide video walkthroughs for all new listings',
      'Schedule monthly check-in calls',
      'Send handwritten thank you notes after each meeting',
      'Create custom property search alerts',
    ],
  },
  {
    title: 'Leverage & Scale',
    items: [
      'Hire part-time showing assistant',
      'Implement CRM automation',
      'Build referral partner network',
      'Create video content library',
      'Develop email drip campaigns',
    ],
  },
];

export default function BusinessPlanPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Business Plan</h1>
        <p className="text-muted-foreground mt-1">Your strategic focus for the year</p>
      </div>

      {/* Main Goal Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{mainGoal.title}</h2>
              <p className="text-muted-foreground">{mainGoal.subtitle} • {mainGoal.metric}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Card key={column.title} className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
