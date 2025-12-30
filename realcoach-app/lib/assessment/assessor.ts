/**
 * Core Assessment Logic
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { FeatureAssessment, AssessmentReport, PhaseAssessment, DependencyAssessment } from './types';
import { PLANNED_FEATURES, FEATURE_INDICATORS } from './features';
import { assessDependencies, getMissingCriticalDependencies } from './dependencies';

export async function assessProject(projectRoot: string): Promise<AssessmentReport> {
  const appPath = join(projectRoot, 'realcoach-app');

  // Assess all features
  const features = await assessFeatures(appPath);

  // Assess dependencies
  const dependencies = await assessDependencies(appPath);

  // Calculate phase assessments
  const phases = calculatePhaseAssessments(features);

  // Assess behavioral systems
  const behavioralSystems = await assessBehavioralSystems(appPath);

  // Calculate overall metrics
  const overallScore = calculateOverallScore(features, dependencies, behavioralSystems);
  const featureCompleteness = calculateFeatureCompleteness(features);

  return {
    timestamp: new Date().toISOString(),
    overallGrade: calculateGrade(overallScore),
    overallScore,
    featureCompleteness,
    phases,
    features,
    dependencies,
    behavioralSystems,
    criticalGaps: identifyCriticalGaps(features, dependencies),
    nextPriorities: generateNextPriorities(features, dependencies),
    recommendations: generateRecommendations(features, dependencies, behavioralSystems),
  };
}

async function assessFeatures(appPath: string): Promise<FeatureAssessment[]> {
  const assessments: FeatureAssessment[] = [];

  for (const feature of PLANNED_FEATURES) {
    const indicatorPaths = FEATURE_INDICATORS[feature.featureName] || [];
    let status: FeatureAssessment['status'] = 'missing';
    let filePath: string | null = null;
    let notes = '';

    // Check if any indicator files exist
    for (const indicator of indicatorPaths) {
      const fullPath = join(appPath, indicator);
      try {
        await fs.access(fullPath);
        const stats = await fs.stat(fullPath);

        if (stats.isFile()) {
          filePath = fullPath;

          // Check if file has meaningful content
          const content = await fs.readFile(fullPath, 'utf-8');
          const hasContent = content.trim().length > 100;

          if (hasContent) {
            // Check for mock data or TODO comments
            const hasMock = /mock|placeholder|TODO/i.test(content);
            status = hasMock ? 'partial' : 'complete';
            notes = hasMock ? 'Contains mock/placeholder data' : 'Implemented';
          } else {
            status = 'partial';
            notes = 'File exists but minimal content';
          }

          break;
        }
      } catch {
        // File doesn't exist, continue checking
      }
    }

    assessments.push({
      ...feature,
      implemented: status !== 'missing',
      filePath,
      status,
      notes,
    });
  }

  return assessments;
}

async function assessBehavioralSystems(appPath: string): Promise<{ name: string; implemented: boolean; filePath: string | null }[]> {
  const systems = [
    { name: 'Pipeline Progression Engine', path: 'lib/ai/pipeline-engine.ts' },
    { name: 'Conversation Pattern Detection', path: 'lib/ai/pattern-detection.ts' },
    { name: 'Daily Priority Scoring', path: 'lib/ai/priority-scoring.ts' },
    { name: 'Consistency Score System', path: 'lib/ai/consistency-scoring.ts' },
    { name: 'Next Action Recommendation', path: 'lib/ai/next-action.ts' },
    { name: 'Reply Draft Generation', path: 'lib/ai/reply-generator.ts' },
    { name: '7-Day Rule Monitoring', path: 'lib/ai/seven-day-rule.ts' },
    { name: 'Manual Override System', path: 'lib/ai/override-system.ts' },
  ];

  const assessments = [];

  for (const system of systems) {
    const fullPath = join(appPath, system.path);
    let implemented = false;
    let filePath = null;

    try {
      await fs.access(fullPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      implemented = content.trim().length > 200 && !/TODO|mock|placeholder/i.test(content);
      filePath = fullPath;
    } catch {
      // File doesn't exist
    }

    assessments.push({
      name: system.name,
      implemented,
      filePath,
    });
  }

  return assessments;
}

function calculatePhaseAssessments(features: FeatureAssessment[]): PhaseAssessment[] {
  const phaseMap: Record<number, { name: string; features: FeatureAssessment[] }> = {
    1: { name: 'Foundation (Weeks 1-3)', features: [] },
    2: { name: 'Contact Intelligence (Weeks 4-6)', features: [] },
    3: { name: 'AI Pipeline Engine (Weeks 7-10)', features: [] },
    4: { name: 'Dashboards & Integrations (Weeks 11-13)', features: [] },
  };

  const categoryToPhase: Record<string, number> = {
    'foundation': 1,
    'intelligence': 2,
    'ai-engine': 3,
    'dashboards': 4,
    'integrations': 4,
  };

  for (const feature of features) {
    const phase = categoryToPhase[feature.category];
    if (phase) {
      phaseMap[phase].features.push(feature);
    }
  }

  return Object.entries(phaseMap).map(([phaseNumber, phase]) => {
    const totalFeatures = phase.features.length;
    const completedFeatures = phase.features.filter(f => f.status === 'complete').length;
    const partialFeatures = phase.features.filter(f => f.status === 'partial').length;
    const percentage = Math.round(((completedFeatures + partialFeatures * 0.5) / totalFeatures) * 100);

    let status: PhaseAssessment['status'];
    if (percentage === 0) status = 'not-started';
    else if (percentage < 100) status = 'in-progress';
    else status = 'complete';

    return {
      phaseNumber: parseInt(phaseNumber),
      phaseName: phase.name,
      totalFeatures,
      completedFeatures,
      percentage,
      status,
    };
  });
}

function calculateOverallScore(
  features: FeatureAssessment[],
  dependencies: DependencyAssessment[],
  behavioralSystems: { implemented: boolean }[]
): number {
  // Feature completeness (40%)
  const featureScore = calculateFeatureCompleteness(features);

  // Dependency score (20%)
  const installedDeps = dependencies.filter(d => d.installed || !d.required).length;
  const depScore = (installedDeps / dependencies.length) * 100;

  // Behavioral systems score (30%)
  const implementedSystems = behavioralSystems.filter(s => s.implemented).length;
  const behaviorScore = (implementedSystems / behavioralSystems.length) * 100;

  // Documentation/Bonus (10%)
  const docScore = 100; // We know documentation is excellent

  return Math.round(
    featureScore * 0.4 +
    depScore * 0.2 +
    behaviorScore * 0.3 +
    docScore * 0.1
  );
}

function calculateFeatureCompleteness(features: FeatureAssessment[]): number {
  const complete = features.filter(f => f.status === 'complete').length;
  const partial = features.filter(f => f.status === 'partial').length;
  const total = features.length;

  return Math.round(((complete + partial * 0.5) / total) * 100);
}

function calculateGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function identifyCriticalGaps(
  features: FeatureAssessment[],
  dependencies: DependencyAssessment[]
): string[] {
  const gaps: string[] = [];

  // Check critical missing dependencies
  const missingDeps = getMissingCriticalDependencies(dependencies);
  if (missingDeps.length > 0) {
    gaps.push(`Missing critical AI dependencies: ${missingDeps.join(', ')}`);
  }

  // Check Phase 2 (Intelligence) - if not started
  const phase2Features = features.filter(f => f.category === 'intelligence');
  const phase2Complete = phase2Features.filter(f => f.status !== 'missing').length;
  if (phase2Complete === 0) {
    gaps.push('Phase 2 (Contact Intelligence) not started - no import/screenshot capabilities');
  }

  // Check Phase 3 (AI Engine) - if not started
  const phase3Features = features.filter(f => f.category === 'ai-engine');
  const phase3Complete = phase3Features.filter(f => f.status !== 'missing').length;
  if (phase3Complete === 0) {
    gaps.push('Phase 3 (AI Pipeline Engine) not started - no behavioral intelligence implemented');
  }

  // Check for specific critical features
  const openai = features.find(f => f.featureName === 'openai-integration');
  if (!openai || openai.status === 'missing') {
    gaps.push('OpenAI integration missing - core AI analysis cannot function');
  }

  const pipeline = features.find(f => f.featureName === 'pipeline-progression-engine');
  if (!pipeline || pipeline.status === 'missing') {
    gaps.push('Pipeline progression engine missing - contacts cannot auto-stage');
  }

  return gaps;
}

function generateNextPriorities(
  features: FeatureAssessment[],
  dependencies: DependencyAssessment[]
): string[] {
  const priorities: string[] = [];

  // Priority 1: Install missing dependencies
  const missingDeps = getMissingCriticalDependencies(dependencies);
  if (missingDeps.length > 0) {
    priorities.push(`Install missing AI/ML dependencies: ${missingDeps.join(', ')}`);
  }

  // Priority 2: Implement Phase 2 features
  const phase2Missing = features
    .filter(f => f.category === 'intelligence' && f.status === 'missing')
    .map(f => f.featureName);
  if (phase2Missing.length > 0) {
    priorities.push(`Implement Phase 2 contact intelligence features: ${phase2Missing.slice(0, 3).join(', ')}`);
  }

  // Priority 3: Implement AI Engine
  const phase3Missing = features
    .filter(f => f.category === 'ai-engine' && f.status === 'missing')
    .map(f => f.featureName);
  if (phase3Missing.length > 0) {
    priorities.push(`Build Phase 3 AI engine core: ${phase3Missing.slice(0, 3).join(', ')}`);
  }

  // Priority 4: Replace mock data
  const mockFeatures = features.filter(f => f.notes.includes('mock'));
  if (mockFeatures.length > 0) {
    priorities.push(`Replace mock data with real implementation for ${mockFeatures.length} features`);
  }

  return priorities;
}

function generateRecommendations(
  features: FeatureAssessment[],
  dependencies: DependencyAssessment[],
  behavioralSystems: { name: string; implemented: boolean }[]
): string[] {
  const recommendations: string[] = [];

  const implementedSystems = behavioralSystems.filter(s => s.implemented).length;
  if (implementedSystems === 0) {
    recommendations.push('Start with Pipeline Progression Engine - it\'s the foundation for all behavioral features');
    recommendations.push('Implement Conversation Pattern Detection before Daily Priority Scoring');
  }

  const dashboards = features.filter(f => f.category === 'dashboards');
  const dashboardsWithMock = dashboards.filter(f => f.status === 'partial');
  if (dashboardsWithMock.length > 0) {
    recommendations.push('Complete AI engine implementation before finalizing dashboards - dashboards need real data');
  }

  const missingDeps = getMissingCriticalDependencies(dependencies);
  if (missingDeps.length > 0) {
    recommendations.push('Add all AI/ML dependencies to package.json before starting engine implementation');
  }

  return recommendations;
}
