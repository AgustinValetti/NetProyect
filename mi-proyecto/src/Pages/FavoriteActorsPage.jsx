// src/Pages/FavoriteActorsPage.jsx
import React from 'react';
import { useAuth } from '../Context/AuthContext';

const FavoriteActorsPage = () => {
  const { user, authRequest } = useAuth();

  const removeFavorite = async (actorId) => {
    try {
      await authRequest(`/api/favorites/actors/${actorId}`, 'DELETE');
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="favorite-actors-page">
      <h1>Mis Actores Favoritos</h1>
      
      <div className="actors-grid">
        {user?.favoriteActors?.map(actor => (
          <div key={actor.tmdbId} className="actor-card">
            <img 
              src={actor.profilePath 
                ? `https://image.tmdb.org/t/p/w300${actor.profilePath}`
                : '/placeholder-actor.jpg'}
              alt={actor.name}
            />
            <h3>{actor.name}</h3>
            <button 
              onClick={() => removeFavorite(actor.tmdbId)}
              className="remove-btn"
            >
              Quitar de favoritos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteActorsPage;