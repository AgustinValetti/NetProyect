// src/Pages/WatchLaterPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const WatchLaterPage = () => {
  const { user, authRequest } = useAuth();
  const [loading, setLoading] = useState(true);

  const removeItem = async (itemId, type) => {
    try {
      await authRequest(`/api/watchlater/${type}/${itemId}`, 'DELETE');
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="watchlater-page">
      <h1>Mi Lista</h1>
      
      <Tabs>
        <TabList>
          <Tab>Películas ({user?.watchLater?.movies?.length || 0})</Tab>
          <Tab>Series ({user?.watchLater?.series?.length || 0})</Tab>
        </TabList>

        <TabPanel>
          <div className="items-grid">
            {user?.watchLater?.movies?.map(movie => (
              <div key={movie.tmdbId} className="item-card">
                <img 
                  src={movie.posterPath 
                    ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
                    : '/placeholder-movie.jpg'}
                  alt={movie.title}
                />
                <h3>{movie.title}</h3>
                <button 
                  onClick={() => removeItem(movie.tmdbId, 'movies')}
                  className="remove-btn"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel>
          <div className="items-grid">
            {user?.watchLater?.series?.map(series => (
              <div key={series.tmdbId} className="item-card">
                <img 
                  src={series.posterPath 
                    ? `https://image.tmdb.org/t/p/w300${series.posterPath}`
                    : '/placeholder-tv.jpg'}
                  alt={series.title}
                />
                <h3>{series.title}</h3>
                <button 
                  onClick={() => removeItem(series.tmdbId, 'series')}
                  className="remove-btn"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default WatchLaterPage;