import axios from 'axios';

import store from '../store';
import { isTokenValid } from '../utils/auth';

axios.defaults.timeout = 30000;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;

axios.interceptors.request.use(
  config => {
    if (!isTokenValid()) {
      store.dispatch('signOut');
      return false;
    }
    return config;
  },
  error => Promise.reject(error),
);

axios.interceptors.response.use(
  response => response,
  error => Promise.reject(error.response || error.request || error.message),
);
