// frontend/src/Pages/FavoriteActorsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './ContentPage.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const FavoriteActorsPage = () => {
  const { user, isAuthenticated, authRequest, updateUser } = useAuth();
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="content-page">
        <h1>Actores Favoritos</h1>
        <div className="error">Por favor, inicia sesión para ver tus actores favoritos.</div>
      </div>
    );
  }

  const favoriteActors = user?.favoriteActors || [];

  const fetchActorMovies = async (actorId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${TMDB_API_URL}/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=es-ES`
      );
      if (!response.ok) {
        throw new Error('Error al obtener las películas del actor');
      }
      const data = await response.json();
      setActorMovies(data.cast);
      setLoading(false);
    } catch (err) {
      setMessage(err.message || 'Error al obtener las películas');
      setTimeout(() => setMessage(null), 3000);
      setLoading(false);
    }
  };

  const handleActorClick = (actor) => {
    setSelectedActor(actor);
    fetchActorMovies(actor.id);
  };

  const removeFromFavorites = async (actorId) => {
    try {
      await authRequest(`/api/favorites/actors/${actorId}`, 'DELETE');
      const updatedFavorites = await authRequest('/api/favorites/actors', 'GET');
      updateUser({ ...user, favoriteActors: updatedFavorites.data });
      setMessage('Actor eliminado de favoritos');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message || 'Error al quitar el actor');
      setTimeout(() => setMessage(null), 3000);
      console.error('Error al quitar actor de favoritos:', err);
    }
  };

  return (
    <div className="content-page">
      {selectedActor ? (
        <>
          <button onClick={() => setSelectedActor(null)} className="back-button">
            Volver a la lista de actores favoritos
          </button>
          <h1>Películas de {selectedActor.name}</h1>
          {loading ? (
            <div className="loading">Cargando películas...</div>
          ) : (
            <div className="content-grid">
              {actorMovies.map((movie) => (
                <div key={movie.id} className="content-card">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://via.placeholder.com/150'
                    }
                    alt={movie.title}
                    className="content-image"
                  />
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date || 'Fecha no disponible'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h1>Actores Favoritos</h1>
          {message && <div className="message">{message}</div>}
          {favoriteActors.length === 0 ? (
            <p className="no-results">No tienes actores en tu lista de favoritos.</p>
          ) : (
            <div className="content-grid">
              {favoriteActors.map((actor) => (
                <div
                  key={actor.id}
                  className="content-card favorited"
                  onClick={() => handleActorClick(actor)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                        : 'https://via.placeholder.com/150'
                    }
                    alt={actor.name}
                    className="content-image"
                  />
                  <h3>{actor.name}</h3>
                  <p>{actor.known_for_department || 'Departamento no disponible'}</p>
                  <button
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(actor.id);
                    }}
                  >
                    Quitar de Favoritos
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoriteActorsPage;