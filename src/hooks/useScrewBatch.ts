'use client';

import { useCallback, useContext, useRef, useState } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';
import { executeBatch } from '../orchestration/batch';
import type {
  BatchAction,
  BatchResult,
  ProgressSnapshot
} from '../orchestration/types';

export interface UseScrewBatchOptions {
  onProgress?: (progress: ProgressSnapshot) => void;
  onStepComplete?: (step: BatchResult['steps'][number]) => void;
  signal?: AbortSignal;
}

export interface UseScrewBatchReturn {
  execute: (actions?: BatchAction[]) => Promise<BatchResult>;
  result: BatchResult | null;
  progress: ProgressSnapshot | null;
  isExecuting: boolean;
  reset: () => void;
}

export const useScrewBatch = (
  initialActions?: BatchAction[],
  options?: UseScrewBatchOptions
): UseScrewBatchReturn => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewBatch must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const [result, setResult] = useState<BatchResult | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const actionsRef = useRef(initialActions);

  const execute = useCallback(
    async (actions?: BatchAction[]): Promise<BatchResult> => {
      const items = actions ?? actionsRef.current;
      if (!items || items.length === 0) {
        throw new Error('No actions provided to batch');
      }

      setIsExecuting(true);
      setProgress(null);

      try {
        const batchResult = await executeBatch(items, {
          client: context.client,
          resolveClient: context.resolveClient,
          onProgress: (snapshot) => {
            setProgress(snapshot);
            options?.onProgress?.(snapshot);
          }
        });

        for (const step of batchResult.steps) {
          options?.onStepComplete?.(step);
        }

        setResult(batchResult);
        setProgress({
          percentage: 100,
          currentStep: null,
          currentStepId: null,
          itemsProcessed: batchResult.summary.total,
          itemsTotal: batchResult.summary.total,
          failures: batchResult.summary.failed,
          elapsedMs: batchResult.summary.durationMs,
          estimatedTotalMs: null,
          phase: batchResult.status === 'failed' ? 'failed' : 'completed'
        });

        return batchResult;
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
