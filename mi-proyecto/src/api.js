// frontend/src/api.js

// Función auxiliar para manejar las solicitudes con XMLHttpRequest
const request = (url, method, body = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `http://localhost:5080/api${url}`, true);

    // Añadir headers
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('x-auth-token', token); // Cambiamos a 'x-auth-token' para coincidir con tu backend
    }

    // Manejar la respuesta
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (err) {
          reject(new Error('Error al parsear la respuesta JSON'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Error en la solicitud'));
        } catch (err) {
          reject(new Error('Error en la solicitud'));
        }
      }
    };

    // Manejar errores de red
    xhr.onerror = () => {
      reject(new Error('Error de red'));
    };

    // Enviar la solicitud
    xhr.send(body ? JSON.stringify(body) : null);
  });
};

// Endpoints para autenticación
export const login = (email, password) =>
  request('/auth/login', 'POST', { email, password });

export const getUserData = () => request('/auth/me', 'GET');

// Endpoints para actores favoritos
export const addFavoriteActor = (actor) =>
  request('/users/favorites/actors', 'POST', { actor });

export const removeFavoriteActor = (actorId) =>
  request(`/users/favorites/actors/${actorId}`, 'DELETE');

// Endpoints para películas en "Ver más tarde"
export const addWatchLaterMovie = (movie) =>
  request('/users/watchlater/movies', 'POST', { movie });

export const removeWatchLaterMovie = (movieId) =>
  request(`/users/watchlater/movies/${movieId}`, 'DELETE');

// Endpoints para series en "Ver más tarde"
export const addWatchLaterSeries = (series) =>
  request('/users/watchlater/series', 'POST', { series });

export const removeWatchLaterSeries = (seriesId) =>
  request(`/users/watchlater/series/${seriesId}`, 'DELETE');