/**
 * Metadata Testing Domain Types
 *
 * Clean domain types for the metadata testing system.
 */

export interface ThumbnailFile {
  name: string;
  path: string;
  word: string;
}

export interface MetadataValidationIssue {
  beat: number;
  field: string;
  type: "error" | "warning";
  message: string;
}

export interface InvalidMotionType {
  beat: number;
  prop: string;
  type: string;
}

export interface MetadataStats {
  // Basic counts
  totalBeats: number;
  sequenceLength: number;
  realBeatsCount: number;
  startPositionCount: number;

  // Author validation
  hasAuthor: boolean;
  authorName: string | null;
  authorMissing: boolean;
  authorInconsistent: boolean;

  // Level validation
  hasLevel: boolean;
  level: number | null;
  levelMissing: boolean;
  levelInconsistent: boolean;
  levelZero: boolean;

  // Start position validation
  hasStartPosition: boolean;
  startPositionMissing: boolean;
  startPositionInconsistent: boolean;
  startPositionValue: string | null;

  // Beat validation
  missingBeatNumbers: number[];
  missingLetters: number[];
  missingMotionData: number[];
  invalidMotionTypes: InvalidMotionType[];

  // Data integrity issues
  duplicateBeats: number[];
  invalidBeatStructure: number[];
  missingRequiredFields: MetadataValidationIssue[];

  // Overall health
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  healthScore: number; // 0-100

  // Error and warning details for batch analysis
  errors?: string[];
  warnings?: string[];

  // Batch analysis support
  isBatchSummary?: boolean;
  batchSummary?: BatchSummary;
}

export interface BatchSummary {
  sequencesAnalyzed: number;
  healthySequences: number;
  unhealthySequences: number;
  averageHealthScore: number;
  totalErrors: number;
  totalWarnings: number;
  commonErrors: Array<[string, number]>;
  commonWarnings: Array<[string, number]>;
  worstSequences: Array<{ sequence: string; healthScore: number }>;
  bestSequences: Array<{ sequence: string; healthScore: number }>;
}

export interface SequenceMetadata {
  raw: Record<string, unknown>[];
  extracted: Record<string, unknown>;
  stats: MetadataStats | null;
}

export interface MetadataTestingConfig {
  validMotionTypes: string[];
  requiredFields: string[];
  healthScoreWeights: {
    authorWeight: number;
    levelWeight: number;
    startPositionWeight: number;
    beatIntegrityWeight: number;
    motionDataWeight: number;
  };
}

export interface SequenceFile {
  name: string;
  file: File;
}

export interface MetadataAnalysisResult {
  sequenceName: string;
  stats: MetadataStats;
  issues: {
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  };
}

export interface BatchAnalysisConfig {
  batchSize: number;
  delayMs?: number;
  exportFormat?: "json" | "csv";
}

export interface BatchAnalysisResult {
  analysisId: string;
  totalSequences: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  results: MetadataAnalysisResult[];
  errors: Array<{ sequence: string; error: string }>;
  duration: number;
  summary: {
    averageHealthScore: number;
    totalErrors: number;
    totalWarnings: number;
    commonIssues: Array<{ issue: string; count: number; percentage: number }>;
    healthDistribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
  };
  timestamp: string;
}
