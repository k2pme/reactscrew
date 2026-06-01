import type { ReactScrewClient } from '../types';

/* ---------- Step / Action ---------- */

export interface BatchAction {
  screwName: string;
  methodName: string;
  variables?: unknown;
  args?: unknown[];
  label?: string;
  backend?: string;
}

export type StepStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface StepResult {
  id: string;
  label: string;
  status: StepStatus;
  data?: unknown;
  error?: BatchStepError | null;
  durationMs?: number;
  retries: number;
}

/* ---------- Errors ---------- */

export interface BatchStepError {
  stepId: string;
  stepLabel: string;
  type: 'step' | 'blocking' | 'recoverable';
  code?: string;
  message: string;
  cause?: unknown;
  retryable: boolean;
}

/* ---------- Batch Result ---------- */

export interface BatchSummary {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export interface BatchResult {
  steps: StepResult[];
  summary: BatchSummary;
  status: 'completed' | 'partial' | 'failed';
}

/* ---------- Workflow ---------- */

export interface WorkflowStep {
  id: string;
  screwName: string;
  methodName: string;
  variables?: unknown;
  args?: unknown[];
  label?: string;
  dependsOn?: string[];
  retry?: number;
  retryDelay?: number;
  parallel?: boolean;
  continueOnError?: boolean;
  backend?: string;
}

export interface WorkflowConfig {
  steps: WorkflowStep[];
  onStepComplete?: (step: StepResult, all: StepResult[]) => void | Promise<void>;
  onStepError?: (error: BatchStepError, step: WorkflowStep) => boolean | Promise<boolean>;
}

/* ---------- Progress ---------- */

export interface ProgressSnapshot {
  percentage: number;
  currentStep: string | null;
  currentStepId: string | null;
  itemsProcessed: number;
  itemsTotal: number;
  failures: number;
  elapsedMs: number;
  estimatedTotalMs: number | null;
  phase: 'idle' | 'running' | 'completed' | 'failed';
}

/* ---------- Runner context ---------- */

export interface ExecutionContext {
  client: ReactScrewClient;
  resolveClient?: (screwName: string, backend?: string) => ReactScrewClient;
  onProgress?: (snapshot: ProgressSnapshot) => void;
  signal?: AbortSignal;
}
