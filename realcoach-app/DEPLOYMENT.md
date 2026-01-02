# Deployment Guide - RealCoach AI 1.2

This guide covers deploying RealCoach AI to production on Vercel.

## Current Deployment

**Live URL**: https://realcoach-9nm7589m9-jwarm69s-projects.vercel.app
**Status**: Active
**Vercel Project ID**: prj_c42WDJTJFV1NZE3mpGYrtTwzzzJ9
**Supabase Project**: uxctdjdhyxzfdogxtwux

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [External Services Setup](#external-services-setup)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Vercel Deployment](#vercel-deployment)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with the code pushed to a repository
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Supabase account (free tier at https://supabase.com)
- [ ] OpenAI account with API key (https://platform.openai.com)
- [ ] Resend account (https://resend.com)

---

## External Services Setup

### 1. Supabase (Database + Auth)

1. **Create Project**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub
   - Click "New Project"
   - Name: `realcoach-prod` (or your preferred name)
   - Database Password: **Generate and save securely** (use a password manager)
   - Region: Choose closest to your users
   - Click "Create new project"

2. **Get API Keys**
   - Go to Project Settings → API
   - Copy these values:
     ```
     Project URL → NEXT_PUBLIC_SUPABASE_URL
     anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
     service_role → SUPABASE_SERVICE_ROLE_KEY
     ```

3. **Configure Authentication**
   - Go to Authentication → Providers
   - Enable Email provider (already enabled by default)
   - Optionally enable Google OAuth:
     - Click Google provider
     - Add your Google Client ID and Secret
     - Set Redirect URL: `https://your-domain.vercel.app/auth/callback`

### 2. OpenAI (AI Features)

1. **Create Account**
   - Go to https://platform.openai.com
   - Sign up and verify email

2. **Create API Key**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it `RealCoach Production`
   - **Copy immediately** (won't be shown again)
   - Save as: `OPENAI_API_KEY`

3. **Set Up Billing**
   - Go to https://platform.openai.com/account/billing
   - Add payment method ($5 minimum deposit)
   - Set usage limits to avoid surprise bills (e.g., $20/month hard limit)

### 3. Resend (Email Notifications)

1. **Create Account**
   - Go to https://resend.com
   - Sign up with GitHub

2. **Get API Key**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Save as: `RESEND_API_KEY`

3. **Verify Domain**
   - Go to https://resend.com/domains
   - Add your domain (e.g., `yourdomain.com`)
   - Add the DNS records provided by Resend
   - Wait for verification (can take 24-48 hours)
   - For testing, use the free `@resend.dev` domain (no verification needed)

### 4. VAPID Keys (Push Notifications - Optional)

Generate VAPID keys for browser push notifications:

```bash
npx web-push generate-vapid-keys
```

Save the output:
```bash
publicKey  → NEXT_PUBLIC_VAPID_PUBLIC_KEY
privateKey → VAPID_PRIVATE_KEY
```

---

## Database Setup

### Quick Setup (Recommended)

Run the consolidated setup script in Supabase SQL Editor:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and run the contents of `supabase/setup.sql`

This single file contains all tables, policies, and triggers needed for the application.

### Individual Migrations (Alternative)

If you prefer to run migrations individually:

```sql
-- Migration 1: Sales Tracking
-- Copy contents of supabase/migrations/20250101000000_sales_tracking.sql

-- Migration 2: Cron Logs
-- Copy contents of supabase/migrations/20250101000001_cron_logs.sql

-- Migration 3: Push Subscriptions
-- Copy contents of supabase/migrations/20250101000002_push_subscriptions.sql

-- Migration 4: Pipeline Stage History
-- Copy contents of supabase/migrations/20250131073754_pipeline_stage_history.sql

-- Migration 5: Notification Preferences
-- Copy contents of supabase/migrations/20250131100000_create_notification_preferences.sql
```

5. Verify RLS is enabled:
   - Go to Database → Tables
   - Click on any table
   - Verify "RLS" is enabled

---

## Environment Variables

### Local Development (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Resend
RESEND_API_KEY=re_xxxxx

# VAPID (Optional - for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP_xxxxx
VAPID_PUBLIC_KEY=BP_xxxxx
VAPID_PRIVATE_KEY=xxxxx

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Security
CRON_SECRET=generate-a-random-secret-here

# Mailchimp (Optional)
MAILCHIMP_API_KEY=xxxxx
MAILCHIMP_LIST_ID=xxxxx
MAILCHIMP_DC=usX
```

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY
CRON_SECRET
```

**Optional (for push notifications):**
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

**Optional (for Google OAuth):**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

---

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select the `realcoach-app` repository

2. **Configure Project**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables from the previous section
   - Make sure to select the correct environment (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)
   - Your app will be available at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `app.realcoach.ai`)
3. Update DNS records as instructed by Vercel

---

## Post-Deployment

### 1. Create First User

1. Go to `https://your-app.vercel.app/signup`
2. Create your account
3. Verify email if enabled

### 2. Seed Test Data (Optional)

```bash
# Get your user ID from Supabase Dashboard > Authentication > Users

# Run seed script
npx tsx scripts/seed.ts <your-user-id>
```

### 3. Configure Cron Jobs

Vercel supports cron jobs via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-actions",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This sends daily priority notifications at 8 AM UTC.

### 4. Test Core Features

- [ ] User registration and login
- [ ] Create a contact manually
- [ ] Log a conversation with AI analysis
- [ ] View dashboard and priority contacts
- [ ] Test email notifications
- [ ] Test push notifications (if configured)

---

## Troubleshooting

### Build Fails

```bash
# Locally test the build
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Environment Variables Not Working

- Ensure variables are added to the correct environment (Production)
- Redeploy after adding variables
- Check `.env.local` is not committed to git

### Database Connection Errors

- Verify Supabase URL and keys are correct
- Check RLS policies are enabled
- Ensure tables exist (run migrations)

### Push Notifications Not Working

- Verify VAPID keys are set
- Check browser console for errors
- Ensure service worker is registered

### OpenAI API Errors

- Verify API key is valid
- Check billing is set up
- Monitor usage at https://platform.openai.com/usage

### Email Not Sending

- Verify Resend API key
- Check domain is verified (or use @resend.dev)
- Check spam folder

---

## Monitoring

### Vercel Analytics

- Enabled by default
- Go to Vercel Dashboard → Analytics
- Monitor page views, core web vitals

### Supabase Logs

- Go to Supabase Dashboard → Logs
- Monitor database queries and auth events

### OpenAI Usage

- Go to https://platform.openai.com/usage
- Set budget alerts

---

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use strong database password
- [ ] Enable RLS on all Supabase tables
- [ ] Rotate API keys periodically
- [ ] Set usage limits on OpenAI
- [ ] Enable 2FA on all accounts
- [ ] Use environment-specific API keys (dev vs prod)

---

## Post-Redesign Notes (January 2026)

The application now includes:
- **6 specialized dashboard pages** with dark theme
- **Horizontal navigation** (replaces previous sidebar)
- **AI sidebar** on all pages for real-time assistance
- **New design system** with green accent (#00FF7F) and oklch color space
- **Modern UI components** with improved UX

### New Pages

| Page | Route | Description |
|------|-------|-------------|
| Ignition | `/` | Main landing with centered AI input |
| Goals & Actions | `/goals` | Yearly GCI targets with daily actions |
| Business Plan | `/business-plan` | 3-column strategic planning |
| Pipeline | `/pipeline` | Lead table with metrics and progress |
| Production Dashboard | `/production` | Goal alignment and revenue charts |
| Database | `/database` | Contact management database |

### Layout Components

- `components/layout/realcoach-navigation.tsx` - Horizontal top navigation
- `components/layout/ai-sidebar.tsx` - AI chat sidebar (all pages)

---

## Support

For issues or questions:
- Check the [README.md](README.md) for development setup
- Review Supabase docs: https://supabase.com/docs
- Review Vercel docs: https://vercel.com/docs
- Review OpenAI docs: https://platform.openai.com/docs
