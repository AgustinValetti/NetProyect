// frontend/src/Pages/SeriesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Components/Modal/Modal';
import './ContentPage.css';
import { useAuth } from '../Context/AuthContext';

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

const SeriesPage = () => {
  const { isAuthenticated, user, authRequest, updateUser } = useAuth();
  const [series, setSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(35);
  const [message, setMessage] = useState(null);

  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const updateItemsPerPage = () => {
    if (window.innerWidth <= 768) {
      setItemsPerPage(10);
    } else if (window.innerWidth <= 480) {
      setItemsPerPage(5);
    } else {
      setItemsPerPage(35);
    }
  };

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const fetchSeries = useDebounce(async () => {
    setLoading(true);
    try {
      let allSeries = [];
      let page = 1;
      const minItems = 35;

      while (allSeries.length < minItems) {
        let url = searchTermRef.current
          ? `${TMDB_API_URL}/search/tv?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(searchTermRef.current)}&page=${page}`
          : `${TMDB_API_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al obtener las series');
        }
        const data = await response.json();

        if (data.results.length === 0) {
          break;
        }

        allSeries = [...allSeries, ...data.results];
        page += 1;

        if (searchTermRef.current && page > data.total_pages) {
          break;
        }
      }

      setSeries(allSeries.slice(0, minItems));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchSeries();
    return () => fetchSeries.cancel();
  }, [searchTerm]);

  const fetchTrailer = async (seriesId) => {
    try {
      const response = await fetch(
        `${TMDB_API_URL}/tv/${seriesId}/videos?api_key=${TMDB_API_KEY}&language=es-ES`
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

  const handleSeriesClick = async (series) => {
    setSelectedSeries(series);
    const trailer = await fetchTrailer(series.id);
    setTrailerUrl(trailer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSeries(null);
    setTrailerUrl(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const addToWatchLater = async (series) => {
    if (!isAuthenticated) {
      setMessage('Por favor, inicia sesión para agregar series a "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (user?.watchLaterMovies?.some((s) => s.id === series.id)) {
      setMessage('Esta serie ya está en tu lista de "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const seriesData = {
        id: series.id,
        title: series.name, // Renombramos "name" a "title" para que coincida con el esquema
        poster_path: series.poster_path,
        release_date: series.first_air_date, // Renombramos "first_air_date" a "release_date"
      };
      await authRequest('/api/watchlater', 'POST', seriesData);
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
      setMessage('Serie añadida a "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message || 'Error al agregar la serie');
      setTimeout(() => setMessage(null), 3000);
      console.error('Error al agregar serie a "Ver más tarde":', err);
    }
  };

  const removeFromWatchLater = async (seriesId) => {
    if (!isAuthenticated) {
      setMessage('Por favor, inicia sesión para quitar series de "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      console.log('🔍 Enviando DELETE para seriesId:', seriesId, typeof seriesId);
      await authRequest(`/api/watchlater/${seriesId}`, 'DELETE');
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
      setMessage('Serie eliminada de "Ver más tarde"');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message || 'Error al quitar la serie');
      setTimeout(() => setMessage(null), 3000);
      console.error('Error al quitar serie de "Ver más tarde":', err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = series.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="content-page">
      <h1>Series Populares</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar series por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {loading && searchTerm && <span className="search-spinner"></span>}
      </div>
      {message && <div className="message">{message}</div>}
      {loading && !searchTerm ? (
        <div className="loading">Cargando series...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : series.length === 0 && searchTerm ? (
        <p className="no-results">No se encontraron series para "{searchTerm}".</p>
      ) : (
        <>
          <div className="content-grid">
            {currentItems.map((show) => {
              const isInWatchLater = user?.watchLaterMovies?.some((s) => s.id === show.id);
              console.log(`Series ${show.name} - isInWatchLater: ${isInWatchLater}`); // Depuración
              return (
                <div
                  key={show.id}
                  className={`content-card ${isInWatchLater ? 'later' : ''}`}
                  onClick={() => handleSeriesClick(show)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={
                      show.poster_path
                        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                        : 'https://via.placeholder.com/150'
                    }
                    alt={show.name}
                    className="content-image"
                  />
                  <h3>{show.name}</h3>
                  <p>{show.first_air_date || 'Fecha no disponible'}</p>
                  {isAuthenticated && (
                    isInWatchLater ? (
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchLater(show.id);
                        }}
                      >
                        Quitar de "Ver más tarde"
                      </button>
                    ) : (
                      <button
                        className="add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToWatchLater(show);
                        }}
                      >
                        Agregar a "Ver más tarde"
                      </button>
                    )
                  )}
                </div>
              );
            })}
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
              disabled={indexOfLastItem >= series.length}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        selectedMovie={selectedSeries}
        trailerUrl={trailerUrl}
      />
    </div>
  );
};

export default SeriesPage;