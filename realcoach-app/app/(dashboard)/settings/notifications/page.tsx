'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Bell, Clock, TestTube, Smartphone, Check, X, AlertCircle } from 'lucide-react';

interface NotificationSettings {
  daily_actions_enabled: boolean;
  daily_actions_time: string;
  seven_day_alerts_enabled: boolean;
  consistency_reminders_enabled: boolean;
  consistency_reminder_time: string;
  weekly_summary_enabled: boolean;
  weekly_summary_day: number;
  notification_method: 'email' | 'push' | 'sms' | 'none';
  timezone: string;
  // Push notification specific settings
  push_enabled?: boolean;
  push_daily_actions?: boolean;
  push_seven_day_alerts?: boolean;
  push_consistency_reminders?: boolean;
  push_weekly_summary?: boolean;
}

interface PushSubscriptionStatus {
  hasSubscriptions: boolean;
  subscriptionCount: number;
  permissionState: NotificationPermission;
}

type NotificationPermission = 'default' | 'granted' | 'denied';

const DEFAULT_SETTINGS: NotificationSettings = {
  daily_actions_enabled: true,
  daily_actions_time: '06:00',
  seven_day_alerts_enabled: true,
  consistency_reminders_enabled: true,
  consistency_reminder_time: '17:00',
  weekly_summary_enabled: true,
  weekly_summary_day: 1,
  notification_method: 'email',
  timezone: 'America/New_York'
};

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu'
];

