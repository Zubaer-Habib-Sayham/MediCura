import React, { createContext, useEffect, useState, useCallback } from 'react';
import api from './api';

export const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUser: () => {},
  logoutLocally: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from backend
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/me'); // backend returns user or null
      setUser(res.data.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Clears user state locally (used in Logout)
  const logoutLocally = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, logoutLocally }}>
      {children}
    </AuthContext.Provider>
  );
}
