import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const moviesAPI = {
  getPopularMovies: async (page = 1) => {
    const response = await api.get('/movies/popular', { params: { page } });
    return response.data;
  },

  getNewMovies: async (page = 1) => {
    const response = await api.get('/movies/new', { params: { page } });
    return response.data;
  },

  getTopMovies: async (page = 1) => {
    const response = await api.get('/movies/top', { params: { page } });
    return response.data;
  },

  searchMovies: async (query, page = 1) => {
    const response = await api.get('/movies/search', { 
      params: { q: query, page } 
    });
    return response.data;
  }
};