import React from "react";
import "./MovieCard.css";

const MovieCard = ({ movie, index }) => {
  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  
  return (
    <div className="movie-card">
      <div className="ranking-badge">{index + 1}</div>
      <img 
        src={imageUrl} 
        alt={movie.title} 
        className="movie-poster" 
      />
      <div className="movie-title">{movie.title}</div>
    </div>
  );
};

export default MovieCard;