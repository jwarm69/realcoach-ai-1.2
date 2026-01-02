# RealCoach AI 1.2 - Deployment Guide

**Version**: 1.2.0
**Last Updated**: December 31, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Checklist](#security-checklist)

---

## Prerequisites

### Required Accounts

1. **Supabase Account** (https://supabase.com)
   - Free tier suitable for development
   - Pro tier recommended for production ($25/month)

2. **Vercel Account** (https://vercel.com)
   - Free tier available
   - Pro tier recommended for production ($20/month)

3. **OpenAI API Key** (https://platform.openai.com)
   - Required for AI conversation analysis
   - Pay-as-you-go pricing

4. **Google Cloud Console** (Optional - for Google Contacts)
   - For Google OAuth integration
   - Free tier available

5. **Mailchimp Account** (Optional - for email marketing sync)
   - Free tier available
   - Paid tiers for larger lists

### Required Tools

```bash
# Node.js 18+ (20+ recommended)
node --version  # v20.x.x or higher

# npm
npm --version   # 10.x.x or higher

# Git
git --version   # 2.40.x or higher

# Supabase CLI (optional, for local development)
npm install -g supabase
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/realcoach-ai-1.2.git
cd realcoach-ai-1.2
cd realcoach-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` file in the `realcoach-app` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# ==========================================
# SUPABASE (REQUIRED)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ==========================================
# OPENAI API (REQUIRED - for AI analysis)
# ==========================================
OPENAI_API_KEY=sk-your-openai-api-key

# ==========================================
# GOOGLE OAUTH (Optional - for Google Contacts)
# ==========================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==========================================
# MAILCHIMP (Optional - for email marketing sync)
# ==========================================
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_DC=usX  # Data center prefix (e.g., us1, us2, etc.)

# ==========================================
# CRON SECRET (REQUIRED - for scheduled jobs)
# ==========================================
CRON_SECRET=your-random-secret-key-min-32-chars

# ==========================================
# EMAIL (Optional - for notifications)
# ==========================================
RESEND_API_KEY=re-your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate Secrets

**CRON_SECRET** (required for production cron jobs):

```bash
# Generate secure random string
openssl rand -base64 32
```

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Enter project details:
   - **Name**: `realcoach-ai-prod` (or your preferred name)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose region closest to your users
4. Wait for project to be provisioned (~2 minutes)

### 2. Get Supabase Credentials

From your Supabase project dashboard:

1. **Project URL**: Settings → API → Project URL
2. **Anon Key**: Settings → API → anon/public key
3. **Service Role Key**: Settings → API → service_role (keep secret!)

Add these to your `.env.local` file.

### 3. Database Schema Migration

Run the database schema migration:

```bash
# Option 1: Using Supabase Dashboard
# Go to SQL Editor → New Query
# Copy/paste the contents of:
# realcoach-ai-1.2/supabase/migrations/001_initial_schema.sql

# Option 2: Using Supabase CLI (if installed)
supabase db push
```

**Required Tables**:
- `profiles` (user profiles)
- `contacts` (contact records)
- `conversations` (conversation logs)
- `daily_actions` (generated daily priorities)
- `pipeline_events` (pipeline stage changes)
- `mailchimp_sync_logs` (Mailchimp sync history)

### 4. Configure Row Level Security (RLS)

Enable RLS policies (included in migration script):

```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ... (see full migration file for all policies)
```

### 5. Create Database Functions

Run the function creation script:

```sql
-- From SQL Editor, run:
-- realcoach-ai-1.2/supabase/migrations/002_functions.sql

-- Key functions:
-- - calculate_priority_score(contact_id)
-- - check_seven_day_rule(contact_id)
-- - generate_daily_actions(user_id, date)
-- - update_consistency_score(user_id)
```

### 6. Set Up Database Indexes

For optimal query performance:

```sql
-- From SQL Editor, run:
-- realcoach-ai-1.2/supabase/migrations/003_indexes.sql

-- Key indexes:
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_priority_score ON contacts(priority_score DESC);
CREATE INDEX idx_contacts_pipeline_stage ON contacts(pipeline_stage);
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);
```

### 7. Configure Storage (Optional - for screenshots)

```bash
# From Supabase Dashboard:
# Storage → New Bucket → "screenshots"
# Enable Public Access: NO (authenticated only)
# Allowed MIME Types: image/png, image/jpeg
# File Size Limit: 5 MB
```

---

## Vercel Deployment

### 1. Prepare for Deployment

```bash
# From realcoach-app directory
cd realcoach-app

# Build the application (test locally)
npm run build

# Test production build locally
npm start
```

### 2. Deploy to Vercel (CLI Method)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: realcoach-ai-1.2
# - Directory: ./realcoach-app
# - Override settings? No
```

### 3. Deploy to Vercel (Dashboard Method)

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `realcoach-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (from `.env.local`):

   Add all environment variables from your `.env.local` file to Vercel:
   - Go to: Settings → Environment Variables
   - Add each variable with its value
   - **Important**: Select appropriate environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (~2-3 minutes)
   - Vercel will provide a URL: `https://realcoach-ai-1-2.vercel.app`

### 4. Configure Custom Domain (Optional)

```bash
# From Vercel Dashboard:
# Settings → Domains → Add Domain

# Add your domain (e.g., app.realcoach.ai)
# Configure DNS records:
# - A record: cname.vercel-dns.com
# - CNAME: www → cname.vercel-dns.com
```

### 5. Configure Cron Jobs (Vercel)

Vercel supports cron jobs for scheduled tasks:

**Create `vercel.json` in `realcoach-app` directory**:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-actions",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/mailchimp",
      "schedule": "0 7 * * *"
    }
  ]
}
```

**Cron Schedule**:
- `0 6 * * *` = Daily at 6:00 AM (UTC)
- `0 7 * * *` = Daily at 7:00 AM (UTC)

**Test Cron Jobs**:
```bash
# Test daily actions generation
curl https://your-app.vercel.app/api/cron/daily-actions/test?date=2025-12-31

# Should return JSON with generated actions
```

---

## Post-Deployment Setup

### 1. Verify Health Check

```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "pass",
      "latency_ms": 15
    },
    "cron": {
      "status": "pass",
      "last_run": "2025-12-31T06:00:00Z"
    }
  },
  "timestamp": "2025-12-31T16:30:00Z"
}
```

### 2. Test Authentication

1. Go to: `https://your-app.vercel.app`
2. Click "Sign Up"
3. Create test account
4. Verify you can log in
5. Check Supabase Dashboard → Authentication → Users to confirm user created

