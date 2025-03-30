// src/Carrousel/MovieCard.jsx
import React, { useState } from 'react';
import Modal from '../Modal/Modal'; // Asegúrate de que la ruta sea correcta
import './MovieCard.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Mapeo de nombres de plataformas a sus URLs principales
const platformUrls = {
  'Netflix': 'https://www.netflix.com',
  'Disney Plus': 'https://www.disneyplus.com',
  'HBO Max': 'https://www.max.com',
  'Amazon Prime Video': 'https://www.primevideo.com',
  'Paramount Plus': 'https://www.paramountplus.com',
  'Apple TV Plus': 'https://www.apple.com/apple-tv-plus/',
  'Star Plus': 'https://www.starplus.com',
  'Claro video': 'https://www.clarovideo.com',
  'Movistar Plus+': 'https://www.movistarplus.es',
  'Globoplay': 'https://globoplay.globo.com',
  'Lionsgate Plus': 'https://www.lionsgateplus.com',
};

const MovieCard = ({ movie, index, type = 'movie' }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [watchProviders, setWatchProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const imageUrl = movie.poster_path || movie.profile_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.profile_path}`
    : 'https://via.placeholder.com/150';

  const title = movie.title || movie.name || 'Sin título';

  const fetchTrailer = async (movieId, mediaType = 'movie') => {
    try {
      const response = await fetch(
        `${TMDB_API_URL}/${mediaType}/${movieId}/videos?api_key=${TMDB_API_KEY}&language=es-MX`
      );
      if (!response.ok) {
        throw new Error('Error al obtener el tráiler');
      }
      const data = await response.json();
      const trailer = data.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      console.log(`Trailer para ${movieId} (${mediaType}):`, trailer);
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (err) {
      console.error('Error al obtener el tráiler:', err);
      return null;
    }
  };

  const fetchWatchProviders = async (movieId, mediaType = 'movie') => {
    try {
      const response = await fetch(
        `${TMDB_API_URL}/${mediaType}/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener los proveedores de TMDB');
      }
      const data = await response.json();
      console.log(`Proveedores para ${movieId} (${mediaType}):`, data);

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

      console.log(`Proveedores filtrados para ${movieId} (${mediaType}):`, providers);
      return providers;
    } catch (err) {
      console.error('Error al obtener los proveedores de TMDB:', err);
      return [];
    }
  };

  const handleClick = async () => {
    try {
      console.log('Movie seleccionada:', movie);
      setSelectedMovie(movie);
      const trailer = await fetchTrailer(movie.id, type);
      const providers = await fetchWatchProviders(movie.id, type);
      console.log('Datos para el modal:', { movie, trailer, providers });
      setTrailerUrl(trailer);
      setWatchProviders(providers);
      setModalOpen(true);
    } catch (err) {
      console.error('Error en handleClick:', err);
      setTrailerUrl(null);
      setWatchProviders([]);
      setModalOpen(true); // Abre el modal incluso si falla algo
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
    setTrailerUrl(null);
    setWatchProviders([]);
  };

  return (
    <>
      <div className="movie-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div className="ranking-badge">{index + 1}</div>
        <img src={imageUrl} alt={title} className="movie-poster" />
        <div className="movie-title">{title}</div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        selectedMovie={selectedMovie}
        trailerUrl={trailerUrl}
        watchProviders={watchProviders}
      />
    </>
  );
};

export default MovieCard;