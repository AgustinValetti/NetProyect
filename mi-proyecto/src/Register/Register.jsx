// src/Register/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const checkToken = async () => {
        try {
          const response = await fetch("/api/auth/me", {
            headers: { "x-auth-token": token },
          });
          if (response.ok) navigate("/");
        } catch (error) {
          console.error("Error al verificar el token:", error);
        }
      };
      checkToken();
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (userData.password !== userData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Depuración de contraseña antes de enviar
    console.log("🔑 Contraseña ingresada:", userData.password);

    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };

    console.log("📦 Enviando datos:", payload);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 Código de estado:", response.status);

      const responseText = await response.text();
      console.log("📄 Respuesta completa:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log("📊 Datos parseados:", data);

        if (data.hashedPassword) {
          console.log("🔐 Contraseña hasheada recibida:", data.hashedPassword);
        }
      } catch (parseError) {
        console.error("❌ Error al parsear JSON:", parseError);
        data = { message: responseText || "Error desconocido del servidor" };
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario. Intenta de nuevo.");
      }

      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error) {
      console.error("⚠️ Error de registro:", error);
      setError(
        error.message === "Error desconocido del servidor"
          ? "Error del servidor. Intenta de nuevo más tarde."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Crear una cuenta</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
              placeholder="Tu nombre de usuario"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Registrando...
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <div className="social-buttons">
          <button className="social-button">Facebook</button>
          <button className="social-button">Twitter</button>
          <button className="social-button">Instagram</button>
        </div>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
          <button onClick={() => navigate("/")} className="back-button">
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;