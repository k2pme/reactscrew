'use client';

import React, { createContext, useEffect, useMemo } from 'react';
import { createReactScrewClient } from '../client/ReactScrewClient';
import type { DriverProviderProps, ScrewClientContextValue } from '../types';

export const DriverContext = createContext<ScrewClientContextValue | null>(null);

export const DriverProvider = ({
  children,
  apiInstance,
  screws,
  clientOptions,
  dehydratedState
}: DriverProviderProps): React.ReactElement => {
  const client = useMemo(
    () => {
      const nextClient = createReactScrewClient(apiInstance, screws, clientOptions);
      if (dehydratedState) {
        nextClient.hydrate(dehydratedState);
      }
      return nextClient;
    },
    [apiInstance, clientOptions, dehydratedState, screws]
  );

  useEffect(() => {
    void client.restorePersistedCache();
  }, [client]);

  useEffect(() => {
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

  return <DriverContext.Provider value={{ client }}>{children}</DriverContext.Provider>;
};
