import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/observability/logger';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: { status: 'pass' | 'fail'; latency?: number };
    cron: { status: 'pass' | 'fail' | 'skip'; lastRun?: string };
  };
  timestamp: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {
    database: { status: 'pass' },
    cron: { status: 'skip' },
  };

  let overallStatus: HealthCheckResult['status'] = 'healthy';

  try {
    const supabase = await createClient();

    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('contacts').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;

    if (dbError) {
      checks.database = { status: 'fail' };
      overallStatus = 'unhealthy';
      logger.error('Database health check failed', dbError);
    } else {
      checks.database = { status: 'pass', latency: dbLatency };
      if (dbLatency > 1000) {
        overallStatus = 'degraded';
      }
    }

    const { data: cronLogs } = await supabase
      .from('cron_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cronLogs) {
      const logs = cronLogs as Record<string, any>;
      const lastCronRun = new Date(logs.created_at);
      const hoursSinceLastRun = (Date.now() - lastCronRun.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastRun > 48) {
        checks.cron = { status: 'fail', lastRun: logs.created_at };
        overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      } else {
        checks.cron = { status: 'pass', lastRun: logs.created_at };
      }
    }
  } catch (error) {
    overallStatus = 'unhealthy';
    logger.error('Health check failed', error as Error);
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(result, { status: statusCode });
}
