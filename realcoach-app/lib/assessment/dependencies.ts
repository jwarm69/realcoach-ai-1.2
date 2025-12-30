/**
 * Dependency Assessment - Check required packages
 */

import { DependencyAssessment } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const REQUIRED_DEPENDENCIES: Omit<DependencyAssessment, 'installed' | 'version'>[] = [
  // Core
  { name: 'next', required: true },
  { name: 'react', required: true },
  { name: 'react-dom', required: true },
  { name: 'typescript', required: true },

  // Supabase
  { name: '@supabase/supabase-js', required: true },
  { name: '@supabase/ssr', required: true },

  // UI
  { name: 'tailwindcss', required: true },
  { name: '@radix-ui/react-dialog', required: true },
  { name: '@radix-ui/react-dropdown-menu', required: true },
  { name: 'lucide-react', required: true },

  // Forms
  { name: 'react-hook-form', required: true },
  { name: 'zod', required: true },
  { name: '@hookform/resolvers', required: true },

  // AI/ML (CRITICAL - currently missing)
  { name: 'openai', required: true },
  { name: 'tesseract.js', required: true },

  // Integrations (CRITICAL - currently missing)
  { name: 'papaparse', required: true },
  { name: 'googleapis', required: true },
  { name: '@mailchimp/mailchimp_marketing', required: true },

  // Utilities
  { name: 'date-fns', required: true },
  { name: 'recharts', required: true },
];

export async function assessDependencies(projectRoot: string): Promise<DependencyAssessment[]> {
  const packageJsonPath = join(projectRoot, 'package.json');

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    return REQUIRED_DEPENDENCIES.map(dep => ({
      ...dep,
      installed: allDeps[dep.name] !== undefined,
      version: allDeps[dep.name] || null,
    }));
  } catch (error) {
    console.error('Error reading package.json:', error);
    return REQUIRED_DEPENDENCIES.map(dep => ({
      ...dep,
      installed: false,
      version: null,
    }));
  }
}

export function getMissingCriticalDependencies(assessment: DependencyAssessment[]): string[] {
  return assessment
    .filter(dep => dep.required && !dep.installed)
    .map(dep => dep.name);
}
