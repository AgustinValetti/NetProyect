import React, { useState, useEffect } from "react";

const SEARCH_URL = "https://api.themoviedb.org/3/search/movie";
const MOVIE_DETAILS_URL = "https://api.themoviedb.org/3/movie";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [review, setReview] = useState({ rating: 1, comment: "" });
  const [movieReviews, setMovieReviews] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:5080/api/auth/me", {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${SEARCH_URL}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${text}`
      );
      const data = await response.json();
      setSuggestions(data.results.slice(0, 5));
    } catch (error) {
      console.error("Error al buscar películas:", error);
    }
  };

  const fetchMovieReviews = async (movieId) => {
    try {
      console.log("Cargando reseñas para la película:", movieId);
      const response = await fetch(`http://localhost:5080/reviews/movie/${movieId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Reseñas recibidas:", data);
        setMovieReviews(data);
        setCurrentPage(1);
      } else {
        console.error("Error al obtener reseñas");
        setMovieReviews([]);
      }
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      setMovieReviews([]);
    }
  };

  const handleSelectMovie = async (movieId) => {
    try {
      const response = await fetch(
        `${MOVIE_DETAILS_URL}/${movieId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const movieData = await response.json();

      const castResponse = await fetch(
        `${MOVIE_DETAILS_URL}/${movieId}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const castData = await castResponse.json();

      setSelectedMovie({
        ...movieData,
        cast: castData.cast.slice(0, 5),
      });

      fetchMovieReviews(movieId);

      setSuggestions([]);
      setQuery("");
    } catch (error) {
      console.error("Error al obtener detalles de la película:", error);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para publicar una reseña.");
      return;
    }

    if (!review.comment.trim()) {
      alert("Por favor, escribe un comentario.");
      return;
    }

    const reviewData = {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      rating: parseFloat(review.rating),
      comment: review.comment,
      userId: user._id,
      username: user.username,
      userAvatar: user.avatar || "https://via.placeholder.com/40",
    };

    try {
      const response = await fetch("http://localhost:5080/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al enviar la reseña");
      }

      const newReview = await response.json();
      setMovieReviews([newReview, ...movieReviews]);
      setReview({ rating: 1, comment: "" });
      setCurrentPage(1);
      alert("Reseña publicada correctamente");
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      alert(`Error al enviar la reseña: ${error.message}`);
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = movieReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(movieReviews.length / reviewsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container">
      <h2>Movie Search</h2>
      <input
        type="text"
        placeholder="Buscar película..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      <ul className="movie-list">
        {suggestions.map((movie) => (
          <li
            key={movie.id}
            onClick={() => handleSelectMovie(movie.id)}
            className="movie-item"
          >
            <img
              src={
                movie.poster_path
                  ? `${IMAGE_BASE_URL}${movie.poster_path}`
                  : "https://via.placeholder.com/92x138"
              }
              alt={movie.title}
              className="movie-thumbnail"
            />
            <div>
              <strong>{movie.title}</strong>
              <p>
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : ""}
                • {movie.vote_average?.toFixed(1)} ⭐
              </p>
            </div>
          </li>
        ))}
      </ul>

      {selectedMovie && (
        <>
          <div className="movie-details">
            <div className="poster">
              <img
                src={
                  selectedMovie.poster_path
                    ? `${POSTER_BASE_URL}${selectedMovie.poster_path}`
                    : "https://via.placeholder.com/300x450"
                }
                alt={selectedMovie.title}
              />
            </div>
            <div className="details">
              <h3>{selectedMovie.title}</h3>
              <p className="rating">{selectedMovie.vote_average.toFixed(1)} ⭐</p>
              <p>
                <strong>Año:</strong>{" "}
                {selectedMovie.release_date
                  ? new Date(selectedMovie.release_date).getFullYear()
                  : "N/A"}
              </p>
              <p>
                <strong>Duración:</strong>{" "}
                {selectedMovie.runtime ? `${selectedMovie.runtime} min` : "N/A"}
              </p>
              <p>
                <strong>Géneros:</strong>{" "}
                {selectedMovie.genres?.map((g) => g.name).join(", ") || "N/A"}
              </p>
              <p>
                <strong>Idiomas:</strong>{" "}
                {selectedMovie.spoken_languages
                  ?.map((lang) => lang.english_name)
                  .join(", ") || "N/A"}
              </p>
              <p className="overview">
                <strong>Descripción:</strong>{" "}
                {selectedMovie.overview || "No disponible"}
              </p>
              <h4>Reparto Principal:</h4>
              <div className="cast">
                {selectedMovie.cast.length > 0 ? (
                  selectedMovie.cast.map((actor) => (
                    <span key={actor.id} className="actor">
                      {actor.name}
                    </span>
                  ))
                ) : (
                  <p>No disponible</p>
                )}
              </div>
            </div>
          </div>

          <div className="reviews-section">
            <h3>Reseñas de {selectedMovie.title}</h3>

            <div className="add-review-section">
              <h4>Agregar una nueva reseña</h4>
              {isAuthenticated ? (
                <div className="review-form">
                  <div className="user-info">
                    <div className="avatar-small">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <span className="username">
                      Comentando como: <strong>{user?.username || "Usuario"}</strong>
                    </span>
                  </div>
                  <div className="form-group">
                    <label>Calificación:</label>
                    <select
                      name="rating"
                      value={review.rating}
                      onChange={handleReviewChange}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} ⭐
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Comentario:</label>
                    <textarea
                      name="comment"
                      value={review.comment}
                      onChange={handleReviewChange}
                      placeholder="Escribe tu reseña aquí..."
                    ></textarea>
                  </div>
                  <button onClick={handleSubmitReview} className="submit-review-btn">
                    Publicar Reseña
                  </button>
                </div>
              ) : (
                <div className="login-prompt">
                  <p>
                    Necesitas <a href="/login">iniciar sesión</a> para publicar una reseña.
                  </p>
                </div>
              )}
            </div>

            <div className="existing-reviews">
              <h4>Todas las reseñas</h4>
              {movieReviews.length > 0 ? (
                <>
                  <div className="reviews-container">
                    {currentReviews.map((review, index) => (
                      <div key={review._id || index} className="review-card">
                        <div className="user-review-header">
                          <div className="user-info">
                            <div className="avatar-small">
                              {review.userAvatar ? (
                                <img src={review.userAvatar} alt={review.username} />
                              ) : (
                                <div className="avatar-placeholder-small">
                                  {review.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                              )}
                            </div>
                            <span className="username">
                              {review.username || "Usuario Anónimo"}
                            </span>
                          </div>
                          <div className="review-rating">
                            {renderStars(review.rating)}{" "}
                            <span className="rating-value">({review.rating} ⭐)</span>
                          </div>
                        </div>
                        <div className="review-date">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </div>
                        <div className="review-body">
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {movieReviews.length > reviewsPerPage && (
                    <div className="pagination">
                      <button
                        type="button"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        Anterior
                      </button>
                      <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="no-reviews">
                  No hay reseñas para esta película. ¡Sé el primero en opinar!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MovieSearch;