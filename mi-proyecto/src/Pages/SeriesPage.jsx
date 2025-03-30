// frontend/src/Pages/SeriesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Components/Modal/Modal';
import './ContentPage.css';
import { useAuth } from '../Context/AuthContext';

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
  const [watchProviders, setWatchProviders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(35);

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
        `${TMDB_API_URL}/tv/${seriesId}/videos?api_key=${TMDB_API_KEY}&language=es-MX`
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

  const fetchWatchProviders = async (seriesId) => {
    try {
      const response = await fetch(
        `${TMDB_API_URL}/tv/${seriesId}/watch/providers?api_key=${TMDB_API_KEY}`
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

  const handleSeriesClick = async (series) => {
    setSelectedSeries(series);
    const trailer = await fetchTrailer(series.id);
    const providers = await fetchWatchProviders(series.id);
    setTrailerUrl(trailer);
    setWatchProviders(providers);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSeries(null);
    setTrailerUrl(null);
    setWatchProviders([]);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const addToWatchLater = async (series) => {
    if (!isAuthenticated) {
      alert('Por favor, inicia sesión para agregar series a "Ver más tarde"');
      return;
    }
    try {
      const seriesData = {
        id: series.id,
        title: series.name,
        poster_path: series.poster_path,
        release_date: series.first_air_date,
      };
      await authRequest('/api/watchlater', 'POST', seriesData);
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
    } catch (err) {
      console.error('Error al agregar serie a "Ver más tarde":', err);
      alert('No se pudo agregar la serie');
    }
  };

  const removeFromWatchLater = async (seriesId) => {
    if (!isAuthenticated) return;
    try {
      console.log('🔍 Enviando DELETE para seriesId:', seriesId, typeof seriesId);
      await authRequest(`/api/watchlater/${seriesId}`, 'DELETE');
      const updatedWatchLater = await authRequest('/api/watchlater', 'GET');
      updateUser({ ...user, watchLaterMovies: updatedWatchLater.data });
    } catch (err) {
      console.error('Error al quitar serie de "Ver más tarde":', err);
      alert('No se pudo quitar la serie');
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
      {loading && !searchTerm ? (
        <div className="loading">Cargando series...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : series.length === 0 && searchTerm ? (
        <p className="no-results">No se encontraron series para "{searchTerm}".</p>
      ) : (
        <>
          <div className="content-grid">
            {currentItems.map((series) => {
              const isInWatchLater = user?.watchLaterMovies?.some((s) => s.id === series.id);
              console.log(`Series ${series.name} - isInWatchLater: ${isInWatchLater}`);
              return (
                <div
                  key={series.id}
                  className={`content-card ${isInWatchLater ? 'later' : ''}`}
                  onClick={() => handleSeriesClick(series)}
                  style={{ cursor: 'pointer' }}
                >
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
                  {isAuthenticated && (
                    isInWatchLater ? (
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchLater(series.id);
                        }}
                      >
                        Quitar de "Ver más tarde"
                      </button>
                    ) : (
                      <button
                        className="add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToWatchLater(series);
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
        watchProviders={watchProviders}
      />
    </div>
  );
};

export default SeriesPage;