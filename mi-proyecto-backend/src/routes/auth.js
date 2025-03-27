import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Review from '../models/Review.js'; // Importamos el modelo Review
import auth from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Solucionar __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 📌 Registro de usuario
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  console.log('📥 Intentando registrar usuario con:', { email, password, username });

  try {
    console.log('🔍 Verificando campos...');
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('🔍 Buscando usuario existente con email:', normalizedEmail);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('❌ El usuario ya existe');
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    console.log('🔍 Generando hash...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔒 Contraseña original:', password);
    console.log('🔒 Hash generado:', hashedPassword);

    console.log('🔍 Creando nuevo usuario...');
    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      username,
    });
    await user.save();
    console.log('✅ Usuario registrado con éxito');

    // Generar token JWT
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.status(201).json({
      token,
      message: 'Usuario creado correctamente',
    });
  } catch (err) {
    console.error('🔥 Error al registrar:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
});

// 📌 Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Datos recibidos en login:', { email, password });

  try {
    console.log('🔍 Verificando campos...');
    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('🔍 Buscando usuario con email:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    console.log('🔍 Verificando hash...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('✅ Resultado de bcrypt.compare:', isMatch);

    if (!isMatch) {
      console.log('❌ Contraseña no coincide');
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    console.log('🔍 Generando token...');
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    console.log('✅ Login exitoso, enviando token...');
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar ? `http://localhost:5080/uploads/avatars/${user.avatar}` : null,
      },
    });
  } catch (err) {
    console.error('🔥 Error en login:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
});

// 📌 Obtener datos del usuario autenticado
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar ? `http://localhost:5080/uploads/avatars/${user.avatar}` : null,
    });
  } catch (err) {
    console.error('🔥 Error al obtener usuario:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
});

// 📌 Subir avatar del usuario
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'No se proporcionó un archivo de avatar' });
    }

    const avatar = req.files.avatar;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(avatar.mimetype)) {
      return res
        .status(400)
        .json({ message: 'Formato de archivo no permitido. Solo se permiten imágenes JPEG, PNG o GIF.' });
    }

    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    const fileName = `${req.user.id}-${Date.now()}${path.extname(avatar.name)}`;
    const filePath = path.join(uploadDir, fileName);

    await avatar.mv(filePath);

    const user = await User.findById(req.user.id);
    if (!user) {
      await fs.unlink(filePath);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.avatar) {
      const oldAvatarPath = path.join(uploadDir, user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar el avatar anterior:', err.message);
      }
    }

    user.avatar = fileName;
    await user.save();

    res.json({ avatar: `http://localhost:5080/uploads/avatars/${fileName}` });
  } catch (err) {
    console.error('�fire Error al subir el avatar:', err.stack);
    res.status(500).json({ message: 'Error al subir el avatar', error: err.message });
  }
});

// 📌 Cambiar contraseña
router.put('/change-password', auth, async (req, res) => {
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Contraseña cambiada con éxito' });
  } catch (err) {
    console.error('🔥 Error al cambiar contraseña:', err.stack);
    res.status(500).json({ message: 'Error al cambiar la contraseña', error: err.message });
  }
});

// 📌 Cambiar email
router.put('/change-email', auth, async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Por favor, ingresa un email válido' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists && emailExists._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    user.email = normalizedEmail;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar ? `http://localhost:5080/uploads/avatars/${user.avatar}` : null,
    });
  } catch (err) {
    console.error('🔥 Error al cambiar email:', err.stack);
    res.status(500).json({ message: 'Error al cambiar el email', error: err.message });
  }
});

// 📌 Cambiar nombre de usuario
router.put('/change-username', auth, async (req, res) => {
  const { username } = req.body;

  try {
    // Validar el nuevo nombre de usuario
    if (!username || username.length < 3) {
      return res.status(400).json({ message: 'El nombre de usuario debe tener al menos 3 caracteres' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el nombre de usuario ya está en uso
    const usernameExists = await User.findOne({ username });
    if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Guardar el nombre de usuario anterior para logging
    const oldUsername = user.username;

    // Actualizar el nombre de usuario del usuario
    user.username = username;
    await user.save();

    // Actualizar las reseñas del usuario con el nuevo nombre de usuario
    const updatedReviews = await Review.updateMany(
      { userId: req.user.id },
      { $set: { username: username } }
    );
    console.log(`📝 Actualizadas ${updatedReviews.modifiedCount} reseñas con el nuevo username: ${username}`);

    console.log(`✅ Nombre de usuario cambiado de ${oldUsername} a ${username}`);

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar ? `http://localhost:5080/uploads/avatars/${user.avatar}` : null,
    });
  } catch (err) {
    console.error('🔥 Error al cambiar nombre de usuario:', err.stack);
    res.status(500).json({ message: 'Error al cambiar el nombre de usuario', error: err.message });
  }
});

// 📌 Eliminar cuenta
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar el avatar si existe
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads/avatars', user.avatar);
      try {
        await fs.unlink(avatarPath);
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar el avatar:', err.message);
      }
    }

    // Eliminar las reseñas del usuario
    await Review.deleteMany({ userId: req.user.id });
    console.log('🗑️ Reseñas del usuario eliminadas');

    await User.findByIdAndDelete(req.user.id);
    console.log('✅ Cuenta eliminada con éxito');
    res.json({ message: 'Cuenta eliminada con éxito' });
  } catch (err) {
    console.error('🔥 Error al eliminar cuenta:', err.stack);
    res.status(500).json({ message: 'Error al eliminar la cuenta', error: err.message });
  }


  

});

export { router as default };