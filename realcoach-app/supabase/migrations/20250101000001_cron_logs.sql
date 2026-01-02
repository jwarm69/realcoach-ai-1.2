-- ===========================================
-- RealCoach AI 1.2 - Cron Logs Migration
-- ===========================================
-- Adds cron_logs table for tracking cron job execution

CREATE TABLE cron_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cron_logs_job_name ON cron_logs(job_name);
CREATE INDEX idx_cron_logs_created_at ON cron_logs(created_at DESC);
CREATE INDEX idx_cron_logs_status ON cron_logs(status);

-- Enable RLS
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can write cron logs
CREATE POLICY "Service role can insert cron logs"
  ON cron_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can view cron logs"
  ON cron_logs FOR SELECT
  USING (auth.role() = 'service_role');
