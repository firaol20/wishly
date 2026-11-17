import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
export const BASE_URL = `${API_ORIGIN}/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = data;
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { name?: string; bio?: string; telegramUsername?: string | null }) => api.patch('/users/me', data),
  exportData: () => api.get('/users/me/export', { responseType: 'blob' }),
  deleteAccount: () => api.delete('/users/me'),
};

// Wishlists
export const wishlistsApi = {
  list: () => api.get('/wishlists'),
  create: (data: { title: string; description?: string; coverImageUrl?: string; visibility?: string }) =>
    api.post('/wishlists', data),
  get: (id: string) => api.get(`/wishlists/${id}`),
  update: (id: string, data: Partial<{ title: string; description: string; coverImageUrl: string; visibility: string }>) =>
    api.patch(`/wishlists/${id}`, data),
  delete: (id: string) => api.delete(`/wishlists/${id}`),
  reorder: (items: { id: string; sortOrder: number }[]) => api.patch('/wishlists/reorder', { items }),
  getShared: (token: string) => api.get(`/wishlists/share/${token}`),
  getPublic: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/wishlists/public', { params }),
  getPublicById: (id: string) => api.get(`/wishlists/public/${id}`),
};

// Wish Items
export const itemsApi = {
  list: (wishlistId: string, params?: Record<string, string>) =>
    api.get(`/wishlists/${wishlistId}/items`, { params }),
  create: (wishlistId: string, data: object) => api.post(`/wishlists/${wishlistId}/items`, data),
  get: (id: string) => api.get(`/items/${id}`),
  update: (id: string, data: object) => api.patch(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/items/${id}/status`, { status }),
  addMemory: (id: string, data: { memoryNote: string; memoryImageUrl?: string }) =>
    api.post(`/items/${id}/memory`, data),
  reorder: (items: { id: string; sortOrder: number }[]) => api.patch('/items/reorder', { items }),
  mine: (params?: { status?: string; category?: string; search?: string }) =>
    api.get('/items/mine', { params }),
  toggleVisibility: (id: string, isPublic: boolean) =>
    api.patch(`/items/${id}/visibility`, { isPublic }),
  getPublicDreams: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/items/public/dreams', { params }),
};

// AI
export const aiApi = {
  suggest: (title: string) => api.post('/ai/suggest', { title }),
};

// Stats
export const statsApi = {
  getMyStats: () => api.get('/stats/me'),
};

// Push
export const pushApi = {
  getVapidKey: () => api.get('/push/vapid-key'),
  subscribe: (subscription: PushSubscriptionJSON) => api.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  }),
  unsubscribe: (endpoint: string) => api.delete('/push/unsubscribe', { data: { endpoint } }),
};

// Upload
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
