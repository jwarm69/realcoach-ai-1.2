'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateActionsButtonProps {
  hasActionsToday?: boolean;
  onGenerationComplete?: () => void;
}

export function GenerateActionsButton({
  hasActionsToday = false,
  onGenerationComplete
}: GenerateActionsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateActions = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/actions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate actions');
      }

      if (data.alreadyExisted) {
        toast.info(
          `Actions already exist for today. You have ${data.actionsCount} priority actions.`
        );
      } else if (data.actionsCount > 0) {
        toast.success(
          `Successfully generated ${data.actionsCount} priority actions for today!`,
          {
            description: 'Check your Priority Actions section below.'
          }
        );
      } else {
        toast.warning(
          'No actions generated',
          {
            description: 'Add more contacts or ensure they have motivation and timeframe info.'
          }
        );
      }

      // Refresh the page data
      if (onGenerationComplete) {
        onGenerationComplete();
      } else {
        // Default: refresh the page
        window.location.reload();
      }

    } catch (error) {
      console.error('Error generating actions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate actions',
        {
          description: 'Please try again or contact support if the issue persists.'
        }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateActions}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {hasActionsToday ? 'Regenerate Actions' : 'Generate Today\'s Actions'}
        </>
      )}
    </Button>
  );
}
