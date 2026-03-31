import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Axios automatically uses X-XSRF-TOKEN cookie provided by Laravel.

// Unified response handling
window.axios.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);