const WEEK_DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' }
];

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushSubscriptionStatus>({
    hasSubscriptions: false,
    subscriptionCount: 0,
    permissionState: 'default',
  });
  const [requestingPermission, setRequestingPermission] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
    checkPushStatus();
  }, []);

  // Check for service worker registration and permission status
  const checkPushStatus = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushStatus(prev => ({ ...prev, permissionState: 'denied' }));
      return;
    }

    setPushStatus(prev => ({
      ...prev,
      permissionState: Notification.permission as NotificationPermission,
    }));

    // Load existing subscriptions
    try {
      const response = await fetch('/api/notifications/subscribe');
      if (response.ok) {
        const data = await response.json();
        setPushStatus(prev => ({
          ...prev,
          hasSubscriptions: data.hasSubscriptions,
          subscriptionCount: data.subscriptions?.length || 0,
        }));

        // Update settings with push preferences
        if (data.preferences) {
          setSettings(prev => ({
            ...prev,
            push_enabled: data.preferences.push_enabled,
            push_daily_actions: data.preferences.push_daily_actions,
            push_seven_day_alerts: data.preferences.push_seven_day_alerts,
            push_consistency_reminders: data.preferences.push_consistency_reminders,
            push_weekly_summary: data.preferences.push_weekly_summary,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to check push status:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGSQL_EMPTY_QUERY') throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...settings
        } as any);

      if (error) throw error;
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to send test notification');
      toast.success('Test notification sent! Check your email.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const requestPushPermission = async () => {
    setRequestingPermission(true);
    try {
      if (!('Notification' in window)) {
        toast.error('Notifications are not supported in your browser');
        return;
      }

      const permission = await Notification.requestPermission();
      setPushStatus(prev => ({ ...prev, permissionState: permission as NotificationPermission }));

      if (permission === 'granted') {
        toast.success('Notification permission granted! Now registering...');

        // Register service worker and subscribe
        await registerAndSubscribePush();
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable in your browser settings.');
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast.error('Failed to request notification permission');
    } finally {
      setRequestingPermission(false);
    }
  };

  const registerAndSubscribePush = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Get VAPID public key
      const vapidResponse = await fetch('/api/vapid-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID key');
      }
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      toast.success('Push notifications enabled!');
      await checkPushStatus();
    } catch (error) {
      console.error('Failed to register push:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const sendTestPushNotification = async () => {
    setTestingPush(true);
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test push');
      }

      if (data.success) {
        toast.success(data.message || 'Test push sent! Check your notifications.');
      } else {
        toast.error(data.error || 'Failed to send test push');
      }
    } catch (error) {
      console.error('Failed to send test push:', error);
      toast.error('Failed to send test push notification');
    } finally {
      setTestingPush(false);
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={sendTestNotification}
          disabled={testing || settings.notification_method === 'none'}
        >
          {testing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 mr-2" />
          )}
          Test Email
        </Button>
      </div>

      {/* Notification Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Method
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Channel</Label>
            <Select
              value={settings.notification_method}
              onValueChange={(value: any) => updateSetting('notification_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notifications</SelectItem>
                <SelectItem value="sms">SMS (Coming Soon)</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => updateSetting('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
            {pushStatus.permissionState === 'granted' && pushStatus.hasSubscriptions && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </CardTitle>
          <CardDescription>
            Get instant notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${
            pushStatus.permissionState === 'granted'
              ? 'bg-green-50 border-green-200'
              : pushStatus.permissionState === 'denied'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {pushStatus.permissionState === 'granted' ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : pushStatus.permissionState === 'denied' ? (
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {pushStatus.permissionState === 'granted'
                  ? `Push notifications enabled (${pushStatus.subscriptionCount} device${pushStatus.subscriptionCount > 1 ? 's' : ''})`
                  : pushStatus.permissionState === 'denied'
                  ? 'Push notifications blocked'
                  : 'Push notifications not enabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {pushStatus.permissionState === 'granted'
                  ? 'You will receive notifications on your devices'
                  : pushStatus.permissionState === 'denied'
                  ? 'Enable notifications in your browser settings to use push notifications'
                  : 'Enable push notifications to get instant alerts'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {pushStatus.permissionState === 'default' && (
              <Button
                onClick={requestPushPermission}
                disabled={requestingPermission}
              >
                {requestingPermission ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Push Notifications
                  </>
                )}
              </Button>
            )}

            {pushStatus.permissionState === 'granted' && (
              <Button
                variant="outline"
                onClick={sendTestPushNotification}
                disabled={testingPush || !pushStatus.hasSubscriptions}
              >
                {testingPush ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Push
                  </>
                )}
              </Button>
            )}

            {pushStatus.permissionState === 'denied' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open('https://support.google.com/chrome/answer/3220216', '_blank');
                  }
                }}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                How to Enable
              </Button>
            )}
          </div>

          {/* Push-specific toggles (only show when enabled) */}
          {pushStatus.permissionState === 'granted' && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Actions Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Push notification for daily priority contacts
                  </p>
                </div>
                <Switch
                  checked={settings.push_daily_actions || false}
                  onCheckedChange={(checked) => updateSetting('push_daily_actions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>7-Day Rule Alerts Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant push for 7-day rule violations
                  </p>
                </div>
                <Switch
                  checked={settings.push_seven_day_alerts || false}
                  onCheckedChange={(checked) => updateSetting('push_seven_day_alerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consistency Reminders Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Evening push for daily consistency reminders
                  </p>
                </div>
                <Switch
                  checked={settings.push_consistency_reminders || false}
                  onCheckedChange={(checked) => updateSetting('push_consistency_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly summary delivered as push notification
                  </p>
                </div>
                <Switch
                  checked={settings.push_weekly_summary || false}
                  onCheckedChange={(checked) => updateSetting('push_weekly_summary', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Daily Priority Actions
          </CardTitle>
          <CardDescription>
            Receive your top priority contacts every morning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Daily Actions Email</Label>
              <p className="text-sm text-muted-foreground">
                Get your top 5-10 priority contacts delivered at 6 AM
              </p>
            </div>
            <Switch
              checked={settings.daily_actions_enabled}
              onCheckedChange={(checked) => updateSetting('daily_actions_enabled', checked)}
            />
          </div>

          {settings.daily_actions_enabled && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-muted">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Delivery Time
                </Label>
                <p className="text-sm text-muted-foreground">
                  What time should we send your daily actions?
                </p>
              </div>
              <input
                type="time"
                value={settings.daily_actions_time}
                onChange={(e) => updateSetting('daily_actions_time', e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7-Day Rule Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            7-Day Rule Alerts
          </CardTitle>
          <CardDescription>
            Immediate notifications when contacts violate the 7-day rule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 7-Day Rule Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified instantly when a contact hasn't been touched in 7+ days
              </p>
            </div>
            <Switch
              checked={settings.seven_day_alerts_enabled}
              onCheckedChange={(checked) => updateSetting('seven_day_alerts_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consistency Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily Consistency Reminders
          </CardTitle>
          <CardDescription>
            Evening reminders to help you hit your 5-contacts daily goal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Consistency Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get a friendly reminder at 5 PM if you haven't hit your daily goal
              </p>
            </div>
            <Switch
              checked={settings.consistency_reminders_enabled}
              onCheckedChange={(checked) => updateSetting('consistency_reminders_enabled', checked)}
            />
          </div>

          {settings.consistency_reminders_enabled && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-muted">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reminder Time
                </Label>
                <p className="text-sm text-muted-foreground">
                  When should we remind you?
                </p>
              </div>
              <input
                type="time"
                value={settings.consistency_reminder_time}
                onChange={(e) => updateSetting('consistency_reminder_time', e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>
            Start your week with a comprehensive overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">
                Get a summary of your pipeline and stats every week
              </p>
            </div>
            <Switch
              checked={settings.weekly_summary_enabled}
              onCheckedChange={(checked) => updateSetting('weekly_summary_enabled', checked)}
            />
          </div>

          {settings.weekly_summary_enabled && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-muted">
              <div className="space-y-0.5">
                <Label>Send On</Label>
                <p className="text-sm text-muted-foreground">
                  Which day would you like to receive your summary?
                </p>
              </div>
              <Select
                value={settings.weekly_summary_day.toString()}
                onValueChange={(value) => updateSetting('weekly_summary_day', parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
