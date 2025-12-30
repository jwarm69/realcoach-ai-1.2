'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisResult {
  patterns: {
    buyingIntent: boolean;
    sellingIntent: boolean;
    urgency: boolean;
    confidence: number;
  };
  entities: {
    motivation: { level: string | null; confidence: number };
    timeframe: { range: string | null; confidence: number };
  };
  stage: {
    currentStage: string;
    confidence: number;
    suggestedTransition?: { from: string; to: string; confidence: number };
  };
  nextAction: {
    actionType: string;
    urgency: number;
    script: string;
    rationale: string;
  };
  replyDraft: {
    fullReply: string;
    tone: string;
  };
  analysisMetadata: {
    totalEstimatedCost: number;
    confidence: number;
  };
}

interface AIAnalyzedTextInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  contactId: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
}

export function AIAnalyzedTextInput({
  value,
  placeholder,
  disabled,
  contactId,
  onChange,
  onSend,
  onAnalysisComplete,
}: AIAnalyzedTextInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeConversation = async () => {
    if (!value.trim() || !contactId) {
      toast.error('Please enter a conversation to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: value,
          contactId,
          generateReply: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIAnalysisResult = await response.json();
      setAnalysis(result);
      setShowAnalysis(true);
      onAnalysisComplete?.(result);

      toast.success(`Analysis complete (Cost: $${result.analysisMetadata.totalEstimatedCost.toFixed(4)})`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze conversation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder || "Enter conversation or paste text..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          className="flex-1"
          disabled={disabled}
        />
        <Button
          onClick={analyzeConversation}
          disabled={disabled || isAnalyzing || !value.trim()}
          variant="outline"
          size="icon"
          title="Analyze with AI"
        >
          <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={onSend} size="icon" disabled={disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {showAnalysis && analysis && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">AI Analysis</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Confidence: {analysis.analysisMetadata.confidence}%
              </Badge>
              <Badge variant="secondary">
                ${analysis.analysisMetadata.totalEstimatedCost.toFixed(4)}
              </Badge>
            </div>
          </div>

          {analysis.patterns.confidence > 0 && (
            <div className="flex flex-wrap gap-1">
              {analysis.patterns.buyingIntent && (
                <Badge variant="default">Buying Intent</Badge>
              )}
              {analysis.patterns.sellingIntent && (
                <Badge variant="default">Selling Intent</Badge>
              )}
              {analysis.patterns.urgency && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
          )}

          {analysis.entities.motivation.level && (
            <div className="text-sm">
              <span className="font-medium">Motivation:</span> {analysis.entities.motivation.level}
              <span className="text-muted-foreground ml-2">
                ({analysis.entities.motivation.confidence}%)
              </span>
            </div>
          )}

          {analysis.stage.suggestedTransition && (
            <div className="flex items-start gap-2 text-sm p-2 bg-blue-50 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <span className="font-medium">Stage Change Suggested:</span>{' '}
                {analysis.stage.suggestedTransition.from} → {analysis.stage.suggestedTransition.to}
                <span className="text-muted-foreground ml-2">
                  ({analysis.stage.suggestedTransition.confidence}%)
                </span>
              </div>
            </div>
          )}

          {analysis.nextAction.script && (
            <div className="text-sm">
              <span className="font-medium">Next Action:</span>{' '}
              <Badge variant="outline">{analysis.nextAction.actionType}</Badge>
              <span className="text-muted-foreground ml-1">
                (Urgency: {analysis.nextAction.urgency}/10)
              </span>
              <p className="mt-1 text-muted-foreground">{analysis.nextAction.script}</p>
            </div>
          )}

          {analysis.replyDraft.fullReply && (
            <div className="text-sm">
              <span className="font-medium">Suggested Reply:</span>
              <span className="text-muted-foreground ml-2">({analysis.replyDraft.tone})</span>
              <p className="mt-1 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                {analysis.replyDraft.fullReply}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalysis(false)}
            className="w-full"
          >
            Close Analysis
          </Button>
        </Card>
      )}
    </div>
  );
}
