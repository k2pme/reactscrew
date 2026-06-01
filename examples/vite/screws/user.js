export const userScrew = {
  name: 'user',
  methods: {
    list: {
      type: 'query',
      route: '/users',
      httpMethod: 'GET'
    },
    create: {
      type: 'mutation',
      route: '/users',
      httpMethod: 'POST',
      invalidateQueries: [{ screwName: 'user', methodName: 'list' }]
    }
  }
};
