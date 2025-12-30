/**
 * Feature Registry - All planned features from build plan
 */

import { FeatureAssessment } from './types';

export const PLANNED_FEATURES: Omit<FeatureAssessment, 'implemented' | 'filePath' | 'status' | 'notes'>[] = [
  // Phase 1: Foundation (Weeks 1-3)
  {
    featureName: 'nextjs-setup',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'supabase-auth',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'database-schema',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'contact-crud',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'contact-form',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'pipeline-badge',
    category: 'foundation',
    planned: true,
  },
  {
    featureName: 'behavioral-fields',
    category: 'foundation',
    planned: true,
  },

  // Phase 2: Contact Intelligence (Weeks 4-6)
  {
    featureName: 'csv-import',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'google-contacts-import',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'iphone-contacts-import',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'screenshot-upload',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'tesseract-ocr',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'voice-input',
    category: 'intelligence',
    planned: true,
  },
  {
    featureName: 'text-input',
    category: 'intelligence',
    planned: true,
  },

  // Phase 3: AI Pipeline Engine (Weeks 7-10)
  {
    featureName: 'pipeline-progression-engine',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'conversation-pattern-detection',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'daily-priority-scoring',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'consistency-score-system',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'next-action-recommendation',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'reply-draft-generation',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'seven-day-rule-monitoring',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'openai-integration',
    category: 'ai-engine',
    planned: true,
  },
  {
    featureName: 'manual-override-system',
    category: 'ai-engine',
    planned: true,
  },

  // Phase 4: Dashboards & Integrations (Weeks 11-13)
  {
    featureName: 'behavior-dashboard',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'sales-dashboard',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'four-conversations-tracking',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'gci-calculator',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'conversion-funnel',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'lead-source-tracking',
    category: 'dashboards',
    planned: true,
  },
  {
    featureName: 'mailchimp-integration',
    category: 'integrations',
    planned: true,
  },
  {
    featureName: 'mobile-optimization',
    category: 'dashboards',
    planned: true,
  },
];

// File paths that indicate implementation
export const FEATURE_INDICATORS: Record<string, string[]> = {
  'nextjs-setup': ['next.config.ts', 'package.json', 'app/layout.tsx'],
  'supabase-auth': ['lib/supabase/client.ts', 'lib/supabase/server.ts', 'app/auth/callback/route.ts'],
  'database-schema': ['lib/database.types.ts', 'supabase/migrations'],
  'contact-crud': ['app/api/contacts/route.ts', 'lib/services/contacts.ts'],
  'contact-form': ['components/contacts/contact-form.tsx'],
  'pipeline-badge': ['components/contacts/pipeline-badge.tsx'],
  'behavioral-fields': ['lib/database.types.ts'],
  'csv-import': ['components/contacts/csv-import.tsx', 'lib/services/csv-import.ts'],
  'google-contacts-import': ['lib/services/google-contacts.ts'],
  'iphone-contacts-import': ['lib/services/iphone-contacts.ts'],
  'screenshot-upload': ['components/inputs/screenshot-upload.tsx', 'app/api/upload/route.ts'],
  'tesseract-ocr': ['lib/ai/ocr.ts'],
  'voice-input': ['components/inputs/voice-input.tsx'],
  'text-input': ['components/inputs/text-input.tsx'],
  'pipeline-progression-engine': ['lib/ai/pipeline-engine.ts'],
  'conversation-pattern-detection': ['lib/ai/pattern-detection.ts'],
  'daily-priority-scoring': ['lib/ai/priority-scoring.ts'],
  'consistency-score-system': ['lib/ai/consistency-scoring.ts'],
  'next-action-recommendation': ['lib/ai/next-action.ts'],
  'reply-draft-generation': ['lib/ai/reply-generator.ts'],
  'seven-day-rule-monitoring': ['lib/ai/seven-day-rule.ts'],
  'openai-integration': ['lib/ai/openai.ts'],
  'manual-override-system': ['lib/ai/override-system.ts'],
  'behavior-dashboard': ['app/dashboard/behavior/page.tsx'],
  'sales-dashboard': ['app/dashboard/sales/page.tsx'],
  'four-conversations-tracking': ['lib/services/four-conversations.ts'],
  'gci-calculator': ['lib/services/gci.ts'],
  'conversion-funnel': ['components/dashboard/conversion-funnel.tsx'],
  'lead-source-tracking': ['components/dashboard/lead-sources.tsx'],
  'mailchimp-integration': ['lib/integrations/mailchimp.ts'],
  'mobile-optimization': ['app/layout.tsx'],
};
