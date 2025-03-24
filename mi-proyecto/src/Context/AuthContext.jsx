// src/Context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, getUserData } from '../api'; // Importamos las funciones de api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5080";
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(""); // Estado para el avatar

  // Verificar la autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserData(); // Usamos la función de api.js
        setUser(userData);
        setIsAuthenticated(true);

        // Cargar el avatar desde la base de datos
        if (userData.avatar) {
          setAvatar(`${API_URL}/uploads/avatars/${userData.avatar}`);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setAvatar("");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const loginUser = async (credentials, onSuccess) => {
    try {
      console.log('📤 Intentando login con:', credentials);
      const data = await login(credentials.email, credentials.password); // Usamos la función de api.js

      localStorage.setItem("token", data.token);
      console.log('✅ Token guardado:', data.token);

      // Obtener datos del usuario después de iniciar sesión
      const userData = await getUserData();
      console.log('✅ Datos del usuario obtenidos:', userData);

      // Actualizar el estado del usuario y el avatar
      setUser(userData);
      setIsAuthenticated(true);

      if (userData.avatar) {
        setAvatar(`${API_URL}/uploads/avatars/${userData.avatar}`);
      }

      // Llamar a la función de redirección si existe
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error en proceso de login:", error);
      throw error; // Re-lanzar el error para que Login.jsx lo maneje
    }
  };

  // Función para cerrar sesión
  const logout = (onSuccess) => {
    console.log('🔒 Cerrando sesión...');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setAvatar(""); // Limpiar el avatar al cerrar sesión

    // Llamar a la función de redirección si existe
    if (onSuccess) onSuccess();
  };

  // Función para actualizar el usuario
  const updateUser = (updatedUser) => {
    console.log('🔄 Actualizando usuario en el contexto:', updatedUser);
    setUser(updatedUser);
    // Actualizar el avatar si está presente en los datos del usuario
    if (updatedUser.avatar) {
      setAvatar(`${API_URL}/uploads/avatars/${updatedUser.avatar}`);
    } else {
      setAvatar(""); // Limpiar el avatar si no hay uno nuevo
    }
  };

  // Función para actualizar los datos del usuario (favoritos y "Ver más tarde")
  const refreshUserData = async () => {
    try {
      const userData = await getUserData();
      setUser(userData);
      if (userData.avatar) {
        setAvatar(`${API_URL}/uploads/avatars/${userData.avatar}`);
      }
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      logout(); // Si hay un error (por ejemplo, token inválido), cerrar sesión
    }
  };

  // Valor del contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    avatar,
    login: loginUser, // Renombramos para evitar conflictos con la importación
    logout,
    setUser,
    setIsAuthenticated,
    updateUser,
    refreshUserData, // Añadimos la función para actualizar los datos del usuario
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};