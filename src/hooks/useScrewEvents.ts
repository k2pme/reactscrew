'use client';

import { useContext, useEffect } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';
import type { RequestEvent } from '../types';

export const useScrewEvents = (listener: (event: RequestEvent) => void): void => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewEvents must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    for (const client of context.clients.values()) {
      unsubs.push(client.subscribeEvents(listener));
    }
    return () => unsubs.forEach((u) => u());
  }, [context.clients, listener]);
};
