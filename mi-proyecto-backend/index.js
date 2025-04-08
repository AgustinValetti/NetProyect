const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const movieRoutes = require('./src/routes/movies'); // Importamos las rutas de películas
const authRoutes = require('./src/routes/auth'); // Importamos las rutas de autenticación

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Permite recibir JSON en las requests
app.use(cors()); // Habilita CORS para peticiones desde el frontend

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/nombreDeTuBaseDeDatos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conexión exitosa a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Rutas
app.use('/api', movieRoutes); // Todas las rutas de películas estarán bajo "/api"
app.use('/api/auth', authRoutes); // Todas las rutas de autenticación estarán bajo "/api/auth"


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
