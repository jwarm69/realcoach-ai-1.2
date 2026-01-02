'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, CheckCircle2, XCircle, Loader2, RefreshCw, Plug } from 'lucide-react';

export default function IntegrationsSettingsPage() {
  const [mailchimpApiKey, setMailchimpApiKey] = useState('');
  const [mailchimpListId, setMailchimpListId] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{
    lastSync: string | null;
    totalSynced: number;
    totalWithError: number;
  } | null>(null);

  useEffect(() => {
    loadStatus();
    const storedApiKey = localStorage.getItem('mailchimp_api_key');
    const storedListId = localStorage.getItem('mailchimp_list_id');
    if (storedApiKey) setMailchimpApiKey(storedApiKey);
    if (storedListId) setMailchimpListId(storedListId);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/mailchimp/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('mailchimp_api_key', mailchimpApiKey);
    localStorage.setItem('mailchimp_list_id', mailchimpListId);
    toast.success('Settings saved');
  };

  const handleTestConnection = async () => {
    if (!mailchimpApiKey) {
      toast.error('Please enter your Mailchimp API key first');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch('/api/mailchimp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: mailchimpApiKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus('valid');
        toast.success('Connection successful! Your API key is valid.');
      } else {
        setConnectionStatus('invalid');
        toast.error(data.error || 'Connection failed. Please check your API key.');
      }
    } catch (error) {
      setConnectionStatus('invalid');
      toast.error('Connection failed. Please check your network and try again.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSync = async () => {
    if (!mailchimpApiKey || !mailchimpListId) {
      toast.error('Please enter Mailchimp API key and list ID');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/mailchimp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: mailchimpApiKey,
          listId: mailchimpListId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Synced ${data.synced} contacts${data.failed > 0 ? ` (${data.failed} failed)` : ''}`
        );
        loadStatus();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-1">Manage third-party integrations and sync settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <CardTitle>Mailchimp</CardTitle>
              <CardDescription>Sync your contacts with Mailchimp for email marketing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-base">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxx-usxx"
                value={mailchimpApiKey}
                onChange={(e) => setMailchimpApiKey(e.target.value)}
                className="h-11 min-h-[44px]"
              />
              <p className="text-xs text-slate-500">
                Found in Mailchimp under Account → Extras → API keys
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listId" className="text-base">List ID</Label>
              <Input
                id="listId"
                placeholder="xxxxxxxxxx"
                value={mailchimpListId}
                onChange={(e) => setMailchimpListId(e.target.value)}
                className="h-11 min-h-[44px]"
              />
              <p className="text-xs text-slate-500">
                Found in Mailchimp under Audience → Settings → Audience name and defaults
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                onClick={handleTestConnection}
                disabled={testingConnection || !mailchimpApiKey}
                variant="outline"
                size="default"
                className="flex-1 min-h-[44px] sm:min-h-0 h-11"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Plug className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              {connectionStatus === 'valid' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              )}
              {connectionStatus === 'invalid' && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Invalid
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-sync</Label>
                <p className="text-xs text-slate-500">Automatically sync contacts daily</p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
                disabled={!mailchimpApiKey || !mailchimpListId}
                className="scale-125"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSave} variant="outline" disabled={syncing} className="h-11 min-h-[44px] sm:h-auto sm:min-h-0">
                Save Settings
              </Button>
              <Button
                onClick={handleSync}
                disabled={syncing || !mailchimpApiKey || !mailchimpListId}
                className="h-11 min-h-[44px] sm:h-auto sm:min-h-0"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-4">Sync Status</h3>
            {loadingStatus ? (
              <div className="flex items-center text-sm text-slate-500">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading status...
              </div>
            ) : syncStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Synced</span>
                  <span className="font-medium text-slate-900">{syncStatus.totalSynced} contacts</span>
                </div>
                {syncStatus.totalWithError > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">With Errors</span>
                    <Badge variant="destructive">{syncStatus.totalWithError}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="font-medium text-slate-900">
                    {syncStatus.lastSync
                      ? new Date(syncStatus.lastSync).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No sync data available</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-2">Segmentation</h3>
            <p className="text-sm text-slate-500 mb-4">
              Contacts are automatically tagged in Mailchimp based on:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Pipeline Stage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Motivation Level</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Lead Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Priority Score</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>7-Day Rule Flag</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Timeframe Urgency</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
