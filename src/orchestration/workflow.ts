'use client';

import type { ReactScrewClient } from '../types';
import type {
  BatchStepError,
  ExecutionContext,
  StepResult,
  WorkflowConfig,
  WorkflowStep
} from './types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const resolveExecutionClient = (step: WorkflowStep, ctx: ExecutionContext): ReactScrewClient => {
  if (ctx.resolveClient) {
    return ctx.resolveClient(step.screwName, step.backend);
  }
  return ctx.client;
};

const runWorkflowStep = async (
  step: WorkflowStep,
  ctx: ExecutionContext
): Promise<StepResult> => {
  const startTime = Date.now();
  const maxRetries = step.retry ?? 0;
  const retryDelayMs = step.retryDelay ?? 1000;
  let lastError: BatchStepError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (ctx.signal?.aborted) {
        return {
          id: step.id,
          label: step.label ?? `${step.screwName}.${step.methodName}`,
          status: 'skipped',
          durationMs: Date.now() - startTime,
          retries: attempt
        };
      }

      const stepClient = resolveExecutionClient(step, ctx);
      const data = await stepClient.executeMutation(
        step.screwName,
        step.methodName,
        step.variables,
        step.args
      );

      return {
        id: step.id,
        label: step.label ?? `${step.screwName}.${step.methodName}`,
        status: 'success',
        data,
        durationMs: Date.now() - startTime,
        retries: attempt
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      lastError = {
        stepId: step.id,
        stepLabel: step.label ?? `${step.screwName}.${step.methodName}`,
        type: attempt < maxRetries ? 'recoverable' : 'blocking',
        message: errMsg,
        cause: error,
        retryable: attempt < maxRetries
      };

      if (attempt < maxRetries) {
        await delay(retryDelayMs);
      }
    }
  }

  return {
    id: step.id,
    label: step.label ?? `${step.screwName}.${step.methodName}`,
    status: 'error',
    error: lastError ?? undefined,
    durationMs: Date.now() - startTime,
    retries: maxRetries
  };
};

const resolveDependencies = (
  steps: WorkflowStep[],
  completed: Map<string, StepResult>
): WorkflowStep[] => {
  return steps.filter((step) => {
    if (!step.dependsOn || step.dependsOn.length === 0) return true;
    return step.dependsOn.every((depId) => {
      const dep = completed.get(depId);
      return dep && (dep.status === 'success' || (dep.status === 'error' && steps.find((s) => s.id === depId)?.continueOnError));
    });
  });
};

export const executeWorkflow = async (
  config: WorkflowConfig,
  ctx: ExecutionContext
): Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }> => {
  const startTime = Date.now();
  const completed = new Map<string, StepResult>();
  const allSteps = [...config.steps];
  let hasBlockingFailure = false;

  while (completed.size < allSteps.length) {
    const ready = resolveDependencies(
      allSteps.filter((s) => !completed.has(s.id)),
      completed
    );

    if (ready.length === 0) {
      break;
    }

    const parallel = ready.filter((s) => s.parallel !== false);
    const results: StepResult[] = [];

    if (parallel.length > 1) {
      const parallelResults = await Promise.all(
        parallel.map(async (step) => {
          ctx.onProgress?.({
            percentage: Math.round((completed.size / allSteps.length) * 100),
            currentStep: step.label ?? `${step.screwName}.${step.methodName}`,
            currentStepId: step.id,
            itemsProcessed: completed.size,
            itemsTotal: allSteps.length,
            failures: Array.from(completed.values()).filter((r) => r.status === 'error').length,
            elapsedMs: Date.now() - startTime,
            estimatedTotalMs: null,
            phase: 'running'
          });
          return runWorkflowStep(step, ctx);
        })
      );
      results.push(...parallelResults);
    } else {
      for (const step of ready) {
        ctx.onProgress?.({
          percentage: Math.round((completed.size / allSteps.length) * 100),
          currentStep: step.label ?? `${step.screwName}.${step.methodName}`,
          currentStepId: step.id,
          itemsProcessed: completed.size,
          itemsTotal: allSteps.length,
          failures: Array.from(completed.values()).filter((r) => r.status === 'error').length,
          elapsedMs: Date.now() - startTime,
          estimatedTotalMs: null,
          phase: 'running'
        });

        const result = await runWorkflowStep(step, ctx);
        results.push(result);

        if (result.status === 'error' && result.error?.type === 'blocking') {
          hasBlockingFailure = true;
          break;
        }
      }
    }

    for (const result of results) {
      completed.set(result.id, result);
      await config.onStepComplete?.(result, Array.from(completed.values()));
    }

    if (hasBlockingFailure) break;
  }

  const steps = Array.from(completed.values());
  const failed = steps.filter((s) => s.status === 'error').length;

  ctx.onProgress?.({
    percentage: 100,
    currentStep: null,
    currentStepId: null,
    itemsProcessed: steps.length,
    itemsTotal: allSteps.length,
    failures: failed,
    elapsedMs: Date.now() - startTime,
    estimatedTotalMs: null,
    phase: failed === 0 ? 'completed' : hasBlockingFailure ? 'failed' : 'completed'
  });

  return {
    steps,
    status: failed === 0 ? 'completed' : hasBlockingFailure ? 'failed' : 'partial'
  };
};
