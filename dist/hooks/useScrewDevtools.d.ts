import type { ClientMetrics, MutationSnapshot, QuerySnapshot, RequestEvent } from '../types';
export interface ScrewDevtoolsSnapshot {
    queries: QuerySnapshot[];
    mutations: MutationSnapshot[];
    metrics: ClientMetrics;
    events: RequestEvent[];
}
export declare const useScrewDevtools: () => ScrewDevtoolsSnapshot;
