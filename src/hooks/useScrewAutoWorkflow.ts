'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';
import { executeWorkflow } from '../orchestration/workflow';
import type {
  ProgressSnapshot,
  StepResult,
  WorkflowConfig,
  WorkflowStep
} from '../orchestration/types';

export interface UseScrewAutoWorkflowOptions {
  config: WorkflowConfig;
  watch?: { screwName: string; methodName: string; args?: unknown[] }[];
  autoStart?: boolean;
  intervalMs?: number;
  onProgress?: (progress: ProgressSnapshot) => void;
  onStepComplete?: (step: StepResult, all: StepResult[]) => void;
  onStatusChange?: (status: 'idle' | 'waiting' | 'running' | 'completed' | 'failed') => void;
  signal?: AbortSignal;
}

export interface UseScrewAutoWorkflowReturn {
  start: () => Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }>;
  reset: () => void;
  result: { steps: StepResult[]; status: 'completed' | 'failed' | 'partial' } | null;
  progress: ProgressSnapshot | null;
  isExecuting: boolean;
  status: 'idle' | 'waiting' | 'running' | 'completed' | 'failed';
  waitingSteps: string[];
}

export const useScrewAutoWorkflow = (
  options: UseScrewAutoWorkflowOptions
): UseScrewAutoWorkflowReturn => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewAutoWorkflow must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const [result, setResult] = useState<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' } | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'running' | 'completed' | 'failed'>('idle');
  const [waitingSteps, setWaitingSteps] = useState<string[]>([]);
  const executingRef = useRef(false);

  const evaluateAndRun = useCallback(async (): Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }> => {
    if (executingRef.current) throw new Error('Workflow is already executing');
    executingRef.current = true;
    setIsExecuting(true);
    setStatus('running');
    setProgress(null);

    const variables = options.config.variables;

    try {
      const workflowResult = await executeWorkflow(options.config, {
        client: context.client,
        resolveClient: context.resolveClient,
        onProgress: (snap) => {
          setProgress(snap);
          options.onProgress?.(snap);
        },
        onStepCondition: (cond) => {
          if (!cond.passed && options.config.steps.find((s) => s.id === cond.stepId)?.waitForCondition) {
            setWaitingSteps((prev) => (prev.includes(cond.stepId) ? prev : [...prev, cond.stepId]));
            setStatus('waiting');
          }
        },
        variables,
      });

      setResult(workflowResult);
      setProgress({
        percentage: 100,
        currentStep: null,
        currentStepId: null,
        itemsProcessed: workflowResult.steps.length,
        itemsTotal: options.config.steps.length,
        failures: workflowResult.steps.filter((s) => s.status === 'error').length,
        elapsedMs: workflowResult.steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0) / workflowResult.steps.length,
        estimatedTotalMs: null,
        phase: workflowResult.status === 'failed' ? 'failed' : 'completed'
      });
      setStatus(workflowResult.status === 'failed' ? 'failed' : 'completed');
      setWaitingSteps([]);

      return workflowResult;
    } finally {
      executingRef.current = false;
      setIsExecuting(false);
    }
  }, [context.client, context.resolveClient, options.config, options.onProgress, options.config.steps]);

  useEffect(() => {
    if (!options.autoStart) return;
    evaluateAndRun();
  }, [options.autoStart, evaluateAndRun]);

  const start = useCallback(async () => {
    return evaluateAndRun();
  }, [evaluateAndRun]);

  const reset = useCallback(() => {
    setResult(null);
    setProgress(null);
    setIsExecuting(false);
    setStatus('idle');
    setWaitingSteps([]);
    executingRef.current = false;
  }, []);

  return { start, reset, result, progress, isExecuting, status, waitingSteps };
};
