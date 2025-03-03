// src/services/screws/post.js
export const postScrew = {
  name: 'post',
  executeOnLaunch: true,
  persistence: false,
  type : 'list',
  methods: {
    init: { 
      route: '/posts', 
      httpMethod: 'GET',
      returnType: 'list'
    },
    getById: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'GET',
      returnType: 'object'
    },
    create: { 
      route: '/posts', 
      httpMethod: 'POST',
      returnType: 'object',
      headers: { 'Content-Type': 'application/json' }
    },
    update: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'PUT',
      returnType: 'object',
      headers: { 'Content-Type': 'application/json' }
    },
    remove: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'DELETE',
      returnType: 'object',

    },
  },
};
