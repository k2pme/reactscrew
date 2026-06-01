import { createFetchAdapter, withAuthStrategy } from 'reactscrew';

let accessToken = 'initial-token';

export const api = withAuthStrategy(createFetchAdapter('https://api.example.com'), {
  getAccessToken: async () => accessToken,
  refreshAccessToken: async () => {
    accessToken = 'refreshed-token';
    return accessToken;
  },
  onAuthFailure: async (error) => {
    console.error('Authentication failed', error);
  }
});