### 3. Test Core Features

#### Test Contact Creation

```bash
# From browser DevTools console:
fetch('/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    pipeline_stage: 'Lead'
  })
})
```

#### Test AI Analysis

```bash
fetch('/api/analyze-conversation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    conversation: 'I am looking to buy a home in the next month. I am pre-approved for $400k.',
    contactId: 'CONTACT_ID',
    generateReply: true
  })
})
```

#### Test Priority Calculation

```bash
fetch('/api/daily-priorities?limit=5', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
```

### 4. Configure Email Notifications (Optional)

**Using Resend** (recommended for transactional emails):

```bash
# Get API key from https://resend.com
# Add to environment variables:
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Test Email**:

```bash
fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    type: 'daily_actions'
  })
})
```

### 5. Configure Mailchimp Integration (Optional)

```bash
# From application settings page:
# 1. Go to: Settings → Integrations → Mailchimp
# 2. Enter Mailchimp API key
# 3. Select list ID
# 4. Click "Test Connection"
# 5. Click "Sync All Contacts"
```

---

## Monitoring & Maintenance

### 1. Vercel Analytics

Access built-in analytics:
- Go to: Vercel Dashboard → Your Project → Analytics
- Metrics available:
  - Page views
  - Unique visitors
  - Top pages
  - Geography
  - Devices

### 2. Supabase Logs

Monitor database activity:
- Go to: Supabase Dashboard → Logs
- Key log types:
  - API logs
  - Database logs
  - Auth logs
  - Storage logs

### 3. OpenAI Usage Tracking

Monitor AI API costs:
```bash
# From your application code:
# lib/ai/model-router.ts tracks usage automatically

