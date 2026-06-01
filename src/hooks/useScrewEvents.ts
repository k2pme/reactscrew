import { useEffect } from 'react';
import { useScrewClient } from './useScrewClient';
import type { RequestEvent } from '../types';

export const useScrewEvents = (listener: (event: RequestEvent) => void): void => {
  const client = useScrewClient();

  useEffect(() => client.subscribeEvents(listener), [client, listener]);
};
