'use client';

import React, { createContext, useEffect, useMemo } from 'react';
import { createReactScrewClient } from '../client/ReactScrewClient';
import type { DriverProviderProps, ReactScrewClient, ScrewClientContextValue } from '../types';

export const DriverContext = createContext<ScrewClientContextValue | null>(null);

const buildClientRegistry = (
  defaultClient: ReactScrewClient,
  defaultScrews: Record<string, unknown>,
  backends?: Record<string, { apiInstance: Parameters<typeof createReactScrewClient>[0]; screws: Parameters<typeof createReactScrewClient>[1]; clientOptions?: Parameters<typeof createReactScrewClient>[2]; dehydratedState?: import('../types').DehydratedState }>
): { clients: Map<string, ReactScrewClient>; screwIndex: Map<string, string> } => {
  const clients = new Map<string, ReactScrewClient>();
  const screwIndex = new Map<string, string>();

  clients.set('default', defaultClient);
  for (const screwName of Object.keys(defaultScrews)) {
    if (!screwIndex.has(screwName)) {
      screwIndex.set(screwName, 'default');
    }
  }

  if (!backends) {
    return { clients, screwIndex };
  }

  for (const [id, config] of Object.entries(backends)) {
    const client = createReactScrewClient(config.apiInstance, config.screws, config.clientOptions);
    if (config.dehydratedState) {
      client.hydrate(config.dehydratedState);
    }
    clients.set(id, client);
    for (const screwName of Object.keys(config.screws)) {
      screwIndex.set(screwName, id);
    }
  }

  return { clients, screwIndex };
};

export const DriverProvider = ({
  children,
  apiInstance,
  screws,
  clientOptions,
  dehydratedState,
  backends
}: DriverProviderProps): React.ReactElement => {
  const { client, clients, screwIndex } = useMemo(() => {
    if (backends) {
      const defaultInstance = apiInstance ?? Object.values(backends)[0]?.apiInstance;
      const defaultScrews = screws ?? {};
      const defaultClient = createReactScrewClient(
        defaultInstance,
        defaultScrews,
        clientOptions
      );
      if (dehydratedState) {
        defaultClient.hydrate(dehydratedState);
      }
      return { client: defaultClient, ...buildClientRegistry(defaultClient, defaultScrews, backends) };
    }

    if (!apiInstance || !screws) {
      throw new Error('DriverProvider requires either apiInstance+screws or backends prop.');
    }

    const defaultClient = createReactScrewClient(apiInstance, screws, clientOptions);
    if (dehydratedState) {
      defaultClient.hydrate(dehydratedState);
    }
    return { client: defaultClient, ...buildClientRegistry(defaultClient, screws) };
  }, [apiInstance, backends, clientOptions, dehydratedState, screws]);

  useEffect(() => {
    void client.restorePersistedCache();
  }, [client]);

  useEffect(() => {
    if (!screws) {
      return;
    }

    void Promise.all(
      Object.values(screws)
        .filter((screw) => screw.executeOnLaunch && screw.methods.init)
        .map((screw) => {
          const queryKey = client.getQueryKey(screw.name, 'init');
          const state = client.getQueryState(queryKey);

          if (state.updatedAt !== null && state.status === 'success') {
            return Promise.resolve();
          }

          return client.fetchQuery(screw.name, 'init').catch(() => undefined);
        })
    );
  }, [client, screws]);

  useEffect(() => {
    return () => {
      void client.persistCache();
    };
  }, [client]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const focusHandler = () => {
      void client.handleWindowFocus();
    };
    const onlineHandler = () => {
      void client.handleReconnect();
    };

    window.addEventListener('focus', focusHandler);
    window.addEventListener('online', onlineHandler);

    return () => {
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('online', onlineHandler);
    };
  }, [client]);

  const contextValue: ScrewClientContextValue = useMemo(() => ({
    client,
    clients,
    resolveClient: (screwName: string, backend?: string): ReactScrewClient => {
      if (backend) {
        return clients.get(backend) ?? client;
      }

      const resolvedBackend = screwIndex.get(screwName);
      return resolvedBackend ? (clients.get(resolvedBackend) ?? client) : client;
    }
  }), [client, clients, screwIndex]);

  return <DriverContext.Provider value={contextValue}>{children}</DriverContext.Provider>;
};
