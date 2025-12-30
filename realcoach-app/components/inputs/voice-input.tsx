'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, Trash2 } from 'lucide-react';

type SpeechRecognitionInstance = any;

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onClose?: () => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

export function VoiceInput({
  onTranscript,
  onClose,
  onRecordingChange,
}: VoiceInputProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setIsSupported(Boolean(supported));

    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const startRecording = () => {
    setError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk) {
        setTranscript((prev) => `${prev} ${finalChunk}`.trim());
      }
      setInterim(interimChunk.trim());
    };

    recognition.onerror = (event: any) => {
      setError(event?.error || 'Unable to capture audio.');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterim('');
      onRecordingChange?.(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    onRecordingChange?.(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    setIsRecording(false);
    setInterim('');
    onRecordingChange?.(false);
  };

  const handleInsert = () => {
    const cleaned = transcript.trim();
    if (!cleaned) {
      setError('Record a short note before inserting.');
      return;
    }
    onTranscript(cleaned);
    setTranscript('');
    setInterim('');
  };

  const handleClear = () => {
    setTranscript('');
    setInterim('');
    setError(null);
  };

  const displayText = `${transcript}${interim ? ` ${interim}` : ''}`.trim();

  return (
    <Card className="p-4 border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Voice note</p>
          <p className="text-xs text-slate-500">Record and insert a transcript</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {!isSupported && (
        <p className="text-xs text-red-600 mb-3">
          Speech recognition is not available. Try Chrome or Edge.
        </p>
      )}

      <Textarea
        value={displayText}
        placeholder="Transcript will appear here while you speak..."
        readOnly
        rows={4}
        className="bg-white"
      />

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'default'}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isSupported}
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start recording
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleInsert}>
          Insert transcript
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </Card>
  );
}
