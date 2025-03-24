import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Obtener el token del header 'x-auth-token'
  const token = req.header("x-auth-token");

  console.log("🔍 Token recibido:", token ? token : "No se recibió token");
  console.log("📋 Todos los headers:", req.headers); // Log de todos los headers para depuración

  // Si no hay token, devolver un error 401
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });
  }

  try {
    console.log("🔑 JWT_SECRET usado para verificación:", process.env.JWT_SECRET || "No definido");

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decodificado:", decoded);

    // Adjuntar la información del usuario a la solicitud
    req.user = decoded.user;

    // Verificar que el usuario tenga los campos necesarios para las reviews
    if (!req.user.id || !req.user.username) {
      console.error("❌ El token no contiene la información necesaria del usuario");
      return res.status(401).json({ message: "Token no válido: falta información del usuario" });
    }

    // Continuar con la siguiente función (controlador)
    next();
  } catch (err) {
    console.error("❌ Error al verificar token:", err.message);

    // Manejar diferentes tipos de errores
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token no válido" });
    } else {
      return res.status(500).json({ message: "Error al verificar el token" });
    }
  }
};

export default auth;