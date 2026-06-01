import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import api from './services/api';
import { DriverProvider } from 'reactscrew';
import { postScrew } from './screws/post';
import { userScrew } from './screws/user';

const screws = {
  user: userScrew,
  post: postScrew
};

const container = document.getElementById('root');

if (!container) {
  throw new Error('Missing root container.');
}

createRoot(container).render(
  <DriverProvider apiInstance={api} screws={screws}>
    <App />
  </DriverProvider>
);
