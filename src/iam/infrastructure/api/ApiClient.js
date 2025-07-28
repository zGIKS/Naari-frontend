import axios from 'axios';
import { API_CONFIG } from '../../../shared/config/ApiConfig.js';

export class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('naari_token');
        }
        return Promise.reject(error);
      }
    );
  }

  async post(url, data) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async get(url) {
    const response = await this.client.get(url);
    return response.data;
  }

  async put(url, data) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete(url) {
    const response = await this.client.delete(url);
    return response.data;
  }

  setAuthToken(token) {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.Authorization;
  }
}