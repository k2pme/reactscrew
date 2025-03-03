import schema from "../schema";

// src/services/screws/user.js
export const userScrew = {
  name: 'user',
  executeOnLaunch: true,
  persistence: true,
  type : 'list',
  methods: {
    // Récupère la liste des utilisateurs
    init: { 
      route: '/users', 
      httpMethod: 'GET',
      returnType: 'list',
      schema : schema.userSchema
      // Vous pouvez ajouter ici des headers spécifiques si besoin, par exemple :
      // headers: { Authorization: 'Bearer token' }
    },
    // Récupère un utilisateur par son ID
    getById: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'GET',
      returnType: 'object',
      schema : schema.userSchema
    },
    // Exemple de mutation avec POST (création d'un utilisateur)
    create: { 
      route: '/users', 
      httpMethod: 'POST',
      returnType: 'object',
      schema : schema.userSchema,
      headers: { 'Content-Type': 'application/json' }
    },
    // Exemple de mise à jour avec PUT
    update: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'PUT',
      returnType: 'object',
      schema : schema.userSchema,
      headers: { 'Content-Type': 'application/json' }
    },
    // Exemple de suppression avec DELETE
    remove: { 
      route: (id) => `/users/${id}`, 
      httpMethod: 'DELETE',
      returnType: 'object',
      schema : null
    },
  },
};
