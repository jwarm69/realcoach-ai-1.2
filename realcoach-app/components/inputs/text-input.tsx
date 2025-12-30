'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface TextInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function TextInput({
  value,
  placeholder,
  disabled,
  onChange,
  onSend,
}: TextInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSend();
          }
        }}
        className="flex-1"
        disabled={disabled}
      />
      <Button onClick={onSend} size="icon" disabled={disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
