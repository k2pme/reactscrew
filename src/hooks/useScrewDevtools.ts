'use client';

import { useContext, useMemo, useSyncExternalStore } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';
import type { ClientMetrics, MutationSnapshot, QuerySnapshot, RequestEvent } from '../types';

export interface ScrewDevtoolsSnapshot {
  queries: QuerySnapshot[];
  mutations: MutationSnapshot[];
  metrics: ClientMetrics;
  events: RequestEvent[];
}

const emptyMetrics: ClientMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  dedupedRequests: 0,
  averageRequestDurationMs: 0
};

const mergeMetrics = (metrics: ClientMetrics[]): ClientMetrics => {
  if (metrics.length === 0) return { ...emptyMetrics };
  if (metrics.length === 1) return metrics[0];
  return {
    cacheHits: metrics.reduce((s, m) => s + m.cacheHits, 0),
    cacheMisses: metrics.reduce((s, m) => s + m.cacheMisses, 0),
    networkRequests: metrics.reduce((s, m) => s + m.networkRequests, 0),
    dedupedRequests: metrics.reduce((s, m) => s + m.dedupedRequests, 0),
    averageRequestDurationMs: Math.round(
      metrics.reduce((s, m) => s + m.averageRequestDurationMs, 0) / metrics.length
    )
  };
};

export const useScrewDevtools = (): ScrewDevtoolsSnapshot => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewDevtools must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const clients = Array.from(context.clients.values());

  useSyncExternalStore(
    (listener) => {
      const unsubs = clients.map((client) => client.subscribeEvents(listener));
      return () => unsubs.forEach((u) => u());
    },
    () => clients.reduce((n, c) => n + c.getEvents().length, 0),
    () => clients.reduce((n, c) => n + c.getEvents().length, 0)
  );

  return useMemo(() => ({
    queries: clients.flatMap((c) => c.getQuerySnapshots()),
    mutations: clients.flatMap((c) => c.getMutationSnapshots()),
    metrics: mergeMetrics(clients.map((c) => c.getMetrics())),
    events: clients.flatMap((c) => c.getEvents())
  }), [clients]);
};
