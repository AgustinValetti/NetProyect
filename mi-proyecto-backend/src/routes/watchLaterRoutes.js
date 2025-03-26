import express from 'express';
import {
  addToWatchLater,
  removeFromWatchLater,
  getWatchLater
} from '../controllers/watchLaterController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /watchlater - Agregar a la lista
router.post('/', auth, addToWatchLater);

// DELETE /watchlater/:type/:id - Remover de la lista
router.delete('/:type(movies|series)/:id', auth, removeFromWatchLater);

// GET /watchlater - Obtener toda la lista
router.get('/', auth, getWatchLater);

export default router;