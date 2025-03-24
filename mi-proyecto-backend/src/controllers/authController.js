import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

// Iniciar sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Intento de login con email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Usuario no encontrado:", email);
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Contraseña incorrecta para el usuario:", email);
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Login exitoso para usuario:", email);

    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error al iniciar sesión", error: err.message });
  }
};

// Registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    console.log("Solicitud de registro recibida con body:", req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log("Datos incompletos recibidos:", { username, email, password: !!password });
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log("Usuario ya registrado con email:", email);
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log("Usuario registrado exitosamente con ID:", user._id);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está definido en las variables de entorno");
      return res.status(500).json({ message: "Error de configuración del servidor" });
    }

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Token generado correctamente para usuario:", email);

    return res.status(201).json({ token, message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en registro de usuario:", err);
    res.status(500).json({ 
      message: "Error en el servidor", 
      error: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Subir avatar del usuario
export const uploadAvatar = async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res.status(401).json({ message: "No se proporcionó un token de autenticación" });
    }

    // Verificar el token y obtener el ID del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    // Verificar si se envió un archivo
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: "No se proporcionó un archivo de avatar" });
    }

    const avatar = req.files.avatar;

    // Validar el tipo de archivo (solo imágenes)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(avatar.mimetype)) {
      return res.status(400).json({ message: "Formato de archivo no permitido. Solo se permiten imágenes JPEG, PNG o GIF." });
    }

    // Crear la carpeta de avatares si no existe
    const uploadDir = path.join(process.cwd(), "uploads", "avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar un nombre único para el archivo
    const fileName = `${userId}-${Date.now()}${path.extname(avatar.name)}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo en el servidor
    await avatar.mv(filePath);

    // Actualizar la referencia del avatar en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el avatar anterior si existe
    if (user.avatar) {
      const oldAvatarPath = path.join(uploadDir, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = fileName;
    await user.save();

    // Devolver la URL del avatar
    const avatarUrl = `${process.env.API_URL}/uploads/avatars/${fileName}`;
    res.json({ avatar: avatarUrl, message: "Avatar actualizado correctamente" });
  } catch (err) {
    console.error("Error al subir el avatar:", err);
    res.status(500).json({ message: "Error al subir el avatar", error: err.message });
  }
};