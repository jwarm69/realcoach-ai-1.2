'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { InputType } from '@/lib/database.types';

interface LogConversationDialogProps {
  contactId: string;
  contactName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const inputTypes: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text Message' },
  { value: 'voice', label: 'Voice Call' },
  { value: 'screenshot', label: 'Screenshot' },
];

export function LogConversationDialog({
  contactId,
  contactName,
  open,
  onOpenChange,
  onSuccess,
}: LogConversationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<InputType>('text');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter conversation content');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          input_type: inputType,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log conversation');
      }

      toast.success('Conversation logged successfully');
      
      // Reset form
      setContent('');
      setInputType('text');
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error('Error logging conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Log Conversation
            </DialogTitle>
            <DialogDescription>
              Record your interaction with {contactName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Input Type */}
            <div className="space-y-2">
              <Label htmlFor="inputType">Interaction Type</Label>
              <Select value={inputType} onValueChange={(v) => setInputType(v as InputType)}>
                <SelectTrigger id="inputType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {inputTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Conversation Summary *
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  inputType === 'text'
                    ? 'e.g., Discussed their budget and preferred neighborhoods...'
                    : inputType === 'voice'
                    ? 'e.g., Called to follow up on yesterday\'s showing...'
                    : 'e.g., Screenshot of text conversation about pricing...'
                }
                rows={6}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">
                Include key details: topics discussed, next steps, motivation level, etc.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium mb-1">💡 Pro Tips:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li>Include specific property preferences or budget details</li>
                <li>Note any changes in motivation or timeframe</li>
                <li>Record objections or concerns mentioned</li>
                <li>Capture next steps or commitments made</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Conversation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
