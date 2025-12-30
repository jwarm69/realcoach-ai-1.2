/**
 * Report Generator - Format and display assessment results
 */

import { AssessmentReport } from './types';

export function formatAssessmentReport(report: AssessmentReport): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('           RealCoach AI 1.2 - Project Assessment Report');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');

  // Overall Grade
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push(`║  OVERALL GRADE: ${report.overallGrade.padStart(43)} ║`);
  lines.push(`║  Overall Score: ${report.overallScore.toString().padStart(42)}% ║`);
  lines.push(`║  Feature Complete: ${report.featureCompleteness.toString().padStart(40)}% ║`);
  lines.push('╚═══════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Phase Breakdown
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('PHASE PROGRESS');
  lines.push('───────────────────────────────────────────────────────────────');

  for (const phase of report.phases) {
    const statusIcon = phase.status === 'complete' ? '✅' : phase.status === 'in-progress' ? '🟡' : '⬜';
    const progressBar = createProgressBar(phase.percentage);
    lines.push(`Phase ${phase.phaseNumber}: ${phase.phaseName}`);
    lines.push(`  ${statusIcon} ${phase.completedFeatures}/${phase.totalFeatures} features (${phase.percentage}%)`);
    lines.push(`  ${progressBar}`);
    lines.push('');
  }

  // Behavioral Systems
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('BEHAVIORAL SYSTEMS (Core Differentiator)');
  lines.push('───────────────────────────────────────────────────────────────');

  for (const system of report.behavioralSystems) {
    const status = system.implemented ? '✅ IMPLEMENTED' : '❌ MISSING';
    lines.push(`  ${status} - ${system.name}`);
  }
  lines.push('');

  // Critical Dependencies
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('CRITICAL DEPENDENCIES');
  lines.push('───────────────────────────────────────────────────────────────');

  const criticalDeps = report.dependencies.filter(d => d.required);
  for (const dep of criticalDeps) {
    const status = dep.installed ? '✅' : '❌';
    const version = dep.version ? `(${dep.version})` : '(NOT INSTALLED)';
    lines.push(`  ${status} ${dep.name} ${version}`);
  }
  lines.push('');

  // Critical Gaps
  if (report.criticalGaps.length > 0) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('⚠️  CRITICAL GAPS');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const gap of report.criticalGaps) {
      lines.push(`  • ${gap}`);
    }
    lines.push('');
  }

  // Next Priorities
  if (report.nextPriorities.length > 0) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('🎯 NEXT PRIORITIES (In Order)');
    lines.push('───────────────────────────────────────────────────────────────');
    report.nextPriorities.forEach((priority, index) => {
      lines.push(`  ${index + 1}. ${priority}`);
    });
    lines.push('');
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('💡 RECOMMENDATIONS');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const rec of report.recommendations) {
      lines.push(`  • ${rec}`);
    }
    lines.push('');
  }

  // Detailed Feature List
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('DETAILED FEATURE ASSESSMENT');
  lines.push('───────────────────────────────────────────────────────────────');

  const categories = ['foundation', 'intelligence', 'ai-engine', 'dashboards', 'integrations'] as const;
  for (const category of categories) {
    const categoryFeatures = report.features.filter(f => f.category === category);
    if (categoryFeatures.length === 0) continue;

    lines.push(``);
    lines.push(`${category.toUpperCase().replace('-', ' ')}`);
    lines.push(`  ${'─'.repeat(50)}`);

    for (const feature of categoryFeatures) {
      const statusIcon = feature.status === 'complete' ? '✅' : feature.status === 'partial' ? '🟡' : '⬜';
      lines.push(`  ${statusIcon} ${feature.featureName.padEnd(30)} ${feature.notes}`);
    }
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                     End of Assessment Report');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

export function createProgressBar(percentage: number, width: number = 40): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

export function formatJSONReport(report: AssessmentReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdownReport(report: AssessmentReport): string {
  const lines: string[] = [];

  lines.push('# RealCoach AI 1.2 - Assessment Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');

  lines.push('## Overall Grade');
  lines.push('');
  lines.push(`**Grade:** ${report.overallGrade}`);
  lines.push(`**Score:** ${report.overallScore}%`);
  lines.push(`**Feature Completeness:** ${report.featureCompleteness}%`);
  lines.push('');

  lines.push('## Phase Progress');
  lines.push('');

  for (const phase of report.phases) {
    const status = phase.status === 'complete' ? '✅' : phase.status === 'in-progress' ? '🟡' : '⬜';
    lines.push(`### Phase ${phase.phaseNumber}: ${phase.phaseName}`);
    lines.push(`${status} ${phase.completedFeatures}/${phase.totalFeatures} features (${phase.percentage}%)`);
    lines.push('');
  }

  lines.push('## Behavioral Systems');
  lines.push('');

  for (const system of report.behavioralSystems) {
    const emoji = system.implemented ? '✅' : '❌';
    lines.push(`${emoji} **${system.name}**`);
  }
  lines.push('');

  if (report.criticalGaps.length > 0) {
    lines.push('## Critical Gaps');
    lines.push('');
    for (const gap of report.criticalGaps) {
      lines.push(`- ⚠️ ${gap}`);
    }
    lines.push('');
  }

  if (report.nextPriorities.length > 0) {
    lines.push('## Next Priorities');
    lines.push('');
    report.nextPriorities.forEach((priority, index) => {
      lines.push(`${index + 1}. ${priority}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
