'use client';

import { useScrewQuery } from '../../../src';

export default function UsersClient() {
  const { data, isLoading } = useScrewQuery('user', 'list');

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
