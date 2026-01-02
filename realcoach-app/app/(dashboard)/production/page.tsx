'use client';

import { Card, CardContent } from '@/components/ui/card';

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  target: number;
  label: string;
  sublabel: string;
  size?: number;
}

function CircularProgress({ value, target, label, sublabel, size = 100 }: CircularProgressProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="text-accent"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground mt-3">{label}</p>
      <p className="text-xs text-muted-foreground">{target - value > 0 ? `${target - value} to goal` : 'Goal reached!'}</p>
      <p className="text-xs text-accent mt-1">{sublabel}</p>
    </div>
  );
}

// Revenue Chart Component
interface RevenueBar {
  quarter: string;
  closed: number;
  forecasted: number;
}

function RevenueChart({ data }: { data: RevenueBar[] }) {
  const maxValue = Math.max(...data.flatMap((d) => [d.closed, d.forecasted]));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Closed GCI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent/40" />
          <span className="text-sm text-muted-foreground">Forecasted GCI</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.quarter} className="space-y-1">
            <p className="text-xs text-muted-foreground">{item.quarter}</p>
            <div className="flex gap-1 h-8">
              <div
                className="bg-accent rounded-t"
                style={{ width: `${(item.closed / maxValue) * 100}%` }}
              />
              <div
                className="bg-accent/40 rounded-t"
                style={{ width: `${(item.forecasted / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductionPage() {
  const goalData = [
    { value: 12, target: 20, label: 'Appointments', sublabel: '5 this month' },
    { value: 4, target: 8, label: 'Signed', sublabel: '2 this month' },
    { value: 3, target: 6, label: 'Closed', sublabel: '1 this month' },
    { value: 35, target: 45, label: 'GCI (K)', sublabel: '$91K in pipeline' },
  ];

  const revenueData = [
    { quarter: 'Q1', closed: 15000, forecasted: 45000 },
    { quarter: 'Q2', closed: 28000, forecasted: 35000 },
    { quarter: 'Q3', closed: 0, forecasted: 50000 },
    { quarter: 'Q4', closed: 0, forecasted: 50000 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Production Dashboard</h1>
        <p className="text-muted-foreground mt-1">How you're doing relative to your goals</p>
      </div>

      {/* Goal Alignment Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Goal Alignment</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {goalData.map((goal, index) => (
              <CircularProgress key={index} {...goal} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Reality Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Revenue Reality</h2>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>
    </div>
  );
}
