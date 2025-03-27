// backend/src/routes/favoritesActors.js
import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Agregar actor a favoritos
router.post('/', auth, async (req, res) => {
  const { id, name, profile_path, known_for_department } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.favoriteActors.some((actor) => actor.id === id)) {
      return res.status(400).json({ message: 'Actor ya está en la lista de favoritos' });
    }

    user.favoriteActors.push({ id, name, profile_path, known_for_department });
    await user.save();
    res.json({ message: 'Actor agregado a favoritos', favoriteActors: user.favoriteActors });
  } catch (err) {
    console.error('Error al agregar actor:', err);
    res.status(500).json({ message: 'Error al agregar actor', details: err.message });
  }
});

// Quitar actor de favoritos
router.delete('/:actorId', auth, async (req, res) => {
  const { actorId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.favoriteActors = user.favoriteActors.filter((actor) => actor.id !== Number(actorId));
    await user.save();
    res.json({ message: 'Actor eliminado de favoritos', favoriteActors: user.favoriteActors });
  } catch (err) {
    console.error('Error al eliminar actor:', err);
    res.status(500).json({ message: 'Error al eliminar actor', details: err.message });
  }
});

// Obtener lista de actores favoritos
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.favoriteActors);
  } catch (err) {
    console.error('Error al obtener lista de favoritos:', err);
    res.status(500).json({ message: 'Error al obtener lista de favoritos', details: err.message });
  }
});

export default router;