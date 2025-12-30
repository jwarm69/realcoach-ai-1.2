'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Phone,
  Mail,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { Conversation, InputType } from '@/lib/database.types';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  contactId: string;
  onLogClick?: () => void;
}

const inputTypeConfig: Record<
  InputType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  text: {
    icon: MessageSquare,
    label: 'Text',
    color: 'bg-blue-100 text-blue-700',
  },
  voice: {
    icon: Phone,
    label: 'Call',
    color: 'bg-green-100 text-green-700',
  },
  screenshot: {
    icon: ImageIcon,
    label: 'Screenshot',
    color: 'bg-purple-100 text-purple-700',
  },
};

export function ActivityTimeline({ contactId, onLogClick }: ActivityTimelineProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [contactId]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversations?contactId=${contactId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load activity timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Activity Timeline
            {onLogClick && (
              <Button onClick={onLogClick} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            )}
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 py-4">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Activity Timeline</span>
          {onLogClick && (
            <Button onClick={onLogClick} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Log Interaction
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-1">No interactions yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Start logging conversations to track your relationship with this contact
            </p>
            {onLogClick && (
              <Button onClick={onLogClick} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log First Interaction
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation, index) => {
              const config = inputTypeConfig[conversation.input_type];
              const Icon = config.icon;
              const isLast = index === conversations.length - 1;

              return (
                <div key={conversation.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-200" />
                  )}

                  {/* Timeline item */}
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10',
                        config.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatDate(conversation.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {truncateContent(conversation.content)}
                      </p>

                      {/* AI Insights */}
                      {(conversation.ai_detected_motivation ||
                        conversation.ai_detected_timeframe ||
                        conversation.ai_suggested_next_action) && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg space-y-1">
                          {conversation.ai_detected_motivation && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">Motivation:</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  conversation.ai_detected_motivation === 'High'
                                    ? 'bg-green-50 text-green-700'
                                    : conversation.ai_detected_motivation === 'Medium'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-50 text-slate-700'
                                )}
                              >
                                {conversation.ai_detected_motivation}
                              </Badge>
                              <span className="text-slate-400">
                                ({conversation.ai_motivation_confidence}% confidence)
                              </span>
                            </div>
                          )}
                          {conversation.ai_detected_timeframe && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">Timeframe:</span>
                              <span className="text-slate-700">
                                {conversation.ai_detected_timeframe}
                              </span>
                            </div>
                          )}
                          {conversation.ai_suggested_next_action && (
                            <div className="text-xs">
                              <span className="text-slate-500">Suggested: </span>
                              <span className="text-slate-700">
                                {conversation.ai_suggested_next_action}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Behavioral Triggers */}
                      {(conversation.triggers_buying_intent ||
                        conversation.triggers_selling_intent ||
                        conversation.triggers_urgency ||
                        conversation.triggers_showings ||
                        conversation.triggers_preapproval) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conversation.triggers_buying_intent && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50">
                              Buying Intent
                            </Badge>
                          )}
                          {conversation.triggers_selling_intent && (
                            <Badge variant="outline" className="text-[10px] bg-purple-50">
                              Selling Intent
                            </Badge>
                          )}
                          {conversation.triggers_urgency && (
                            <Badge variant="outline" className="text-[10px] bg-red-50">
                              Urgent
                            </Badge>
                          )}
                          {conversation.triggers_showings && (
                            <Badge variant="outline" className="text-[10px] bg-green-50">
                              Showings
                            </Badge>
                          )}
                          {conversation.triggers_preapproval && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50">
                              Pre-Approval
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
