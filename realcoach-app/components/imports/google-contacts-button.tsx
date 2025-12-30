'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleContactsButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'auth' | 'fetching' | 'review' | 'importing' | 'complete';

export function GoogleContactsButton({ open, onOpenChange }: GoogleContactsButtonProps) {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('auth');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: [] as string[] });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGoogleAuth = async () => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/contacts.readonly',
        access_type: 'offline',
        prompt: 'consent',
      })}`;

      window.location.href = authUrl;
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error('Failed to connect to Google');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/contacts/import/google', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();

      setImportProgress({
        current: result.created,
        total: result.created + result.skipped,
        errors: result.errors || [],
      });

      setStep('complete');
      toast.success(`${result.created} contacts imported successfully`);
      router.refresh();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('auth');
    setImportProgress({ current: 0, total: 0, errors: [] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'auth' && 'Import from Google Contacts'}
            {step === 'fetching' && 'Fetching Contacts...'}
            {step === 'review' && 'Review Import'}
            {step === 'importing' && 'Importing Contacts...'}
            {step === 'complete' && 'Import Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'auth' && 'Connect your Google account to import contacts.'}
            {step === 'fetching' && 'Fetching your contacts from Google...'}
            {step === 'review' && 'Review your contacts before importing.'}
            {step === 'importing' && 'Importing your contacts...'}
            {step === 'complete' && 'Your contacts have been imported.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'auth' && (
          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Import Email Addresses</p>
                    <p className="text-xs text-muted-foreground">All email addresses will be imported</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Import Phone Numbers</p>
                    <p className="text-xs text-muted-foreground">All phone numbers will be imported</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGoogleAuth}
              className="w-full"
              disabled={isProcessing}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect Google Account
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your contacts will be imported with a default "Lead" status
            </p>
          </div>
        )}

        {step === 'fetching' && (
          <div className="space-y-4 py-4 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting to Google Contacts...</p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Ready to Import</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your contacts have been fetched and are ready to import
                </p>
                <Badge variant="outline">Contacts found</Badge>
              </CardContent>
            </Card>

            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Contacts with duplicate email addresses will be skipped
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 py-4">
            <Progress
              value={(importProgress.current / importProgress.total) * 100}
              className="h-2"
            />
            <p className="text-center text-sm text-muted-foreground">
              Importing {importProgress.current} of {importProgress.total} contacts...
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold">Import Complete!</h3>
            <p className="text-muted-foreground">
              {importProgress.current} contacts have been imported successfully.
            </p>
            {importProgress.errors.length > 0 && (
              <div className="text-left">
                <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                {importProgress.errors.slice(0, 3).map((error, i) => (
                  <p key={i} className="text-xs text-red-600">
                    • {error}
                  </p>
                ))}
                {importProgress.errors.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {importProgress.errors.length - 3} more
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing || step === 'importing'}
          >
            {step === 'complete' ? 'Done' : 'Cancel'}
          </Button>

          {step === 'review' && (
            <Button onClick={handleImport} disabled={isProcessing}>
              Import Contacts
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
