'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/lib/database.types';

interface StageChange {
  id: string;
  previous_stage: PipelineStage;
  new_stage: PipelineStage;
  change_reason: string | null;
  change_source: string | null;
  confidence: number;
  created_at: string;
}

interface StageProgressProps {
  contactId: string;
  currentStage: PipelineStage;
}

const stages: PipelineStage[] = ['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'];

const stageColors: Record<PipelineStage, { bg: string; text: string; iconBg: string }> = {
  'Lead': { bg: 'bg-slate-100', text: 'text-slate-700', iconBg: 'bg-slate-500' },
  'New Opportunity': { bg: 'bg-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-500' },
  'Active Opportunity': { bg: 'bg-green-100', text: 'text-green-700', iconBg: 'bg-green-500' },
  'Under Contract': { bg: 'bg-yellow-100', text: 'text-yellow-700', iconBg: 'bg-yellow-500' },
  'Closed': { bg: 'bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-500' },
};

export function StageProgress({ contactId, currentStage }: StageProgressProps) {
  const [stageHistory, setStageHistory] = useState<StageChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStageHistory();
  }, [contactId]);

  const fetchStageHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/${contactId}/stage-history`);
      if (!response.ok) {
        throw new Error('Failed to fetch stage history');
      }

      const data = await response.json();
      setStageHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching stage history:', err);
      setError('Failed to load stage history');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStageIndex = stages.indexOf(currentStage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getChangeSourceColor = (source: string | null) => {
    switch (source) {
      case 'system': return 'bg-blue-50 text-blue-700';
      case 'user': return 'bg-green-50 text-green-700';
      case 'ai': return 'bg-purple-50 text-purple-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Pipeline Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Pipeline Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Visualization */}
        <div>
          <p className="text-sm text-slate-500 mb-4">Current stage in the pipeline</p>
          <div className="flex items-center justify-between">
            {stages.map((stage, index) => {
              const isComplete = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const colors = stageColors[stage];

              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete ? colors.iconBg : 'bg-slate-200',
                        isCurrent && 'ring-4 ring-offset-2 ring-' + colors.iconBg.replace('bg-', '')
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'text-xs font-medium mt-2 text-center px-1 py-0.5 rounded',
                        isCurrent ? colors.bg + ' ' + colors.text : 'text-slate-500'
                      )}
                    >
                      {stage.split(' ')[0]}
                    </div>
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={cn(
                        'h-1 flex-1 mx-1 rounded transition-all duration-300',
                        isComplete ? colors.iconBg : 'bg-slate-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Change History */}
        <div>
          <p className="text-sm text-slate-500 mb-4">Stage change history</p>
          {stageHistory.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No stage changes recorded</p>
              <p className="text-xs text-slate-500">
                This contact is currently in their initial stage
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stageHistory.map((change, index) => {
                const isLatest = index === 0;
                return (
                  <div
                    key={change.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all',
                      isLatest ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                    )}
                  >
                    <ArrowRight className={cn(
                      'h-5 w-5 mt-0.5 flex-shrink-0',
                      isLatest ? 'text-blue-600' : 'text-slate-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs">
                          {change.previous_stage}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <Badge className="text-xs bg-blue-100 text-blue-700">
                          {change.new_stage}
                        </Badge>
                        {isLatest && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Current
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getChangeSourceColor(change.change_source))}
                        >
                          {change.change_source || 'system'}
                        </Badge>
                      </div>
                      {change.change_reason && (
                        <p className="text-sm text-slate-700 mb-1">{change.change_reason}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(change.created_at)}
                        {change.confidence > 0 && (
                          <span className="ml-2">
                            {change.confidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 py-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
