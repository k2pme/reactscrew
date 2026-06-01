import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider, useScrewQuery, createFetchAdapter } from 'reactscrew';
import { userScrew } from './screws/user';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

const dehydratedState = window.__REACTSCREW_STATE__;

function App() {
  const { data, isLoading } = useScrewQuery('user', 'list');

  if (isLoading) {
    return <p>Hydrating...</p>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

createRoot(document.getElementById('root')).render(
  <DriverProvider
    apiInstance={api}
    screws={{ user: userScrew }}
    dehydratedState={dehydratedState}
    clientOptions={{ persist: { version: 'hydration-v1' } }}
  >
    <App />
  </DriverProvider>
);
