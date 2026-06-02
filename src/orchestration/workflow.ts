'use client';

import type { QuerySnapshot, ReactScrewClient } from '../types';
import type {
  BatchStepError,
  ExecutionContext,
  StepResult,
  StepStatus,
  WorkflowCondition,
  WorkflowConditionContext,
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

const buildConditionContext = (
  completed: Map<string, StepResult>,
  client: ReactScrewClient,
  variables?: Record<string, unknown>
): WorkflowConditionContext => ({
  stepResults: Object.fromEntries(completed),
  getScrewData: ((screwName: string, methodName: string) => {
    try {
      const qs = client.getQuerySnapshots?.() as QuerySnapshot[] | undefined;
      if (!qs) return undefined;
      const match = qs.find(
        (q) => q.queryKey[0] === screwName && q.queryKey[1] === methodName
      );
      return match?.state?.data;
    } catch {
      return undefined;
    }
  }) as WorkflowConditionContext['getScrewData'],
  variables,
});

const evaluateCondition = async (
  condition: WorkflowCondition,
  ctx: WorkflowConditionContext
): Promise<boolean> => {
  try {
    return Boolean(await condition(ctx));
  } catch {
    return false;
  }
};

const runWorkflowStep = async (
  step: WorkflowStep,
  ctx: ExecutionContext,
  completed: Map<string, StepResult>,
  variables?: Record<string, unknown>,
  conditionAlreadyPassed?: boolean
): Promise<StepResult> => {
  const startTime = Date.now();

  if (step.condition && !conditionAlreadyPassed) {
    const conditionCtx = buildConditionContext(completed, ctx.client, variables);
    const passed = await evaluateCondition(step.condition, conditionCtx);
    ctx.onStepCondition?.({ stepId: step.id, passed, skipped: !passed });
    if (!passed) {
      const skippedDur = Date.now() - startTime;
      if (step.waitForCondition) {
        return {
          id: step.id,
          label: step.label ?? `${step.screwName}.${step.methodName}`,
          status: 'pending',
          durationMs: skippedDur,
          retries: 0
        };
      }
      return {
        id: step.id,
        label: step.label ?? `${step.screwName}.${step.methodName}`,
        status: 'skipped',
        durationMs: skippedDur,
        retries: 0
      };
    }
  }

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
  let waitingCount = 0;
  const conditionPassed = new Set<string>();

  const variables = config.variables ?? ctx.variables;

  const emitStepCondition = (result: { stepId: string; passed: boolean; skipped: boolean }): void => {
    ctx.onStepCondition?.(result);
    config.onStepCondition?.(result);
  };

  const mergedCtx: ExecutionContext = { ...ctx, onStepCondition: emitStepCondition };

  if (config.condition) {
    let wfWaitingCount = 0;
    const wfConditionCtx = buildConditionContext(completed, mergedCtx.client, variables);
    let wfPassed = await evaluateCondition(config.condition, wfConditionCtx);
    while (!wfPassed) {
      if (config.waitForCondition && wfWaitingCount < 60) {
        wfWaitingCount++;
        await delay(500);
        const retryCtx = buildConditionContext(completed, mergedCtx.client, variables);
        wfPassed = await evaluateCondition(config.condition, retryCtx);
      } else {
        break;
      }
    }
    if (!wfPassed) {
      return { steps: [], status: 'partial' };
    }
  }

  while (completed.size < allSteps.length) {
    const remaining = allSteps.filter((s) => !completed.has(s.id));
    const ready = resolveDependencies(remaining, completed);

    if (ready.length === 0) {
      break;
    }

    const waiters = ready.filter((s) => s.waitForCondition && s.condition && !conditionPassed.has(s.id));
    if (waiters.length > 0 && ready.length === waiters.length) {
      waitingCount++;
      if (waitingCount > 60) break;
      let anyPassed = false;
      for (const ws of waiters) {
        const wcCtx = buildConditionContext(completed, mergedCtx.client, variables);
        const wPassed = await evaluateCondition(ws.condition!, wcCtx);
        mergedCtx.onStepCondition?.({ stepId: ws.id, passed: wPassed, skipped: !wPassed });
        if (wPassed) {
          conditionPassed.add(ws.id);
          anyPassed = true;
        }
      }
      if (anyPassed) {
        waitingCount = 0;
        continue;
      }
      await delay(500);
      continue;
    }

    waitingCount = 0;
    const results: StepResult[] = [];
    let hadPending = false;

    const runStep = async (step: WorkflowStep): Promise<StepResult> => {
      mergedCtx.onProgress?.({
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
      const condPassed = conditionPassed.has(step.id);
      return runWorkflowStep(step, mergedCtx, completed, variables, condPassed);
    };

    const nonWaiting = ready.filter((s) => !(s.waitForCondition && s.condition));
    const parallelSteps = nonWaiting.filter((s) => s.parallel !== false);

    const toExecute = parallelSteps.length > 1 ? parallelSteps : ready;

    if (parallelSteps.length > 1) {
      const parallelResults = await Promise.all(parallelSteps.map(runStep));
      results.push(...parallelResults);
    } else {
      for (const step of toExecute) {
        const result = await runStep(step);
        results.push(result);

        if (result.status === 'pending') {
          hadPending = true;
          break;
        }

        if (result.status === 'error' && result.error?.type === 'blocking') {
          hasBlockingFailure = true;
          break;
        }
      }
    }

    for (const result of results) {
      if (result.status !== 'pending') {
        completed.set(result.id, result);
        await config.onStepComplete?.(result, Array.from(completed.values()));
      }
    }

    if (hadPending) {
      await delay(500);
      continue;
    }

    if (hasBlockingFailure) break;
  }

  const steps = Array.from(completed.values());
  const failed = steps.filter((s) => s.status === 'error').length;
  const pending = steps.filter((s) => s.status === 'pending').length;
  const uncompleted = allSteps.length - steps.length;
  const hasUnfinishedWaits = uncompleted > 0 || waitingCount >= 60;

  mergedCtx.onProgress?.({
    percentage: 100,
    currentStep: null,
    currentStepId: null,
    itemsProcessed: steps.length,
    itemsTotal: allSteps.length,
    failures: failed,
    elapsedMs: Date.now() - startTime,
    estimatedTotalMs: null,
    phase: hasUnfinishedWaits ? 'failed' : failed === 0 ? 'completed' : 'failed'
  });

  const resultStatus = hasUnfinishedWaits ? 'partial' : failed === 0 ? 'completed' : 'failed';

  return {
    steps,
    status: resultStatus
  };
};
