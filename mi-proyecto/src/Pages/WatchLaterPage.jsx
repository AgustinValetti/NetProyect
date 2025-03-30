// frontend/src/Pages/WatchLaterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Modal from '../Components/Modal/Modal';
import './ContentPage.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Mapeo de nombres de plataformas a sus URLs principales
const platformUrls = {
  'Netflix': 'https://www.netflix.com',
  'Disney Plus': 'https://www.disneyplus.com',
  'HBO Max': 'https://www.max.com', // HBO Max ahora es Max
  'Amazon Prime Video': 'https://www.primevideo.com',
  'Paramount Plus': 'https://www.paramountplus.com',
  'Apple TV Plus': 'https://www.apple.com/apple-tv-plus/',
  'Star Plus': 'https://www.starplus.com',
  'Claro video': 'https://www.clarovideo.com',
  'Movistar Plus+': 'https://www.movistarplus.es',
  'Globoplay': 'https://globoplay.globo.com',
  'Lionsgate Plus': 'https://www.lionsgateplus.com',
};

const WatchLaterPage = () => {
  const { user, isAuthenticated, authRequest, updateUser } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [watchProviders, setWatchProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="content-page">
        <h1>Ver Más Tarde</h1>
        <div className="error">Por favor, inicia sesión para ver tu lista de "Ver más tarde".</div>
      </div>
    );
  }

  const watchLaterItems = user?.watchLaterMovies || [];

  const fetchTrailer = async (itemId, type) => {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${TMDB_API_URL}/${endpoint}/${itemId}/videos?api_key=${TMDB_API_KEY}&language=es-MX`
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

  const fetchWatchProviders = async (itemId, type) => {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${TMDB_API_URL}/${endpoint}/${itemId}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener los proveedores de TMDB');
      }
      const data = await response.json();
      console.log('Respuesta de TMDB /watch/providers:', data);

      // Priorizamos países de Latinoamérica (MX, AR, CO, BR, CL, PE)
      const latamCountries = ['MX', 'AR', 'CO', 'BR', 'CL', 'PE'];
      let providers = [];

      for (const country of latamCountries) {
        if (data.results[country]?.flatrate) {
          providers = data.results[country].flatrate.map((provider) => ({
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            logo_path: `https://image.tmdb.org/t/p/w45${provider.logo_path}`,
            link: platformUrls[provider.provider_name] || 'https://www.themoviedb.org',
          }));
          break;
        }
      }

      console.log('Proveedores de TMDB (Latinoamérica):', providers);
      return providers;
    } catch (err) {
      console.error('Error al obtener los proveedores de TMDB:', err);
      return [];
    }
  };

  const handleItemClick = async (item) => {
    // Determinar si es película o serie
    let type = 'movie';
    let fullItem = await fetchItemDetails(item.id, 'movie');
    if (!fullItem) {
      type = 'tv';
      fullItem = await fetchItemDetails(item.id, 'tv');
    }

    if (!fullItem) {
      alert('No se pudieron cargar los detalles del elemento');
      return;
    }

    setSelectedMovie(fullItem);
    const trailer = await fetchTrailer(item.id, type);
    const providers = await fetchWatchProviders(item.id, type);
    setTrailerUrl(trailer);
    setWatchProviders(providers);
    setModalOpen(true);
  };

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

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
    setTrailerUrl(null);
    setWatchProviders([]);
  };

  const removeFromWatchLater = async (itemId) => {
    try {
      await authRequest(`/api/watchlater/${itemId}`, 'DELETE');
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
    } catch (err) {
      console.error('Error al quitar elemento de "Ver más tarde":', err);
      alert('No se pudo quitar el elemento');
    }
  };

  return (
    <div className="content-page">
      <h1>Ver Más Tarde</h1>
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
        watchProviders={watchProviders}
      />
    </div>
  );
};

export default WatchLaterPage;