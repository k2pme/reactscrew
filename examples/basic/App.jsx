import React from 'react';
import { useScrew } from '../../src/hooks/useScrew';

const App = () => {
  const { isLoading, data, error, refetch, executeMethod } = useScrew('user');

  const handleCreateUser = async () => {
    try {
      await executeMethod('create', {
        name: 'John Doe',
        email: 'john@example.com'
      });
    } catch (requestError) {
      console.error(requestError);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>User List</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={refetch}>Refresh</button>
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
};

export default App;
