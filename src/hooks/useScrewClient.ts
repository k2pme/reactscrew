'use client';

import { useContext } from 'react';
import { DriverContext } from '../components/DriverProvider';
import { ReactScrewError } from '../errors';

export const useScrewClient = () => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewClient must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  return context.client;
};
