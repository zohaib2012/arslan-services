import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      api.get('/dashboard/stats')
        .then(() => setUser({ role: 'ADMIN' }))
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('adminToken');
            setToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const baseUrl = 'http://187.127.218.111';
    const res = await axios.post(`${baseUrl}/api/auth/login`, { identifier: email, password });
    localStorage.setItem('adminToken', res.data.accessToken);
    setToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
