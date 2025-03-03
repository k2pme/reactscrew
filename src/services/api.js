// src/services/api.js (dans votre projet)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000
});

export default api;
