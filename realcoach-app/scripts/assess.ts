#!/usr/bin/env tsx

/**
 * RealCoach AI Assessment Script
 *
 * Usage:
 *   npm run assess              # Full assessment
 *   npm run assess -- --phase 2 # Check specific phase
 *   npm run assess -- --ai      # AI features only
 *   npm run assess -- --json    # Output as JSON
 *   npm run assess -- --md      # Output as Markdown
 */

import { assessProject } from '../lib/assessment/assessor';
import { formatAssessmentReport, formatJSONReport, formatMarkdownReport } from '../lib/assessment/report';

interface AssessOptions {
  phase?: number;
  ai?: boolean;
  json?: boolean;
  md?: boolean;
  output?: string;
}

function parseArgs(): AssessOptions {
  const args = process.argv.slice(2);
  const options: AssessOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--phase' && args[i + 1]) {
      options.phase = parseInt(args[++i]);
    } else if (arg === '--ai') {
      options.ai = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--md') {
      options.md = true;
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    }
  }

  return options;
}

async function main() {
  console.log('🔍 Assessing RealCoach AI 1.2 project...\n');

  const options = parseArgs();
  const projectRoot = process.cwd();

  try {
    const report = await assessProject(projectRoot);

    let output: string;

    if (options.json) {
      output = formatJSONReport(report);
    } else if (options.md) {
      output = formatMarkdownReport(report);
    } else {
      output = formatAssessmentReport(report);
    }

    if (options.output) {
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, output, 'utf-8');
      console.log(`✅ Report saved to: ${options.output}`);
    } else {
      console.log(output);
    }

    // Exit with error code if critical gaps exist
    if (report.criticalGaps.length > 3) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error running assessment:', error);
    process.exit(1);
  }
}

main();
