export const userScrew = {
  name: 'user',
  executeOnLaunch: true,
  persistence: true,
  methods: {
    init: {
      route: '/users',
      httpMethod: 'GET'
    },
    getById: {
      route: (id) => `/users/${id}`,
      httpMethod: 'GET'
    },
    create: {
      route: '/users',
      httpMethod: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    update: {
      route: (id) => `/users/${id}`,
      httpMethod: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    },
    remove: {
      route: (id) => `/users/${id}`,
      httpMethod: 'DELETE'
    }
  }
};
