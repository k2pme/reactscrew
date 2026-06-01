import type { ScrewDefinition } from 'reactscrew';

export const userScrew: ScrewDefinition = {
  name: 'user',
  methods: {
    list: {
      type: 'query',
      route: '/users',
      httpMethod: 'GET'
    }
  }
};
