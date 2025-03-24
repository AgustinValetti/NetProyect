import React, { useState, useEffect, useRef, useContext } from 'react';
import Modal from '../Components/Modal/Modal';
import './ContentPage.css';
import { useAuth } from '../Context/AuthContext';
import { addWatchLaterMovie, removeWatchLaterMovie } from '../api';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

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

const MoviesPage = () => {
  const { isAuthenticated, user, refreshUserData } = useAuth();
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(35); // Por defecto, 35 en pantallas grandes

  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Función para ajustar el número de elementos por página según el tamaño de la pantalla
  const updateItemsPerPage = () => {
    if (window.innerWidth <= 768) {
      setItemsPerPage(10); // 10 elementos en pantallas pequeñas (tablets y móviles)
    } else if (window.innerWidth <= 480) {
      setItemsPerPage(5); // 5 elementos en pantallas muy pequeñas (móviles)
    } else {
      setItemsPerPage(35); // 35 elementos en pantallas grandes
    }
  };

  // Escuchar cambios en el tamaño de la pantalla
  useEffect(() => {
    updateItemsPerPage(); // Ajustar al cargar la página
    window.addEventListener('resize', updateItemsPerPage); // Ajustar al redimensionar
    return () => window.removeEventListener('resize', updateItemsPerPage); // Limpiar listener
  }, []);

  const fetchMovies = useDebounce(async () => {
    setLoading(true);
    try {
      let allMovies = [];
      let page = 1;
      const minItems = 35;

      while (allMovies.length < minItems) {
        let url = searchTermRef.current
          ? `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(searchTermRef.current)}&page=${page}`
          : `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al obtener las películas');
        }
        const data = await response.json();

        if (data.results.length === 0) {
          break;
        }

        allMovies = [...allMovies, ...data.results];
        page += 1;

        if (searchTermRef.current && page > data.total_pages) {
          break;
        }
      }

      setMovies(allMovies.slice(0, minItems));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchMovies();
    return () => fetchMovies.cancel();
  }, [searchTerm]);

  const fetchTrailer = async (movieId) => {
    try {
      const response = await fetch(
        `${TMDB_API_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=es-ES`
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

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    const trailer = await fetchTrailer(movie.id);
    setTrailerUrl(trailer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
    setTrailerUrl(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const addToWatchLater = async (movie) => {
    try {
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
      };
      await addWatchLaterMovie(movieData);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al agregar película a "Ver más tarde":', err);
    }
  };

  const removeFromWatchLater = async (movieId) => {
    try {
      await removeWatchLaterMovie(movieId);
      await refreshUserData(); // Actualizamos los datos del usuario
    } catch (err) {
      console.error('Error al quitar película de "Ver más tarde":', err);
    }
  };

  // Calcular el índice de inicio y fin para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movies.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="content-page">
      <h1>Películas Populares</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar películas por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {loading && searchTerm && <span className="search-spinner"></span>}
      </div>
      {loading && !searchTerm ? (
        <div className="loading">Cargando películas...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : movies.length === 0 && searchTerm ? (
        <p className="no-results">No se encontraron películas para "{searchTerm}".</p>
      ) : (
        <>
          <div className="content-grid">
            {currentItems.map((movie) => (
              <div
                key={movie.id}
                className="content-card"
                onClick={() => handleMovieClick(movie)}
                style={{ cursor: 'pointer' }}
              >
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
                {isAuthenticated && (
                  user?.watchLaterMovies?.some((m) => m.id === movie.id) ? (
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchLater(movie.id);
                      }}
                    >
                      Quitar de "Ver más tarde"
                    </button>
                  ) : (
                    <button
                      className="add-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchLater(movie);
                      }}
                    >
                      Agregar a "Ver más tarde"
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>Página {currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= movies.length}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedMovie?.title}
        overview={selectedMovie?.overview}
        trailerUrl={trailerUrl}
      />
    </div>
  );
};

export default MoviesPage;