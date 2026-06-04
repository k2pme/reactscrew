import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider, ToastProvider } from 'reactscrew';
import App from './App';
import { tradingApi, tradingScrews } from './marketApi';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DriverProvider
      apiInstance={tradingApi}
      screws={tradingScrews}
      clientOptions={{ persist: { version: 'trading-demo-v1' } }}
    >
      <ToastProvider position="top-right" duration={4200}>
        <App />
      </ToastProvider>
    </DriverProvider>
  </React.StrictMode>
);
