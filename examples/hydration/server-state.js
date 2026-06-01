import { createReactScrewClient } from '../../dist/client/ReactScrewClient.js';
import { createFetchAdapter } from '../../dist/transport/adapters.js';
import { userScrew } from './screws/user.js';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

export const buildDehydratedState = async () => {
  const client = createReactScrewClient(api, {
    user: userScrew
  });

  await client.fetchQuery('user', 'list');

  return client.dehydrate();
};
