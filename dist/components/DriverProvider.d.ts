import React from 'react';
import type { DriverProviderProps, ScrewClientContextValue } from '../types';
export declare const DriverContext: React.Context<ScrewClientContextValue | null>;
export declare const DriverProvider: ({ children, apiInstance, screws, clientOptions, dehydratedState }: DriverProviderProps) => React.ReactElement;
