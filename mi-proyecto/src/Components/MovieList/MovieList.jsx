import React, { useEffect, useState } from 'react';
import "./MovieList.css";

const MovieList = () => {
  const [shows, setShows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Índice del grupo actual de películas

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          throw new Error('La clave de API no está configurada');
        }

        // Obtener películas próximas (máximo 12)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=es-ES&page=1`
        );

        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }

        const data = await response.json();
        const showsWithVideos = await Promise.all(
          data.results.slice(0, 12).map(async (show) => { // Limitar a 12 películas
            // Obtener los videos (tráilers) para cada película
            const videosResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${show.id}/videos?api_key=${apiKey}&language=es-ES`
            );
            const videosData = await videosResponse.json();
            return {
              ...show,
              videos: videosData.results.filter((video) => video.type === "Trailer"),
            };
          })
        );

        // No filtramos las películas, mostramos todas
        setShows(showsWithVideos);
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    };

    fetchShows();
  }, []);

  // Función para cambiar al grupo anterior de películas
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : Math.ceil(shows.length / 3) - 1));
  };

  // Función para cambiar al siguiente grupo de películas
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < Math.ceil(shows.length / 3) - 1 ? prevIndex + 1 : 0));
  };

  // Obtener el grupo actual de películas (3 a la vez)
  const currentShows = shows.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <div className="movie-list">
      <h1>Próximamente en cines</h1>
      <div className="carousel">
        <button className="carousel-button prev" onClick={goToPrevious}>&#10094;</button>
        <div className="carousel-content">
          {currentShows.map((show) => (
            <div className="show-item" key={show.id}>
              <div className="show-poster">
                <img
                  src={`https://image.tmdb.org/t/p/w300${show.poster_path}`} // Tamaño reducido de la imagen
                  alt={show.title}
                  className="poster-image"
                />
              </div>
              <div className="show-details">
                <h2>{show.title}</h2>
                <p>Rating: {show.vote_average}</p>
                <p className="description">
                  {show.overview.split(' ').slice(0, 20).join(' ')}... {/* Descripción de 3 renglones */}
                </p>
                {show.videos.length > 0 ? (
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${show.videos[0].key}`}
                      title={show.videos[0].name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <p className="no-trailer">No hay tráiler disponible.</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-button next" onClick={goToNext}>&#10095;</button>
      </div>
    </div>
  );
};

export default MovieList;