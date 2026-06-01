import React from 'react';
import { useScrewDevtools } from '../../src/hooks/useScrewDevtools';
import { useScrewEvents } from '../../src/hooks/useScrewEvents';
import { useScrewMutation } from '../../src/hooks/useScrewMutation';
import { useScrewQuery } from '../../src/hooks/useScrewQuery';

export default function App() {
  const { data, isLoading, refetch } = useScrewQuery('user', 'list', {
    staleTime: 60_000
  });
  const createUser = useScrewMutation('user', 'create', {
    optimisticUpdate: ({ client, variables }) => {
      const previous = client.getQueryData(['user', 'list']);
      client.setQueryData(['user', 'list'], (current) => [...(current ?? []), variables]);

      return {
        rollback: () => {
          client.setQueryData(['user', 'list'], previous ?? []);
        }
      };
    }
  });
  const devtools = useScrewDevtools();

  useScrewEvents((event) => {
    console.log('ReactScrew event', event.type, event.screwName, event.methodName);
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Vite Query + Mutation Example</h1>
      <button onClick={() => refetch()}>Refetch</button>
      <button
        onClick={() =>
          createUser.mutate({
            id: Date.now(),
            name: 'Optimistic User'
          })
        }
      >
        Create user
      </button>
      <h2>Query data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <h2>Metrics</h2>
      <pre>{JSON.stringify(devtools.metrics, null, 2)}</pre>
      <h2>Events</h2>
      <pre>{JSON.stringify(devtools.events.slice(-5), null, 2)}</pre>
    </div>
  );
}
