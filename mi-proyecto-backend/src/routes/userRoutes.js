import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js'; // Ajusta la ruta si es necesario

const router = express.Router();

// Obtener actores favoritos
router.get('/favorite-actors', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favoriteActors');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.favoriteActors);
  } catch (error) {
    console.error('Error al obtener actores favoritos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Añadir actor favorito
router.post('/favorite-actors', authMiddleware, async (req, res) => {
  const { id, name, profile_path } = req.body;
  if (!id || !name) return res.status(400).json({ message: 'Se requiere id y name del actor' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.favoriteActors.some(actor => actor.id === id)) {
      return res.status(400).json({ message: 'El actor ya está en favoritos' });
    }

    user.favoriteActors.push({ id, name, profile_path });
    await user.save();
    res.status(201).json(user.favoriteActors);
  } catch (error) {
    console.error('Error al añadir actor favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar actor favorito
router.delete('/favorite-actors/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.favoriteActors = user.favoriteActors.filter(actor => actor.id !== Number(id));
    await user.save();
    res.json(user.favoriteActors);
  } catch (error) {
    console.error('Error al eliminar actor favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener películas para ver más tarde
router.get('/watchlater/movies', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('watchLaterMovies');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.watchLaterMovies);
  } catch (error) {
    console.error('Error al obtener watch later movies:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Añadir película a "Ver más tarde"
router.post('/watchlater/movies', authMiddleware, async (req, res) => {
  const { id, title, poster_path, release_date } = req.body.movie; // Ajustado por la estructura de api.js
  if (!id || !title) return res.status(400).json({ message: 'Se requiere id y title de la película' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.watchLaterMovies.some(movie => movie.id === id)) {
      return res.status(400).json({ message: 'La película ya está en la lista' });
    }

    user.watchLaterMovies.push({ id, title, poster_path, release_date });
    await user.save();
    res.status(201).json(user.watchLaterMovies);
  } catch (error) {
    console.error('Error al añadir película a watch later:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar película de "Ver más tarde"
router.delete('/watchlater/movies/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.watchLaterMovies = user.watchLaterMovies.filter(movie => movie.id !== Number(id));
    await user.save();
    res.json(user.watchLaterMovies);
  } catch (error) {
    console.error('Error al eliminar película de watch later:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Nuevos endpoints para series
// Obtener series para ver más tarde
router.get('/watchlater/series', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('watchLaterSeries');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.watchLaterSeries);
  } catch (error) {
    console.error('Error al obtener watch later series:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Añadir serie a "Ver más tarde"
router.post('/watchlater/series', authMiddleware, async (req, res) => {
  const { id, name, poster_path, first_air_date } = req.body.series; // Ajustado por la estructura de api.js
  if (!id || !name) return res.status(400).json({ message: 'Se requiere id y name de la serie' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.watchLaterSeries.some(series => series.id === id)) {
      return res.status(400).json({ message: 'La serie ya está en la lista de "Ver más tarde"' });
    }

    user.watchLaterSeries.push({ id, name, poster_path, first_air_date });
    await user.save();
    res.status(201).json(user.watchLaterSeries);
  } catch (error) {
    console.error('Error al añadir serie a watch later:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar serie de "Ver más tarde"
router.delete('/watchlater/series/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.watchLaterSeries = user.watchLaterSeries.filter(series => series.id !== Number(id));
    await user.save();
    res.json(user.watchLaterSeries);
  } catch (error) {
    console.error('Error al eliminar serie de watch later:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;