'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Send, Paperclip } from 'lucide-react';

export default function IgnitionPage() {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    // Handle submission - will connect to API later
    console.log('Submitting:', input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
              <Sparkle className="h-8 w-8 text-background" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">RealCoach.ai</h1>
            <p className="text-muted-foreground">
              Your AI-powered business growth assistant
            </p>
          </div>

          {/* Input Area */}
          <div className="relative">
            <div className="bg-card border border-border rounded-xl p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSend}
                  className="bg-accent text-background hover:opacity-90"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Share context freely. Nothing changes until you confirm.
        </p>
      </div>
    </div>
  );
}
