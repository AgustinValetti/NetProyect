// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import authRoutes from './src/routes/auth.js';
import reviewRoutes from './src/routes/reviews.js';
import watchLaterRoutes from './src/routes/watchLater.js'; // Nueva importación
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// backend/server.js
import favoritesActorsRoutes from './src/routes/favoriteActors.js';

// Solucionar __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Verificar que las variables de entorno están definidas
if (!process.env.MONGO_URI) console.error('❌ MONGO_URI no está definido en .env');
if (!process.env.JWT_SECRET) console.error('❌ JWT_SECRET no está definido en .env');
if (!process.env.TMDB_API_KEY) console.error('❌ TMDB_API_KEY no está definido en .env');

const app = express();

// Habilitar CORS para el frontend en localhost:5173, 5175 y 5177
app.use(cors({ origin: ['https://net-proyect.vercel.app/','http://localhost:5173', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:5177'] }));

// Middleware para analizar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para subida de archivos
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    abortOnLimit: true,
    responseOnLimit: 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.',
  })
);

// Servir archivos estáticos desde la carpeta uploads/avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para registrar todas las solicitudes entrantes
app.use((req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.url}`);
  if (Object.keys(req.body).length) console.log('📩 Body recibido:', req.body);
  if (req.files) console.log('📤 Archivos recibidos:', req.files);
  next();
});

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/moviereviews', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conexión exitosa a MongoDB'))
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/watchlater', watchLaterRoutes); // Nueva ruta
app.use('/api/favorites/actors', favoritesActorsRoutes);

// Endpoint para obtener el reparto
app.get('/api/tmdb/credits/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'API Key de TMDB no configurada.' });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener el reparto desde TMDB:', error.message);
    res.status(500).json({ error: 'Error al obtener el reparto', details: error.message });
  }
});

// Endpoint para obtener datos del actor
app.get('/api/tmdb/person/:actorId', async (req, res) => {
  const { actorId } = req.params;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'API Key de TMDB no configurada.' });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener datos del actor desde TMDB:', error.message);
    res.status(500).json({ error: 'Error al obtener datos del actor', details: error.message });
  }
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Captura de errores generales
app.use((err, req, res, next) => {
  console.error('🔥 Error inesperado:', err.stack);
  res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

// Iniciar servidor
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));