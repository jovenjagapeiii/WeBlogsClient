// src/api.js
import axios from 'axios';

console.log('Vite is currently reading Backend URL as:', import.meta.env.VITE_BACKEND_URL);
const api = axios.create({
  // 🌸 Automatically ensures all requests hit your /api pipelines cleanly
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`, 
});

// Automatically inject global tokens into headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    // Standardized to capital Authorization to keep backend micro-services happy
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;