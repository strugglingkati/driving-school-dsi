import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common.Authorization = `Bearer ${token}`;
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete API.defaults.headers.common.Authorization;
        delete axios.defaults.headers.common.Authorization;
    }
};

export const login = (credentials) => API.post('/auth/login', credentials);
export const logout = () => API.post('/auth/logout');
export const verifyToken = () => API.get('/auth/verify');
export const registerCandidate = (data) => API.post('/candidates/add', data);
export default API;