# To view usage:
SELECT * FROM model_usage_stats
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

### 4. Health Check Monitoring

Set up automated health checks (recommended):

**Using UptimeRobot** (free):
1. Go to https://uptimerobot.com
2. Add monitor:
   - **Type**: HTTPS
   - **URL**: `https://your-app.vercel.app/api/health`
   - **Interval**: 5 minutes
   - **Alert**: Email on down

### 5. Backup Strategy

**Supabase Backups** (included in Pro tier):
- Automatic daily backups retained for 7 days
- Point-in-time recovery available

**Manual Backup** (from Supabase Dashboard):
```bash
# Database → Backups → Create Backup
# Download backup file (SQL dump)
```

---

## Troubleshooting

### Issue: Build Failures

**Symptom**: Vercel deployment fails during build

**Solutions**:

1. **Check build logs**:
   - Vercel Dashboard → Deployments → Click on failed deployment
   - Review error messages

2. **Common build errors**:

   **Type errors**:
   ```bash
   # Run locally first
   npm run type-check
   ```

   **Dependency issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment variables missing**:
   - Verify all required variables are set in Vercel
   - Check for typos in variable names

### Issue: Database Connection Errors

**Symptom**: API returns "Database connection failed"

**Solutions**:

1. **Verify Supabase credentials**:
   ```bash
   # Check .env.local variables match Supabase Dashboard
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Check RLS policies**:
   ```sql
   -- From Supabase SQL Editor:
   SELECT * FROM pg_policies
   WHERE schemaname = 'public';
   ```

3. **Test connection**:
   ```bash
   # From your app:
   curl https://your-project.supabase.co/rest/v1/contacts
     -H "apikey: YOUR_ANON_KEY"
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Issue: AI Analysis Failing

**Symptom**: `/api/analyze-conversation` returns error

**Solutions**:

1. **Check OpenAI API key**:
   ```bash
   # Verify key is valid
   curl https://api.openai.com/v1/models
     -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
   ```

2. **Check API credits**:
   - Go to: https://platform.openai.com/usage
   - Verify you have available credits

3. **Test tier-by-tier**:
   - Pattern detection (Tier 1) should work without OpenAI
   - If Tier 1 fails, check regex patterns
   - If Tier 2/3 fails, check OpenAI connection

### Issue: Cron Jobs Not Running

**Symptom**: Daily actions not being generated

**Solutions**:

1. **Verify cron configuration**:
   ```json
   // Check vercel.json exists and is valid
   {
     "crons": [
       {
         "path": "/api/cron/daily-actions",
         "schedule": "0 6 * * *"
       }
     ]
   }
   ```

2. **Check CRON_SECRET**:
   - Must be set in Vercel environment variables
   - Must match in cron job URL

3. **Test cron manually**:
   ```bash
   curl https://your-app.vercel.app/api/cron/daily-actions?secret=YOUR_SECRET
   ```

4. **Check Vercel cron logs**:
   - Vercel Dashboard → Deployments → Cron Jobs

### Issue: Slow Performance

**Symptoms**: Page loads >3 seconds, API timeouts

**Solutions**:

1. **Check database indexes**:
   ```sql
   -- Verify indexes exist
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE schemaname = 'public'
   ORDER BY tablename, indexname;
   ```

2. **Enable Vercel Edge Network**:
   - Automatic for Vercel deployments
   - Check configuration: vercel.json → "regions"

3. **Optimize images**:
   - Use Next.js Image component
   - Enable image optimization

4. **Database connection pooling**:
   - Supabase includes this automatically
   - Check for connection leaks in code

---

## Security Checklist

### Pre-Deployment

- [ ] **Change default passwords** (Supabase database)
- [ ] **Set strong CRON_SECRET** (32+ characters, random)
- [ ] **Enable RLS on all tables** (verify in Supabase Dashboard)
- [ ] **Review API permissions** (service_role key usage)
- [ ] **Set up SSL certificates** (automatic with Vercel)
- [ ] **Configure CORS** (if using custom domains)
- [ ] **Review environment variables** (remove any secrets from code)

