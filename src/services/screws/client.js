// src/services/screws/user.js
export const userScrew = {
  name: 'user',
  executeOnLaunch: true,
  persistence: false,
  methods: {
    // Récupère la liste des utilisateurs
    init: { 
      route: '/users', 
      httpMethod: 'GET',
      // Vous pouvez ajouter ici des headers spécifiques si besoin, par exemple :
      // headers: { Authorization: 'Bearer token' }
    },
    // Récupère un utilisateur par son ID
    getById: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'GET'
    },
    // Exemple de mutation avec POST (création d'un utilisateur)
    create: { 
      route: '/users', 
      httpMethod: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    // Exemple de mise à jour avec PUT
    update: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    },
    // Exemple de suppression avec DELETE
    remove: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'DELETE'
    },
  },
};
