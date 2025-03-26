import express from 'express';
import {
  toggleFavoriteActor,
  getFavoriteActors
} from '../controllers/favoritesController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /favorites/actors - Alternar actor favorito
router.post('/actors', auth, toggleFavoriteActor);

// GET /favorites/actors - Obtener actores favoritos
router.get('/actors', auth, getFavoriteActors);

export default router;