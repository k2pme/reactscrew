'use client';

import { useCallback, useContext, useRef, useState } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';
import { executeWorkflow } from '../orchestration/workflow';
import type {
  ProgressSnapshot,
  StepResult,
  WorkflowConfig,
  WorkflowStep
} from '../orchestration/types';

export interface UseScrewWorkflowOptions {
  onProgress?: (progress: ProgressSnapshot) => void;
  onStepComplete?: (step: StepResult, all: StepResult[]) => void;
  signal?: AbortSignal;
}

export interface UseScrewWorkflowReturn {
  execute: (steps?: WorkflowStep[]) => Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }>;
  result: { steps: StepResult[]; status: 'completed' | 'failed' | 'partial' } | null;
  progress: ProgressSnapshot | null;
  isExecuting: boolean;
  reset: () => void;
}

export const useScrewWorkflow = (
  config?: WorkflowConfig,
  options?: UseScrewWorkflowOptions
): UseScrewWorkflowReturn => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewWorkflow must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const [result, setResult] = useState<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' } | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const configRef = useRef(config);

  const execute = useCallback(
    async (steps?: WorkflowStep[]): Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }> => {
      const workflowConfig: WorkflowConfig = steps
        ? { steps, onStepComplete: configRef.current?.onStepComplete, onStepError: configRef.current?.onStepError }
        : configRef.current ?? { steps: [] };

      if (!workflowConfig.steps || workflowConfig.steps.length === 0) {
        throw new Error('No steps provided to workflow');
      }

      setIsExecuting(true);
      setProgress(null);

      try {
        const workflowResult = await executeWorkflow(workflowConfig, {
          client: context.client,
          resolveClient: context.resolveClient,
          onProgress: (snapshot) => {
            setProgress(snapshot);
            options?.onProgress?.(snapshot);
          }
        });

        setResult(workflowResult);
        setProgress({
          percentage: 100,
          currentStep: null,
          currentStepId: null,
          itemsProcessed: workflowResult.steps.length,
          itemsTotal: workflowConfig.steps.length,
          failures: workflowResult.steps.filter((s) => s.status === 'error').length,
          elapsedMs: workflowResult.steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0) / workflowResult.steps.length,
          estimatedTotalMs: null,
          phase: workflowResult.status === 'failed' ? 'failed' : 'completed'
        });

        return workflowResult;
      } finally {
        setIsExecuting(false);
      }
    },
    [context.client, context.resolveClient, options]
  );

  const reset = useCallback(() => {
    setResult(null);
    setProgress(null);
    setIsExecuting(false);
  }, []);

  return { execute, result, progress, isExecuting, reset };
};
