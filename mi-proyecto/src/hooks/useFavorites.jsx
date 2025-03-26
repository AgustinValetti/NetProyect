// src/hooks/useFavorites.js
import { useAuth } from '../Context/AuthContext';

export const useFavorites = () => {
  const { authRequest } = useAuth();

  const addToFavorites = async (item, type) => {
    try {
      const endpoint = type === 'actor' 
        ? '/api/favorites/actors' 
        : '/api/favorites/watchlater';
      
      await authRequest(endpoint, 'POST', {
        itemId: item.id,
        type,
        title: item.label // Asegúrate que tu backend acepte estos campos
      });
      
      alert(`${item.label} agregado a ${type === 'actor' ? 'favoritos' : 'tu lista'}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar');
    }
  };

  return { addToFavorites };
};