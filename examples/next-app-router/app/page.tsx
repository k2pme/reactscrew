import { DriverProvider, createFetchAdapter } from '../../../src';
import { userScrew } from '../screws/user';
import UsersClient from './users-client';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

export default function Page() {
  return (
    <DriverProvider
      apiInstance={api}
      screws={{ user: userScrew }}
      clientOptions={{ persist: { version: 'next-v1' } }}
    >
      <UsersClient />
    </DriverProvider>
  );
}
