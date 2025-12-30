/**
 * Assessment Types for RealCoach AI Project Evaluation
 */

export interface FeatureAssessment {
  featureName: string;
  category: 'foundation' | 'intelligence' | 'ai-engine' | 'dashboards' | 'integrations';
  planned: boolean;
  implemented: boolean;
  filePath: string | null;
  status: 'complete' | 'partial' | 'missing' | 'not-applicable';
  notes: string;
}

export interface DependencyAssessment {
  name: string;
  required: boolean;
  installed: boolean;
  version: string | null;
}

export interface PhaseAssessment {
  phaseNumber: number;
  phaseName: string;
  totalFeatures: number;
  completedFeatures: number;
  percentage: number;
  status: 'not-started' | 'in-progress' | 'complete';
}

export interface AssessmentReport {
  timestamp: string;
  overallGrade: string;
  overallScore: number;
  featureCompleteness: number;

  phases: PhaseAssessment[];
  features: FeatureAssessment[];
  dependencies: DependencyAssessment[];

  behavioralSystems: {
    name: string;
    implemented: boolean;
    filePath: string | null;
  }[];

  criticalGaps: string[];
  nextPriorities: string[];
  recommendations: string[];
}

export interface AssessmentConfig {
  projectRoot: string;
  appPath: string;
  buildPlanPath: string;
  behaviorLogicPath: string;
}
