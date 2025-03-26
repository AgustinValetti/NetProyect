import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, selectedMovie, trailerUrl }) => {
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener la API Key desde la variable de entorno
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const fetchCast = async () => {
      // Verificar si selectedMovie y su ID existen
      if (!selectedMovie || !selectedMovie.id) {
        console.log('No se encontró un ID de película/serie:', selectedMovie);
        setError('No se encontró un ID válido para la película o serie.');
        return;
      }

      if (!TMDB_API_KEY) {
        console.log('API Key no encontrada en las variables de entorno');
        setError('Error: API Key de TMDB no configurada.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const mediaType = selectedMovie.name ? 'tv' : 'movie';
        console.log('Media Type:', mediaType);
        console.log('ID:', selectedMovie.id);

        const response = await fetch(
          `http://localhost:5080/api/tmdb/credits/${mediaType}/${selectedMovie.id}`
        );

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos del reparto:', data);

        if (data.cast && data.cast.length > 0) {
          setCast(data.cast.slice(0, 3));
        } else {
          setCast([]);
          setError('No se encontró información del reparto en la API.');
        }
      } catch (error) {
        console.error('Error al obtener el reparto:', error);
        setError('Error al cargar el reparto: ' + error.message);
        setCast([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && selectedMovie) {
      fetchCast();
    }
  }, [isOpen, selectedMovie, TMDB_API_KEY]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2>{selectedMovie?.title || selectedMovie?.name || 'Sin título'}</h2>
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
            <p>{selectedMovie?.overview || 'No hay descripción disponible.'}</p>
          </div>
          <div className="modal-cast">
            <h3>Reparto</h3>
            {isLoading ? (
              <p>Cargando reparto...</p>
            ) : error ? (
              <p>{error}</p>
            ) : cast.length > 0 ? (
              <div className="cast-list">
                {cast.map((actor) => (
                  <Link
                    key={actor.id}
                    to={`/actor/${actor.id}`}
                    className="cast-link"
                  >
                    {actor.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p>No se encontró información del reparto.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;