import {
  createFetchAdapter,
  createReactScrewClient
} from 'reactscrew';
import { userScrew } from '../screws/user';
import UsersClient from './users-client';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

export default async function Page() {
  const client = createReactScrewClient(api, { user: userScrew });
  await client.prefetchQuery('user', 'list');
  const dehydratedState = client.dehydrate();

  return (
    <UsersClient
      apiInstance={api}
      screws={{ user: userScrew }}
      dehydratedState={dehydratedState}
    />
  );
}
