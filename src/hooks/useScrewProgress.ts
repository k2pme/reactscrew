'use client';

import { useMemo } from 'react';
import type { BatchResult, ProgressSnapshot, StepResult } from '../orchestration/types';

export interface UseScrewProgressSource {
  progress: ProgressSnapshot | null;
  result: BatchResult | { steps: StepResult[]; status: string } | null;
  isExecuting: boolean;
}

export const useScrewProgress = (source: UseScrewProgressSource): ProgressSnapshot | null => {
  return useMemo(() => {
    if (source.progress) return source.progress;

    if (source.result && !source.isExecuting) {
      const steps = 'steps' in source.result ? source.result.steps : [];
      return {
        percentage: 100,
        currentStep: null,
        currentStepId: null,
        itemsProcessed: steps.length,
        itemsTotal: steps.length,
        failures: steps.filter((s) => s.status === 'error').length,
        elapsedMs: steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0),
        estimatedTotalMs: null,
        phase: 'completed' as const
      };
    }

    return null;
  }, [source.progress, source.result, source.isExecuting]);
};