### Post-Deployment

- [ ] **Test authentication flows** (signup, login, logout)
- [ ] **Verify user data isolation** (users can't see other users' data)
- [ ] **Test API rate limiting** (if implemented)
- [ ] **Set up error tracking** (e.g., Sentry)
- [ ] **Configure backup strategy** (Supabase backups)
- [ ] **Document emergency access** (database credentials, admin accounts)

### Ongoing Maintenance

- [ ] **Update dependencies regularly** (security patches)
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Monitor database size** (Supabase quotas)
- [ ] **Review AI API costs** (OpenAI usage)
- [ ] **Check for vulnerabilities**
  ```bash
  npm audit --production
  ```

- [ ] **Test disaster recovery** (restore from backup)

---

## Performance Optimization

### Database Optimization

```sql
-- 1. Update table statistics (run weekly)
ANALYZE contacts;
ANALYZE conversations;

-- 2. Reclaim storage (run monthly)
VACUUM ANALYZE contacts;

-- 3. Check slow queries
SELECT *
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- queries taking >1 second
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### API Optimization

1. **Enable caching** (implement HTTP caching headers):
   ```typescript
   // In API routes
   export const revalidate = 300; // 5 minutes
   ```

2. **Use database connection pooling**:
   - Supabase manages this automatically
   - Default: 15 connections max

3. **Implement rate limiting** (optional):
   ```typescript
   // middleware.ts
   import { Ratelimit } from "@upstash/ratelimit";
   ```

### Cost Optimization

1. **AI usage monitoring**:
   ```sql
   -- Track monthly AI costs
   SELECT
     DATE_TRUNC('month', created_at) AS month,
     COUNT(*) AS total_analyses,
     SUM(estimated_cost) AS total_cost
   FROM model_usage_stats
   GROUP BY month
   ORDER BY month DESC;
   ```

2. **Set budget alerts**:
   - OpenAI Dashboard → Usage → Set limits

3. **Optimize query patterns**:
   - Use specific field selection (avoid `SELECT *`)
   - Implement pagination for large datasets
   - Cache frequently accessed data

---

## Scaling Considerations

### When to Scale Up

**Indicators**:
- Database CPU > 70% sustained
- API response times >3 seconds
- Vercel build timeouts
- Storage approaching limits

**Scaling Options**:

1. **Vercel**: Upgrade to Pro plan ($20/month)
   - Faster builds
   - More bandwidth
   - Team collaboration

2. **Supabase**: Upgrade to Pro plan ($25/month)
   - More database size (8 GB)
   - More rows (500K)
   - Daily backups (30 days retention)

3. **OpenAI**: No scaling needed
   - Pay-as-you-go scales automatically

### Load Testing

Before major launches:

```bash
# Using k6 or similar tool
k6 run --vus 100 --duration 30s load-test.js

# Target metrics:
# - <500ms P95 API response time
# - <2s P99 full analysis time
# - 0% error rate
```

---

## Summary

This deployment guide covers:

✅ **Prerequisites** - Required accounts and tools
✅ **Environment Setup** - Local development configuration
✅ **Supabase Configuration** - Database, RLS, functions, indexes
✅ **Vercel Deployment** - Step-by-step deployment process
✅ **Post-Deployment Setup** - Testing and verification
✅ **Monitoring & Maintenance** - Ongoing operations
✅ **Troubleshooting** - Common issues and solutions
✅ **Security Checklist** - Pre and post-deployment security
✅ **Performance Optimization** - Speed and cost optimization
✅ **Scaling Considerations** - When and how to scale

**Deployment Time Estimate**:
- First-time setup: 2-3 hours
- Subsequent deployments: 5-10 minutes (automatic with Git push)

**Cost Estimate** (Monthly):
- Vercel (Hobby): $0
- Vercel (Pro): $20
- Supabase (Free): $0
- Supabase (Pro): $25
- OpenAI (varies): $10-100 depending on usage
- **Total (production)**: ~$55-145/month

---

*RealCoach AI 1.2 | Deployment Guide | Version 1.2.0 | December 31, 2025*
