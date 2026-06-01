import React from 'react';
import { useScrewQuery } from 'reactscrew';

export default function App() {
  const { data, error, isLoading, refetch } = useScrewQuery('session', 'me');

  return (
    <div>
      <h1>Authenticated Session</h1>
      {isLoading && <p>Loading session...</p>}
      {error && <p>{error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => refetch()}>Refetch session</button>
    </div>
  );
}
