import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider, ToastProvider } from 'reactscrew';
import App from './App';
import { stressSuiteApi, stressSuiteScrews } from './suiteApi';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DriverProvider
      apiInstance={stressSuiteApi}
      screws={stressSuiteScrews}
      clientOptions={{ persist: { version: 'stress-suite-v1' } }}
    >
      <ToastProvider position="top-right" duration={3600}>
        <App />
      </ToastProvider>
    </DriverProvider>
  </React.StrictMode>
);
