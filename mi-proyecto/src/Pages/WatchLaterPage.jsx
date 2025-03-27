// frontend/src/Pages/WatchLaterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Modal from '../Components/Modal/Modal';
import './ContentPage.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const WatchLaterPage = () => {
  const { user, isAuthenticated, authRequest, updateUser } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="content-page">
        <h1>Ver Más Tarde</h1>
        <div className="error">Por favor, inicia sesión para ver tu lista de "Ver más tarde".</div>
      </div>
    );
  }

  const watchLaterItems = user?.watchLaterMovies || [];

  const fetchItemDetails = async (itemId, type) => {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${TMDB_API_URL}/${endpoint}/${itemId}?api_key=${TMDB_API_KEY}&language=es-ES`
      );
      if (!response.ok) {
        throw new Error('Error al obtener los detalles');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error al obtener los detalles:', err);
      return null;
    }
  };

  const fetchTrailer = async (itemId, type) => {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${TMDB_API_URL}/${endpoint}/${itemId}/videos?api_key=${TMDB_API_KEY}&language=es-ES`
      );
      if (!response.ok) {
        throw new Error('Error al obtener el tráiler');
      }
      const data = await response.json();
      const trailer = data.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (err) {
      console.error('Error al obtener el tráiler:', err);
      return null;
    }
  };

  const handleItemClick = async (item) => {
    // Determinar si es película o serie
    // Como no tenemos una propiedad confiable para distinguir, haremos una solicitud para ambos tipos
    let type = 'movie';
    let fullItem = await fetchItemDetails(item.id, 'movie');
    if (!fullItem) {
      type = 'tv';
      fullItem = await fetchItemDetails(item.id, 'tv');
    }

    if (!fullItem) {
      setMessage('No se pudieron cargar los detalles del elemento');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSelectedMovie(fullItem);
    const trailer = await fetchTrailer(item.id, type);
    setTrailerUrl(trailer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
    setTrailerUrl(null);
  };

  const removeFromWatchLater = async (itemId) => {
    try {
      await authRequest(`/api/watchlater/${itemId}`, 'DELETE');
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
      setMessage('Elemento eliminado de "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message || 'Error al quitar el elemento');
      setTimeout(() => setMessage(null), 3000);
      console.error('Error al quitar elemento de "Ver más tarde":', err);
    }
  };

  return (
    <div className="content-page">
      <h1>Ver Más Tarde</h1>
      {message && <div className="message">{message}</div>}
      {watchLaterItems.length === 0 ? (
        <p className="no-results">No tienes películas ni series en tu lista de "Ver más tarde".</p>
      ) : (
        <div className="content-grid">
          {watchLaterItems.map((item) => (
            <div
              key={item.id}
              className="content-card favorited"
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://via.placeholder.com/150'
                }
                alt={item.title}
                className="content-image"
              />
              <h3>{item.title}</h3>
              <p>{item.release_date || 'Fecha no disponible'}</p>
              <button
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchLater(item.id);
                }}
              >
                Quitar de "Ver más tarde"
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        selectedMovie={selectedMovie}
        trailerUrl={trailerUrl}
      />
    </div>
  );
};

export default WatchLaterPage;