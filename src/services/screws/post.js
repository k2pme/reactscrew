// src/services/screws/post.js
export const postScrew = {
  name: 'post',
  executeOnLaunch: true,
  persistence: false,
  methods: {
    init: { 
      route: '/posts', 
      httpMethod: 'GET'
    },
    getById: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'GET'
    },
    create: { 
      route: '/posts', 
      httpMethod: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    update: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    },
    remove: { 
      route: (id) => `/posts/${id}`, 
      httpMethod: 'DELETE'
    },
  },
};
