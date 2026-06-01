import type { ApiInstance } from '../types';
export interface AxiosLikeInstance {
    request: (config: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        data?: unknown;
        signal?: AbortSignal;
    }) => Promise<{
        data: unknown;
        status: number;
        headers: Record<string, unknown>;
    }>;
}
export declare const createFetchAdapter: (baseUrl?: string, defaultHeaders?: Record<string, string>) => ApiInstance;
export declare const createAxiosAdapter: (instance: AxiosLikeInstance) => ApiInstance;
