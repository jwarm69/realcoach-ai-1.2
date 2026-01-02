import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailyActionsForUser } from '@/lib/services/actions';

export const dynamic = 'force-dynamic';

interface CronResult {
  userId: string;
  email: string | null;
  success: boolean;
  actionsCount: number;
  error?: string;
}

interface CronResponse {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  results: CronResult[];
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<CronResponse>> {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return NextResponse.json({
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
      timestamp: new Date().toISOString()
    }, { status: 401 });
  }

  const supabase = await createClient();
  const results: CronResult[] = [];
  let successful = 0;
  let failed = 0;

  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('active', true);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('No active profiles found');
      return NextResponse.json({
        success: true,
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Processing ${profiles.length} active users`);

    for (const profile of profiles as any[]) {
      const result: CronResult = {
        userId: profile.id,
        email: profile.email,
        success: false,
        actionsCount: 0
      };

      try {
        const actionsResult = await generateDailyActionsForUser(profile.id);

        if (actionsResult.success) {
          result.success = true;
          result.actionsCount = actionsResult.actionsCount;
          successful++;
          console.log(`✅ Generated ${actionsResult.actionsCount} actions for user ${profile.id}`);
        } else {
          result.error = actionsResult.errors.join('; ');
          failed++;
          console.error(`❌ Failed for user ${profile.id}: ${result.error}`);
        }
      } catch (userError) {
        result.error = userError instanceof Error ? userError.message : 'Unknown error';
        failed++;
        console.error(`❌ Exception for user ${profile.id}:`, userError);
      }

      results.push(result);
    }

    const duration = Date.now() - startTime;
    console.log(`Cron job completed in ${duration}ms: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed: profiles.length,
      successful,
      failed,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
