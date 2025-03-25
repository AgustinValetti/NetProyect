import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5080";
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");

  // Función para hacer peticiones autenticadas
  const authRequest = async (url, method = 'GET', data = null) => {
    const token = localStorage.getItem('token');
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      data
    };
    return axios(config);
  };

  // Función para login directa en el contexto
  const loginUser = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
      if (user.avatar) {
        setAvatar(`${API_URL}/uploads/avatars/${user.avatar}`);
      }
      
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const response = await authRequest('/api/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchUserData();
        setUser(userData);
        setIsAuthenticated(true);
        if (userData.avatar) {
          setAvatar(`${API_URL}/uploads/avatars/${userData.avatar}`);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setAvatar("");
  };

  // Valor del contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    avatar,
    login: loginUser, // Usamos la función interna
    logout,
    fetchUserData,
    authRequest, // Para otras peticiones autenticadas
    updateUser: (updatedUser) => {
      setUser(updatedUser);
      if (updatedUser.avatar) {
        setAvatar(`${API_URL}/uploads/avatars/${updatedUser.avatar}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};