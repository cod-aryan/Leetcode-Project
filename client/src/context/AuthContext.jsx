import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example: Fetch user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get('/users/get-user');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for clean usage in components
export const useAuth = () => useContext(AuthContext);