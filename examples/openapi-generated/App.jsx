import React from 'react';
import { useScrewMutation, useScrewQuery } from 'reactscrew';

export default function App() {
  const users = useScrewQuery('users', 'listUsers');
  const createUser = useScrewMutation('users', 'createUser');

  return (
    <div>
      <h1>OpenAPI Generated Example</h1>
      <button
        onClick={() =>
          createUser.mutate({
            name: 'Generated User'
          })
        }
      >
        Create generated user
      </button>
      <pre>{JSON.stringify(users.data, null, 2)}</pre>
    </div>
  );
}
