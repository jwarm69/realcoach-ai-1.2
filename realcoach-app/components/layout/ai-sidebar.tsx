'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkle, Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  className?: string;
}

export function AISidebar({ className }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Good morning! I'm here to help you stay on track with your goals. You have 5 priority actions for today. Would you like me to walk through them?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand. Let me help you with that...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <aside className={cn('w-80 border-l border-border bg-card flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent text-background">
              <Sparkle className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">RealCoach</h3>
            <p className="text-xs text-muted-foreground">Your AI advisor</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarFallback className="bg-accent text-background text-xs">
                    <Sparkle className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2',
                  message.role === 'assistant'
                    ? 'bg-muted text-foreground'
                    : 'bg-accent text-background'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message RealCoach.ai"
            className="flex-1 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-8 w-8 bg-accent text-background hover:opacity-90"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
