import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the entire app.
 * Provides: user, token, login, logout, isLoading.
 */
export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(() => localStorage.getItem('finora_token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount — restore user from token
  useEffect(() => {
    const restore = async () => {
      const savedToken = localStorage.getItem('finora_token');
      if (!savedToken) { setIsLoading(false); return; }

      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        // Token invalid or expired — clear storage
        localStorage.removeItem('finora_token');
        localStorage.removeItem('finora_user');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('finora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (info) => {
    const { data } = await authAPI.signup(info);
    localStorage.setItem('finora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('finora_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
