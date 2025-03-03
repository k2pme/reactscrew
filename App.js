// src/App.jsx
import React from 'react';

const App = () => {

  const { isLoading, data, error, refetch, executeMethod } = useScrew('user');

  console.log(data)

  const handleCreateUser = async () => {

    try {

      const newUser = { name: 'John Doe', email: 'john@example.com' };
      const response = await executeMethod('create', newUser);
      console.log('Utilisateur créé :', response);

    } catch (err) {

      console.error(err);
      
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <div>
      <h1>Liste des Utilisateurs</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={refetch}>Rafraîchir</button>
      <button onClick={handleCreateUser}>Créer un utilisateur</button>
    </div>
  );
};

export default App;
