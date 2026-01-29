// src/api/apiConfig.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiConfig = {
  baseURL: API_BASE_URL,
  
  getAuthHeader() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка сервера');
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        success: false, 
        error: error.message || 'Ошибка соединения с сервером' 
      };
    }
  },
};

export default apiConfig;