// src/Pages/WatchLaterPage.jsx
import React, { useContext } from 'react';
import './ContentPage.css';
import { useAuth } from '../Context/AuthContext';
import { removeWatchLaterMovie, removeWatchLaterSeries } from '../api';

const WatchLaterPage = () => {
  const { isAuthenticated, user, refreshUserData } = useAuth();

  const removeFromWatchLaterMovies = async (movieId) => {
    try {
      await removeWatchLaterMovie(movieId);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al quitar película de "Ver más tarde":', err);
    }
  };

  const removeFromWatchLaterSeries = async (seriesId) => {
    try {
      await removeWatchLaterSeries(seriesId);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al quitar serie de "Ver más tarde":', err);
    }
  };

  if (!isAuthenticated) {
    return <div className="error">Por favor, inicia sesión para ver tu lista de "Ver más tarde".</div>;
  }

  return (
    <div className="content-page">
      <h1>Lista de "Ver más tarde"</h1>

      {/* Sección de películas */}
      <h2>Películas</h2>
      {user?.watchLaterMovies?.length === 0 ? (
        <p className="no-results">No tienes películas en tu lista de "Ver más tarde".</p>
      ) : (
        <div className="content-grid">
          {user?.watchLaterMovies?.map((movie) => (
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
              <button
                className="remove-button"
                onClick={() => removeFromWatchLaterMovies(movie.id)}
              >
                Eliminar de "Ver más tarde"
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sección de series */}
      <h2>Series</h2>
      {user?.watchLaterSeries?.length === 0 ? (
        <p className="no-results">No tienes series en tu lista de "Ver más tarde".</p>
      ) : (
        <div className="content-grid">
          {user?.watchLaterSeries?.map((series) => (
            <div key={series.id} className="content-card">
              <img
                src={
                  series.poster_path
                    ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
                    : 'https://via.placeholder.com/150'
                }
                alt={series.name}
                className="content-image"
              />
              <h3>{series.name}</h3>
              <p>{series.first_air_date || 'Fecha no disponible'}</p>
              <button
                className="remove-button"
                onClick={() => removeFromWatchLaterSeries(series.id)}
              >
                Eliminar de "Ver más tarde"
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLaterPage;