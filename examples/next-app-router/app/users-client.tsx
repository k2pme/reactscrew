'use client';

import { DriverProvider, useScrewQuery } from 'reactscrew';
import type { DehydratedState, ScrewsMap } from 'reactscrew';
import type { ApiInstance } from 'reactscrew';

export default function UsersClient({
  apiInstance,
  screws,
  dehydratedState
}: {
  apiInstance: ApiInstance;
  screws: ScrewsMap;
  dehydratedState?: DehydratedState;
}) {
  return (
    <DriverProvider
      apiInstance={apiInstance}
      screws={screws}
      dehydratedState={dehydratedState}
    >
      <UsersList />
    </DriverProvider>
  );
}

function UsersList() {
  const { data, isLoading } = useScrewQuery('user', 'list');

  if (isLoading) return <p>Loading...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
