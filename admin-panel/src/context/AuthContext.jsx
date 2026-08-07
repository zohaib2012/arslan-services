import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

const getUser = () => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUser = (u) => {
  if (u) localStorage.setItem('authUser', JSON.stringify(u));
  else localStorage.removeItem('authUser');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  const init = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      saveUser(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearToken();
        saveUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    setToken(res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    setUser(res.data.user);
    saveUser(res.data.user);
    return res.data;
  };

  const guestLogin = async (fullName) => {
    const res = await api.post('/auth/login/guest', { fullName });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    saveUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('refreshToken');
    saveUser(null);
    disconnectSocket();
    setUser(null);
  };

  const role = user?.role;
  const isAuthenticated = !!user;
  const isCustomer = isAuthenticated && (role === 'CUSTOMER' || role === 'SUPER_ADMIN' || role === 'ADMIN');
  const isWorker = isAuthenticated && role === 'WORKER';
  const isAdmin = isAuthenticated && (role === 'ADMIN' || role === 'SUPER_ADMIN');

  return (
    <AuthContext.Provider
      value={{ user, loading, login, guestLogin, logout, init, isAuthenticated, isCustomer, isWorker, isAdmin, role }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
