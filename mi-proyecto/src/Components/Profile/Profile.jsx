import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext.jsx";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5080";

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState(""); // Nuevo estado para el username
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }

      const data = await response.json();
      console.log("Datos del usuario:", data);
      setUserData(data);

      // Manejar el avatar según lo que devuelva el backend
      if (data.avatar) {
        const url = data.avatar.startsWith("http")
          ? data.avatar
          : `${API_URL}/uploads/avatars/${data.avatar}`;
        setAvatarPreview(url);
        console.log("URL del avatar al cargar:", url);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
      setError("No se pudieron cargar los datos. Intenta de nuevo.");
      logout();
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar la contraseña");
      }

      alert("Contraseña cambiada con éxito");
      setNewPassword("");
      setError("");
    } catch (err) {
      setError("Error al cambiar la contraseña: " + err.message);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/auth/change-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar el email");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      updateUser(updatedUser);
      alert("Email cambiado con éxito");
      setNewEmail("");
      setError("");
    } catch (err) {
      setError("Error al cambiar el email: " + err.message);
    }
  };

  // Nueva función para cambiar el nombre de usuario
  const handleChangeUsername = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validar el nuevo nombre de usuario
    if (!newUsername || newUsername.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/change-username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar el nombre de usuario");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      updateUser(updatedUser);
      alert("Nombre de usuario cambiado con éxito");
      setNewUsername("");
      setError("");
    } catch (err) {
      setError("Error al cambiar el nombre de usuario: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la cuenta");
      }

      alert("Cuenta eliminada con éxito");
      logout();
      navigate("/login");
    } catch (err) {
      setError("Error al eliminar la cuenta: " + err.message);
    }
  };

  const handleUploadAvatar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    // Validar el archivo antes de subirlo
    if (!avatarFile) {
      setError("Por favor, selecciona una imagen.");
      return;
    }

    if (!avatarFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPEG, PNG, GIF).");
      return;
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/upload-avatar`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir el avatar");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      // Actualizar userData y el contexto con el nuevo avatar
      const updatedUser = { ...userData, avatar: data.avatar };
      setUserData(updatedUser);
      updateUser(updatedUser);

      // Construir la URL del avatar
      const url = `${API_URL}/uploads/avatars/${data.avatar}`;
      setAvatarPreview(url);
      console.log("URL del avatar después de subir:", url);

      setError("");
      alert("Avatar actualizado con éxito");
    } catch (err) {
      setError("Error al subir el avatar: " + err.message);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Archivo seleccionado:", file);
    if (file) {
      setAvatarFile(file);
      setAva
tarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  if (loading) return <div className="loading-message">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="general-container">
      <div className="profile-card">
        <h1>Perfil de Usuario</h1>
        <p>Bienvenido a tu perfil, {userData?.username}!</p>

        {/* Sección del avatar */}
        <div className="avatar-section">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="avatar-preview"
              onError={(e) => console.error("Error al cargar la imagen:", e)}
            />
          ) : (
            <div className="avatar-placeholder">Sin avatar</div>
          )}
        </div>

        {/* Formulario para subir el avatar */}
        <form onSubmit={handleUploadAvatar} className="profile-form">
          <h3>Cambiar Avatar</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
          <button type="submit" disabled={uploading}>
            {uploading ? "Subiendo..." : "Subir Avatar"}
          </button>
        </form>

        {/* Formulario para cambiar el nombre de usuario */}
        <form onSubmit={handleChangeUsername} className="profile-form">
          <h3>Cambiar Nombre de Usuario</h3>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Nuevo nombre de usuario"
            required
          />
          <button type="submit">Cambiar Nombre de Usuario</button>
        </form>

        {/* Formulario para cambiar la contraseña */}
        <form onSubmit={handleChangePassword} className="profile-form">
          <h3>Cambiar Contraseña</h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            required
          />
          <button type="submit">Cambiar Contraseña</button>
        </form>

        {/* Formulario para cambiar el email */}
        <form onSubmit={handleChangeEmail} className="profile-form">
          <h3>Cambiar Email</h3>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Nuevo email"
            required
          />
          <button type="submit">Cambiar Email</button>
        </form>

        {/* Botón para eliminar la cuenta */}
        <button onClick={handleDeleteAccount} className="delete-button">
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
};

export default Profile;