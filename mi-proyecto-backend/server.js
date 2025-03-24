import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import authRoutes from './src/routes/auth.js';
import reviewRoutes from './src/routes/reviews.js';
import userRoutes from './src/routes/userRoutes.js'; // Ruta corregida
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Solucionar __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Verificar que las variables de entorno están definidas
if (!process.env.MONGO_URI) console.error('❌ MONGO_URI no está definido en .env');
if (!process.env.JWT_SECRET) console.error('❌ JWT_SECRET no está definido en .env');

const app = express();

// Habilitar CORS para el frontend en localhost:5173 y 5175
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5175'] }));

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

// Rutas
app.use('/api/auth', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/users', userRoutes); // Usar userRoutes importado

// server.js (al final, después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Captura de errores generales (asegurarnos de que siempre devolvamos JSON)
app.use((err, req, res, next) => {
  console.error('🔥 Error inesperado:', err.stack);
  res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

// Iniciar servidor
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));