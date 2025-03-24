import React, { useState } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, overview, trailerUrl, selectedMovie }) => {
  const [isFavoriteActor, setIsFavoriteActor] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);

  if (!isOpen) return null;

  const token = localStorage.getItem('token'); // Token JWT almacenado tras login
  const movieId = selectedMovie?.id; // Asumiendo que selectedMovie tiene un id

  const addFavoriteActor = async () => {
    // Esto es un placeholder; necesitarás obtener actorId y name desde TMDB
    const actorId = 123; // Ejemplo, reemplaza con lógica real
    const actorName = 'Nombre del Actor'; // Ejemplo, reemplaza con lógica real

    try {
      const response = await fetch('http://localhost:5080/api/users/favorite-actors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: actorId, name: actorName }),
      });
      if (response.ok) {
        setIsFavoriteActor(true);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error al añadir actor favorito:', error);
    }
  };

  const addToWatchLater = async () => {
    try {
      const response = await fetch('http://localhost:5080/api/users/watch-later/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: movieId,
          title,
          poster_path: selectedMovie?.poster_path || '',
          release_date: selectedMovie?.release_date || '',
        }),
      });
      if (response.ok) {
        setIsWatchLater(true);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error al añadir a watch later:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2>{title}</h2>
        <div className="modal-body">
          {trailerUrl ? (
            <div className="modal-trailer">
              <iframe
                width="100%"
                height="315"
                src={trailerUrl}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p>No se encontró un tráiler disponible.</p>
          )}
          <div className="modal-description">
            <h3>Descripción</h3>
            <p>{overview || 'No hay descripción disponible.'}</p>
          </div>
          <button onClick={addFavoriteActor} disabled={isFavoriteActor}>
            {isFavoriteActor ? 'Actor añadido a favoritos' : 'Añadir actor favorito'}
          </button>
          <button onClick={addToWatchLater} disabled={isWatchLater}>
            {isWatchLater ? 'Añadido a Ver más tarde' : 'Añadir a Ver más tarde'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;