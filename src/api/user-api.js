import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//GET
export const apiGetUserByUsername = (username) => {
    return axios.get(`${API_BASE_URL}/users/${username}`);
}

//POST
export const apiCreateUser = (userData) => {
    return axios.post(`${API_BASE_URL}/users`, userData);
}