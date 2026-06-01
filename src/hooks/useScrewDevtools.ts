import { useSyncExternalStore } from 'react';
import { useScrewClient } from './useScrewClient';
import type { ClientMetrics, MutationSnapshot, QuerySnapshot, RequestEvent } from '../types';

export interface ScrewDevtoolsSnapshot {
  queries: QuerySnapshot[];
  mutations: MutationSnapshot[];
  metrics: ClientMetrics;
  events: RequestEvent[];
}

export const useScrewDevtools = (): ScrewDevtoolsSnapshot => {
  const client = useScrewClient();

  useSyncExternalStore(
    (listener) => client.subscribeEvents(listener),
    () => client.getEvents().length,
    () => client.getEvents().length
  );

  return {
    queries: client.getQuerySnapshots(),
    mutations: client.getMutationSnapshots(),
    metrics: client.getMetrics(),
    events: client.getEvents()
  };
};
