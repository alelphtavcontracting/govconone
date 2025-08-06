import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class AuthService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
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

  async googleLogin(token: string) {
    const response = await axios.post(`${API_URL}/auth/google`, {
      token
    });
    return response.data;
  }
}

export const authService = new AuthService();
