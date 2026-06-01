export const usersScrew = {
  name: 'users',
  methods: {
    listUsers: {
      type: 'query',
      route: '/users',
      httpMethod: 'GET'
    },
    createUser: {
      type: 'mutation',
      route: '/users',
      httpMethod: 'POST'
    }
  }
};

export const postsScrew = {
  name: 'posts',
  methods: {
    listPosts: {
      type: 'query',
      route: '/posts',
      httpMethod: 'GET'
    }
  }
};
