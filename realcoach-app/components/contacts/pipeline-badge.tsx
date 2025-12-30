import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/lib/database.types';

interface PipelineBadgeProps {
  stage: PipelineStage;
  size?: 'sm' | 'default';
  className?: string;
}

const stageConfig: Record<PipelineStage, { bg: string; text: string; dot: string }> = {
  'Lead': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },
  'New Opportunity': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  'Active Opportunity': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  'Under Contract': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  'Closed': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
};

export function PipelineBadge({ stage, size = 'default', className }: PipelineBadgeProps) {
  const config = stageConfig[stage];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', config.dot)} />
      {stage}
    </Badge>
  );
}

export function PipelineDot({ stage, className }: { stage: PipelineStage; className?: string }) {
  const config = stageConfig[stage];
  return <span className={cn('w-2 h-2 rounded-full', config.dot, className)} />;
}
