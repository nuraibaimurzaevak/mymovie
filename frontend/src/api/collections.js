// 📁 frontend/src/api/collections.js
import api from './axiosConfig';

export const collectionsAPI = {
  getMyCollections: async () => {
    const response = await api.get('/collections/my');
    return response.data;
  },

  getPopularCollections: async () => {
    const response = await api.get('/collections/popular');
    return response.data;
  },

  getCollectionById: async (id) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },

  createCollection: async (collectionData) => {
    const response = await api.post('/collections', collectionData);
    return response.data;
  },

  updateCollection: async (id, collectionData) => {
    const response = await api.put(`/collections/${id}`, collectionData);
    return response.data;
  },

  deleteCollection: async (id) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  }
};