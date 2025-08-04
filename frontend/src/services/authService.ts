import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class AuthService {
  setToken(token: string | null) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  }

  async register(email: string, password: string, name: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });
    return response.data;
  }

  async googleLogin(idToken: string) {
    const response = await axios.post(`${API_URL}/auth/google`, {
      token: idToken
    });
    return response.data;
  }

  async verifyToken() {
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data;
  }

  async getProfile() {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  }
}

export const authService = new AuthService();
