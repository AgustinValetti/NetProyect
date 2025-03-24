import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 📌 Obtener todas las reseñas para una película
router.get('/movie/:movieId', async (req, res) => {
  try {
    console.log(`🔍 Buscando reseñas para la película ID: ${req.params.movieId}`);
    const reviews = await Review.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    console.log('📋 Reseñas encontradas:', reviews);
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error al obtener reseñas:', err.stack);
    res.status(500).json({ message: 'Error al obtener las reseñas', error: err.message });
  }
});

// 📌 Añadir una reseña (requiere autenticación)
router.post('/', auth, async (req, res) => {
  const { movieId, movieTitle, rating, comment } = req.body;

  // Validar campos obligatorios
  if (!movieId || !movieTitle || !rating || !comment) {
    console.log('❌ Faltan campos obligatorios:', { movieId, movieTitle, rating, comment });
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  // Validar que el rating esté entre 1 y 5
  if (rating < 1 || rating > 5) {
    console.log('❌ Rating inválido:', rating);
    return res.status(400).json({ message: 'El rating debe estar entre 1 y 5' });
  }

  try {
    console.log('📌 Intentando guardar reseña...');
    // Obtener el usuario autenticado desde la base de datos
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('❌ Usuario no encontrado:', req.user.id);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('👤 Usuario encontrado:', { id: user._id, username: user.username, avatar: user.avatar });

    const userAvatar = user.avatar ? `http://localhost:5080/uploads/avatars/${user.avatar}` : 'https://via.placeholder.com/40';
    console.log('🖼️ Avatar asignado:', userAvatar);

    const newReview = new Review({
      movieId,
      movieTitle,
      rating,
      comment,
      userId: req.user.id,
      username: user.username,
      userAvatar: userAvatar,
    });

    const savedReview = await newReview.save();
    console.log('✅ Reseña guardada correctamente:', savedReview);
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('🔥 Error al guardar la reseña:', err.stack);
    res.status(500).json({
      message: 'Error al guardar la reseña',
      error: err.message,
      details: err.message,
    });
  }
});

// 📌 Eliminar una reseña (solo el propietario puede eliminarla)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`📌 Intentando eliminar reseña con ID: ${req.params.id}`);
    const review = await Review.findById(req.params.id);

    if (!review) {
      console.log('❌ Reseña no encontrada:', req.params.id);
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar que el usuario sea el propietario de la reseña
    if (review.userId.toString() !== req.user.id) {
      console.log('❌ No autorizado. Usuario:', req.user.id, 'Propietario:', review.userId.toString());
      return res.status(403).json({ message: 'No autorizado' });
    }

    await Review.findByIdAndDelete(req.params.id);
    console.log('✅ Reseña eliminada con éxito');
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    console.error('🔥 Error al eliminar la reseña:', err.stack);
    res.status(500).json({
      message: 'Error al eliminar la reseña',
      error: err.message,
      details: err.message,
    });
  }
});

export default router;