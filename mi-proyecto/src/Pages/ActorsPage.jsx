// src/Pages/ActorsPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import './ContentPage.css';
import { useAuth } from '../Context/AuthContext';
import { addFavoriteActor, removeFavoriteActor } from '../api';

// Hook personalizado para debounce
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  debouncedCallback.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return debouncedCallback;
};

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const ActorsPage = () => {
  const { isAuthenticated, user, refreshUserData } = useAuth();
  const [actors, setActors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const fetchActors = useDebounce(async () => {
    setLoading(true);
    try {
      let allActors = [];
      let page = 1;
      const minItems = 35;

      while (allActors.length < minItems) {
        let url = searchTermRef.current
          ? `${TMDB_API_URL}/search/person?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(searchTermRef.current)}&page=${page}`
          : `${TMDB_API_URL}/person/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al obtener los actores');
        }
        const data = await response.json();

        if (data.results.length === 0) {
          break;
        }

        allActors = [...allActors, ...data.results];
        page += 1;

        if (searchTermRef.current && page > data.total_pages) {
          break;
        }
      }

      setActors(allActors.slice(0, minItems));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (!selectedActor) {
      fetchActors();
    }
    return () => fetchActors.cancel();
  }, [searchTerm, selectedActor]);

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
      setError(err.message);
      setLoading(false);
    }
  };

  const handleActorClick = (actor) => {
    setSelectedActor(actor);
    fetchActorMovies(actor.id);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const addToFavorites = async (actor) => {
    try {
      const actorData = {
        id: actor.id,
        name: actor.name,
        profile_path: actor.profile_path,
      };
      await addFavoriteActor(actorData);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al agregar actor a favoritos:', err);
    }
  };

  const removeFromFavorites = async (actorId) => {
    try {
      await removeFavoriteActor(actorId);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al quitar actor de favoritos:', err);
    }
  };

  if (loading && !selectedActor) return <div className="loading">Cargando actores...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="content-page">
      {selectedActor ? (
        <>
          <button onClick={() => setSelectedActor(null)} className="back-button">
            Volver a la lista de actores
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
          {/* Sección de actores favoritos */}
          {isAuthenticated && (
            <>
              <h2>Actores Favoritos</h2>
              {user?.favoriteActors?.length === 0 ? (
                <p className="no-results">No tienes actores favoritos.</p>
              ) : (
                <div className="content-grid">
                  {user?.favoriteActors?.map((actor) => (
                    <div key={actor.id} className="content-card">
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
                      <button
                        className="remove-button"
                        onClick={() => removeFromFavorites(actor.id)}
                      >
                        Quitar de Favoritos
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <h1>Actores Populares</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar actores por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {loading && searchTerm && <span className="search-spinner"></span>}
          </div>
          {actors.length === 0 && searchTerm ? (
            <p className="no-results">No se encontraron actores para "{searchTerm}".</p>
          ) : (
            <div className="content-grid">
              {actors.map((actor) => (
                <div
                  key={actor.id}
                  className="content-card"
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
                  {isAuthenticated && (
                    user?.favoriteActors?.some((fav) => fav.id === actor.id) ? (
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromFavorites(actor.id);
                        }}
                      >
                        Quitar de Favoritos
                      </button>
                    ) : (
                      <button
                        className="add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToFavorites(actor);
                        }}
                      >
                        Agregar a Favoritos
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActorsPage;