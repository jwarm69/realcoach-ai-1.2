'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeadSourceData } from '@/lib/services/sales';

interface LeadSourceChartProps {
  data: LeadSourceData[];
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No lead source data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((source, index) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                    />
                    <span className="font-medium text-slate-900">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{source.count}</span>
                    <span className="text-slate-500">{source.percentage}%</span>
                  </div>
                </div>
                <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${(source.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
