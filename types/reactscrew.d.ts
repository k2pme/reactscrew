// reactscrew.d.ts
declare module 'reactscrew' {
    import * as React from 'react';
  
    export interface DriverProviderProps {
      apiInstance: any;
      screws: any;
      children: React.ReactNode;
    }
  
    export const DriverProvider: React.FC<DriverProviderProps>;
  
    export function useScrew(screwName: string): any;
  }
  