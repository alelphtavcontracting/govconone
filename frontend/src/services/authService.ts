import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Private implementation
class _AuthService {
  private _token: string | null = null;

  setToken = (token: string | null) => {
    this._token = token;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }

  getToken = (): string | null => {
    return this._token || localStorage.getItem('token');
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

// Create a single instance
const authService = new _AuthService();

// Set initial token if it exists in localStorage
const token = localStorage.getItem('token');
if (token) {
  // Set the token in the axios headers
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // Also set it in the instance
  (authService as any)._token = token;
}

export default authService;
export { authService };
