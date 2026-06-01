'use client';

import type { ReactScrewClient } from '../types';
import type {
  BatchAction,
  BatchResult,
  BatchStepError,
  ExecutionContext,
  ProgressSnapshot,
  StepResult
} from './types';

const createStepError = (
  stepId: string,
  stepLabel: string,
  type: BatchStepError['type'],
  message: string,
  cause?: unknown,
  retryable = false
): BatchStepError => ({
  stepId,
  stepLabel,
  type,
  message,
  cause,
  retryable
});

const resolveExecutionClient = (action: BatchAction, ctx: ExecutionContext): ReactScrewClient => {
  if (ctx.resolveClient) {
    return ctx.resolveClient(action.screwName, action.backend);
  }
  return ctx.client;
};

const runSingleAction = async (
  action: BatchAction,
  index: number,
  ctx: ExecutionContext
): Promise<StepResult> => {
  const id = `step-${index}`;
  const label = action.label ?? `${action.screwName}.${action.methodName}`;
  const startTime = Date.now();
  const retries = 0;

  const attempt = async (): Promise<StepResult> => {
    try {
      if (ctx.signal?.aborted) {
        return {
          id,
          label,
          status: 'skipped',
          error: createStepError(id, label, 'step', 'Execution aborted'),
          durationMs: Date.now() - startTime,
          retries
        };
      }

      const actionClient = resolveExecutionClient(action, ctx);
      const data = await actionClient.executeMutation(
        action.screwName,
        action.methodName,
        action.variables,
        action.args
      );

      return {
        id,
        label,
        status: 'success',
        data,
        durationMs: Date.now() - startTime,
        retries
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        id,
        label,
        status: 'error',
        error: createStepError(id, label, 'step', errMsg, error, false),
        durationMs: Date.now() - startTime,
        retries
      };
    }
  };

  return attempt();
};

const computeProgress = (
  index: number,
  total: number,
  failures: number,
  currentStep: string | null,
  currentStepId: string | null,
  startTime: number
): ProgressSnapshot => ({
  percentage: total > 0 ? Math.round((index / total) * 100) : 0,
  currentStep,
  currentStepId,
  itemsProcessed: index,
  itemsTotal: total,
  failures,
  elapsedMs: Date.now() - startTime,
  estimatedTotalMs: index > 0 ? ((Date.now() - startTime) / index) * total : null,
  phase: 'running'
});

export const executeBatch = async (
  actions: BatchAction[],
  ctx: ExecutionContext
): Promise<BatchResult> => {
  const startTime = Date.now();
  const steps: StepResult[] = [];
  let failures = 0;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const label = action.label ?? `${action.screwName}.${action.methodName}`;

    ctx.onProgress?.(computeProgress(i, actions.length, failures, label, `step-${i}`, startTime));

    const result = await runSingleAction(action, i, ctx);
    steps.push(result);

    if (result.status === 'error') {
      failures++;
    }
  }

  ctx.onProgress?.({
    percentage: 100,
    currentStep: null,
    currentStepId: null,
    itemsProcessed: actions.length,
    itemsTotal: actions.length,
    failures,
    elapsedMs: Date.now() - startTime,
    estimatedTotalMs: null,
    phase: failures > 0 ? (failures === actions.length ? 'failed' : 'completed') : 'completed'
  });

  const succeeded = steps.filter((s) => s.status === 'success').length;
  const failed = steps.filter((s) => s.status === 'error').length;
  const skipped = steps.filter((s) => s.status === 'skipped').length;

  return {
    steps,
    summary: {
      total: actions.length,
      succeeded,
      failed,
      skipped,
      durationMs: Date.now() - startTime
    },
    status: failed === 0 ? 'completed' : failed === actions.length ? 'failed' : 'partial'
  };
};
