# Real Agent AI - Development Workflow Guide

## Overview

This guide provides comprehensive instructions for developing, testing, deploying, and maintaining the RealCoach.ai application.

---

## Development Environment Setup

### Prerequisites

```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # 9.0.0 or higher

# Git
git --version

# Code Editor (VS Code recommended)
code --version
```

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/realcoach-ai.git
cd realcoach-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
code .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Contacts
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mailchimp
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_LIST_ID=your_mailchimp_list_id
MAILCHIMP_DC=usX

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Local Development

### Running the Development Server

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

### Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link

# Run migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- contactService.test.ts
```

---

## Development Workflow

### Feature Development

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop your feature**
   - Follow the code style guidelines
   - Write tests for new functionality
   - Update documentation as needed

3. **Test locally**
   ```bash
   npm run dev
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Conventions

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update build process
```

---

## Code Organization

### File Structure

```
realcoach-ai/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes
│   ├── dashboard/         # Dashboard pages
│   ├── contacts/          # Contact pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── contacts/         # Contact components
│   ├── dashboard/        # Dashboard components
│   └── inputs/           # Input components
├── lib/                  # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── ai/              # AI engines
│   └── utils/           # Helper functions
├── public/              # Static assets
├── tests/               # Test files
└── types/              # TypeScript types
```

### Component Guidelines

```typescript
// Good component structure
import { useState, useEffect } from 'react';
import { useContacts } from '@/lib/hooks/useContacts';

interface ContactCardProps {
  contact: Contact;
  onAction?: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onAction
}) => {
  // Component logic here

  return (
    <div className="contact-card">
      {/* JSX here */}
    </div>
  );
};

export default ContactCard;
```

---

## Testing Strategy

### Unit Tests

```typescript
// Example unit test
import { describe, it, expect } from '@jest/globals';
import { calculatePriorityScore } from '@/lib/ai/priorityEngine';

describe('Priority Score Calculation', () => {
  it('should calculate correct score for high motivation contact', () => {
    const factors = {
      motivationLevel: 'High',
      daysSinceContact: 1,
      pipelineStage: 'New Opportunity',
      isNewLead: true,
      timeframe: 'Immediate',
      sevenDayRuleViolation: false
    };

    const score = calculatePriorityScore(factors);

    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should boost score for 7-day rule violation', () => {
    const factors = {
      motivationLevel: 'High',
      daysSinceContact: 8,
      pipelineStage: 'Active Opportunity',
      isNewLead: false,
      timeframe: '1-3 months',
      sevenDayRuleViolation: true
    };

    const score = calculatePriorityScore(factors);

    expect(score).toBeGreaterThanOrEqual(70);
  });
});
```

### Integration Tests

```typescript
// Example integration test
import { test, expect } from '@playwright/test';

test.describe('Contact Management', () => {
  test('should create a new contact', async ({ page }) => {
    await page.goto('/contacts/new');
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.selectOption('[name="pipeline_stage"]', 'Lead');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/contacts\/[a-f0-9-]+$/);
  });

  test('should upload and analyze screenshot', async ({ page }) => {
    await page.goto('/contacts/test-id');
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-screenshot.png');

    // Wait for OCR and analysis
    await page.waitForSelector('[data-testid="analysis-results"]');

    await expect(page.locator('[data-testid="detected-stage"]')).toBeVisible();
  });
});
```

### E2E Tests

```typescript
// Example E2E test
test.describe('Daily Actions Flow', () => {
  test('should complete daily action workflow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // View daily actions
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="daily-actions"]')).toBeVisible();

    // Complete first action
    await page.click('[data-testid="action-0"] button');
    await page.click('button:has-text("Mark Complete")');

    // Verify completion
    await expect(page.locator('[data-testid="action-0"]')).toHaveClass(/completed/);
  });
});
```

---

## Deployment

### Staging Deployment

```bash
# Deploy to Vercel staging
vercel --env staging

# Or use GitHub integration
# Push to staging branch
git push origin staging
```

### Production Deployment

```bash
# Deploy to Vercel production
vercel --prod

# Or use GitHub integration
# Merge main branch
git checkout main
git pull origin main
git push origin main
```

### Environment Setup in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.local`
5. Select appropriate environments (Production, Preview, Development)

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run type check
      run: npm run type-check

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--env staging'

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## Monitoring and Maintenance

### Application Monitoring

```typescript
// lib/monitoring/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  Analytics.track(eventName, properties);
};

// Usage
trackEvent('contact_created', {
  pipeline_stage: contact.pipeline_stage,
  lead_source: contact.lead_source
});
```

### Error Tracking

```typescript
// lib/monitoring/errorTracking.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context
  });
};
```

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export const measurePerformance = (metricName: string, fn: () => Promise<any>) => {
  const start = performance.now();

  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`${metricName}: ${duration}ms`);

    // Send to analytics
    trackEvent('performance_metric', {
      metric: metricName,
      duration
    });
  });
};
```

---

## Database Maintenance

### Regular Backups

```bash
# Manual backup
supabase db dump -f backup.sql

# Scheduled backups (via Supabase dashboard)
# Settings > Database > Backups
```

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM contacts WHERE user_id = 'user-id';

-- Update statistics
ANALYZE contacts;

-- Reindex tables
REINDEX TABLE contacts;
```

### Data Cleanup

```sql
-- Delete old activity logs (older than 1 year)
DELETE FROM activity_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete old conversation records (optional)
DELETE FROM conversations
WHERE created_at < NOW() - INTERVAL '2 years'
AND user_id IN (
  SELECT user_id FROM auth.users WHERE deleted_at IS NOT NULL
);
```

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection Issues

```bash
# Check Supabase status
supabase status

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### OpenAI API Errors

```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## Best Practices

### Code Quality

- Use TypeScript for type safety
- Follow ESLint rules
- Write tests for new features
- Document complex logic
- Use meaningful variable names

### Security

- Never commit secrets to git
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Validate and sanitize user inputs
- Keep dependencies up to date

### Performance

- Optimize images
- Use lazy loading for components
- Implement caching strategies
- Minimize bundle size
- Use code splitting

---

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)

### Tools

- [VS Code](https://code.visualstudio.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)

---

*This development workflow guide provides complete instructions for building and maintaining RealCoach.ai.*
