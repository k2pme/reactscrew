import { createFetchAdapter } from '../../../src/transport/adapters';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

export default api;
