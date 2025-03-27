// backend/src/routes/watchLater.js
import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js'; // Usamos tu middleware existente

const router = express.Router();

// Agregar película a "ver más tarde"
router.post('/', auth, async (req, res) => {
  const { id, title, poster_path, release_date } = req.body;
  try {
    const user = await User.findById(req.user.id); // req.user.id viene de tu middleware auth
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.watchLaterMovies.some((movie) => movie.id === id)) {
      return res.status(400).json({ message: 'Película ya está en la lista' });
    }

    user.watchLaterMovies.push({ id, title, poster_path, release_date });
    await user.save();
    res.json({ message: 'Película agregada', watchLaterMovies: user.watchLaterMovies });
  } catch (err) {
    console.error('Error al agregar película:', err);
    res.status(500).json({ message: 'Error al agregar película', details: err.message });
  }
});

// Quitar película de "ver más tarde"
router.delete('/:movieId', auth, async (req, res) => {
    const { movieId } = req.params;
    try {
      console.log('🔍 req.user:', req.user);
      const user = await User.findById(req.user.id);
      console.log('🔍 Usuario encontrado:', user);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  
      console.log('🔍 movieId recibido:', movieId, typeof movieId);
      console.log('🔍 watchLaterMovies antes de filtrar:', user.watchLaterMovies);
  
      user.watchLaterMovies = user.watchLaterMovies.filter((movie) => movie.id !== Number(movieId));
      console.log('🔍 watchLaterMovies después de filtrar:', user.watchLaterMovies);
  
      await user.save();
      console.log('✅ Película eliminada y guardada en DB');
  
      res.json({ message: 'Película eliminada', watchLaterMovies: user.watchLaterMovies });
    } catch (err) {
      console.error('Error al eliminar película:', err);
      res.status(500).json({ message: 'Error al eliminar película', details: err.message });
    }
  });

// Obtener lista de "ver más tarde"
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.watchLaterMovies);
  } catch (err) {
    console.error('Error al obtener lista:', err);
    res.status(500).json({ message: 'Error al obtener lista', details: err.message });
  }
});

export default router;