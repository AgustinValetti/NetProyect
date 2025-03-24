import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import "./MovieSlider.css";

const API_URL = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";

const MovieSlider = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleMovies, setVisibleMovies] = useState(5);
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_URL}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`);
        const data = await response.json();
        // Ordenar películas por popularidad o ranking si es necesario
        const sortedMovies = data.results.slice(0, 15);
        setMovies(sortedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
    
    // Establecer el número de películas visibles según el tamaño de la pantalla
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 320) {
        setVisibleMovies(1);
      } else if (width <= 480) {
        setVisibleMovies(2);
      } else if (width <= 768) {
        setVisibleMovies(3);
      } else if (width <= 1200) {
        setVisibleMovies(4);
      } else {
        setVisibleMovies(5);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    if (currentIndex > movies.length - visibleMovies) {
      setCurrentIndex(Math.max(0, movies.length - visibleMovies));
    }
  }, [visibleMovies, movies.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      Math.min(prevIndex + 1, movies.length - visibleMovies)
    );
  };

  const moviesToShow = movies.slice(currentIndex, currentIndex + visibleMovies);

  return (
    <div className="movie-slider-container">
      <h2 className="slider-title">Trending Now</h2>
      
      <div className="movie-slider">
        <button 
          className="slider-arrow prev" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          ❮
        </button>
        
        <div className="movies-container">
          {moviesToShow.map((movie, index) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              index={currentIndex + index} 
            />
          ))}
        </div>

        <button 
          className="slider-arrow next" 
          onClick={handleNext} 
          disabled={currentIndex >= movies.length - visibleMovies}
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default MovieSlider;