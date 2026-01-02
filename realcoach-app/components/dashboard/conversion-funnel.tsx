'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConversionFunnel } from '@/lib/services/sales';

interface ConversionFunnelProps {
  funnel: ConversionFunnel[];
}

export function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Lead': 'bg-slate-500',
      'New Opportunity': 'bg-blue-500',
      'Active Opportunity': 'bg-green-500',
      'Under Contract': 'bg-yellow-500',
      'Closed': 'bg-purple-500',
    };
    return colors[stage] || 'bg-slate-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[300px] space-y-4">
          {funnel.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(stage.stage)}`} />
                  <span className="font-medium text-slate-900">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{stage.count}</span>
                  <span className="text-slate-500">{stage.percentage}%</span>
                  {stage.dropOffFromPrevious !== undefined && stage.dropOffFromPrevious > 0 && (
                    <span className="text-xs text-red-600">
                      -{stage.dropOffFromPrevious} from previous
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-8 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${getStageColor(stage.stage)} transition-all duration-500`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
          </div>
        </div>
        {funnel.every((f) => f.count === 0) && (
          <div className="text-center py-8 text-slate-500">
            <p>No data available</p>
            <p className="text-sm">Add contacts to see your conversion funnel</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
