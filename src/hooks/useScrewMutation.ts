'use client';

import { useContext, useMemo, useSyncExternalStore } from 'react';
import { ReactScrewError } from '../errors';
import { DriverContext } from '../components/DriverProvider';
import type { MutationState, UseScrewMutationOptions, UseScrewMutationResult } from '../types';

export const useScrewMutation = <TData = unknown, TVariables = unknown>(
  screwName: string,
  methodName: string,
  options?: UseScrewMutationOptions<TData, TVariables>
): UseScrewMutationResult<TData, TVariables> => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewMutation must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const client = context.resolveClient(screwName, options?.backend);
  const mutationKey = useMemo(() => `${screwName}:${methodName}`, [methodName, screwName]);
  const state = useSyncExternalStore<MutationState<TData>>(
    (listener) => client.subscribeMutation(mutationKey, listener),
    () => client.getMutationState(mutationKey) as MutationState<TData>,
    () => client.getMutationState(mutationKey) as MutationState<TData>
  );

  const mutateAsync = (variables?: TVariables, ...args: unknown[]) =>
    client.executeMutation<TData, TVariables>(screwName, methodName, variables, args, options);

  return {
    ...state,
    mutateAsync,
    mutate: mutateAsync,
    reset: () => client.resetMutationState(mutationKey)
  };
};
