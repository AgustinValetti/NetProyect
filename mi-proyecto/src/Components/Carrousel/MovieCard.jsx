// src/Carrousel/MovieCard.jsx
import React, { useState } from 'react';
import Modal from '../Modal/Modal'; // Asegúrate de que la ruta sea correcta
import './MovieCard.css';

const MovieCard = ({ movie, index, type = 'movie' }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const imageUrl = movie.poster_path || movie.profile_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.profile_path}`
    : 'https://via.placeholder.com/150';

  const title = movie.title || movie.name || 'Sin título';

  const fetchTrailer = async (movieId, mediaType = 'movie') => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${TMDB_API_KEY}&language=es-ES`
      );
      const data = await response.json();
      const trailer = data.results.find(video => video.type === 'Trailer');
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (err) {
      console.error('Error al obtener el tráiler:', err);
      return null;
    }
  };

  const handleClick = async () => {
    try {
      setSelectedMovie(movie);
      const trailer = await fetchTrailer(movie.id, type);
      setTrailerUrl(trailer);
      setModalOpen(true);
    } catch (err) {
      console.error('Error:', err);
      setTrailerUrl(null);
      setModalOpen(true); // Abre el modal incluso sin tráiler
    }
  };

  return (
    <>
      <div className="movie-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div className="ranking-badge">{index + 1}</div>
        <img src={imageUrl} alt={title} className="movie-poster" />
        <div className="movie-title">{title}</div>
      </div>

      {/* Modal integrado directamente */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedMovie={selectedMovie}
        trailerUrl={trailerUrl}
      />
    </>
  );
};

export default MovieCard;