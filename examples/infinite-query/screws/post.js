export const postScrew = {
  name: 'post',
  methods: {
    list: {
      type: 'query',
      route: (page = 1) => `/posts?_limit=5&_page=${page}`,
      httpMethod: 'GET'
    }
  }
};
