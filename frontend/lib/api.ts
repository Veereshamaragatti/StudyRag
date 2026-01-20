import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getGoogleAuthUrl: () => {
    return `${API_URL}/auth/google`;
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file: File, name?: string, tags?: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (tags) formData.append('tags', tags.join(','));

    const response = await api.post('/api/docs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/api/docs/list');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/api/docs/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/docs/${id}`);
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  ask: async (question: string, chatId?: string, image?: File) => {
    const formData = new FormData();
    formData.append('question', question);
    if (chatId) formData.append('chatId', chatId);
    if (image) formData.append('image', image);

    const response = await api.post('/api/chat/ask', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/chat/history');
    return response.data;
  },

  getChat: async (id: string) => {
    const response = await api.get(`/api/chat/${id}`);
    return response.data;
  },

  deleteChat: async (id: string) => {
    const response = await api.delete(`/api/chat/${id}`);
    return response.data;
  },
};

export default api;
