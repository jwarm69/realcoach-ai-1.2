'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  extractTextFromImage,
  parseConversationFromText,
  formatConversationForLog,
  destroyWorker,
  type ParsedConversation,
} from '@/lib/services/ocr';

interface ScreenshotUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string;
}

type UploadStep = 'upload' | 'processing' | 'review' | 'saving';

export function ScreenshotUploader({ open, onOpenChange, contactId }: ScreenshotUploaderProps) {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [parsedConversation, setParsedConversation] = useState<ParsedConversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
    setStep('processing');
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const result = await extractTextFromImage(selectedFile, (progress) => {
        setOcrProgress(progress);
      });

      setExtractedText(result.text);
      setConfidence(result.confidence);

      const parsed = parseConversationFromText(result.text);
      setParsedConversation(parsed);

      setStep('review');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text from image');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSave = async () => {
    if (!contactId) {
      toast.error('Contact ID is required');
      return;
    }

    setIsProcessing(true);
    setStep('saving');

    try {
      const response = await fetch(`/api/contacts/${contactId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: 'screenshot',
          content: formatConversationForLog(parsedConversation!),
          extracted_entities: {
            phoneNumbers: parsedConversation!.phoneNumbers,
            timestamps: parsedConversation!.timestamps,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save conversation');
      }

      toast.success('Conversation saved successfully');
      router.refresh();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save conversation');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setExtractedText('');
    setConfidence(0);
    setParsedConversation(null);
    setOcrProgress(0);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Upload Conversation Screenshot'}
            {step === 'processing' && 'Processing Screenshot...'}
            {step === 'review' && 'Review Extracted Conversation'}
            {step === 'saving' && 'Saving Conversation...'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a screenshot of a conversation to automatically extract the text.'}
            {step === 'processing' && 'Extracting text from your screenshot using OCR...'}
            {step === 'review' && 'Review the extracted text before saving it as a conversation.'}
            {step === 'saving' && 'Saving the conversation to your contact timeline...'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {step === 'upload' && (
            <div className="space-y-4 py-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('screenshot-input')?.click()}
              >
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Drop your screenshot here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports iPhone, Android, and WhatsApp screenshots
                </p>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-2">Supported Formats</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• iPhone Messages (iOS)</li>
                    <li>• Android SMS</li>
                    <li>• WhatsApp conversations</li>
                    <li>• Most text-based chat screenshots</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-4 py-4">
              <Progress value={ocrProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {ocrProgress < 30 && 'Initializing OCR engine...'}
                {ocrProgress >= 30 && ocrProgress < 70 && 'Recognizing text...'}
                {ocrProgress >= 70 && 'Finalizing extraction...'}
              </p>
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-sm rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {confidence >= 80 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">High Confidence</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(confidence)}% accuracy
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {confidence < 80 && confidence >= 60 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">Medium Confidence</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(confidence)}% accuracy - Please review
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {confidence < 60 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Low Confidence</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(confidence)}% accuracy - Manual review recommended
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {parsedConversation && parsedConversation.phoneNumbers && parsedConversation.phoneNumbers.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        <p className="text-sm font-medium">Phone Numbers Found</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parsedConversation.phoneNumbers.map((phone, i) => (
                          <Badge key={i} variant="secondary">
                            {phone}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {parsedConversation && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <p className="text-sm font-medium">Conversation Type</p>
                      </div>
                      <Badge variant="outline">
                        {parsedConversation.conversationType.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-3">Extracted Conversation</h4>
                  <Textarea
                    value={formatConversationForLog(parsedConversation!)}
                    onChange={(e) => setExtractedText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Extracted text will appear here..."
                  />
                </CardContent>
              </Card>

              {previewUrl && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-3">Original Screenshot</h4>
                    <div className="flex justify-center">
                      <img
                        src={previewUrl}
                        alt="Original screenshot"
                        className="max-w-xs rounded-lg shadow"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="space-y-4 py-4 text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">Saving conversation...</p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {step === 'upload' ? 'Cancel' : 'Close'}
          </Button>

          {step === 'review' && (
            <Button onClick={handleSave} disabled={isProcessing}>
              Save Conversation
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
