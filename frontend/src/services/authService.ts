import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Private implementation
class _AuthService {
  setToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  }

  register = async (email: string, password: string, name: string) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });
    return response.data;
  }

  googleLogin = async (token: string) => {
    const response = await axios.post(`${API_URL}/auth/google`, {
      token
    });
    return response.data;
  }

  logout = () => {
    this.setToken(null);
    localStorage.removeItem('token');
  }
}

// Create and export a single instance
export const authService = Object.freeze(new _AuthService());

// Also export as default for backward compatibility
export default authService;
