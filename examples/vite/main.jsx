import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider, createFetchAdapter } from 'reactscrew';
import App from './App';
import { userScrew } from './screws/user';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

createRoot(document.getElementById('root')).render(
  <DriverProvider
    apiInstance={api}
    screws={{ user: userScrew }}
    clientOptions={{ persist: { version: 'vite-v1' } }}
  >
    <App />
  </DriverProvider>
);
