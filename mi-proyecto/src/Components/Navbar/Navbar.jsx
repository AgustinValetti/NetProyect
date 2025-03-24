// src/Components/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('🔍 Navbar renderizado con user:', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Contenedor para navbar-brand y navbar-center */}
      <div className="navbar-left">
        <div className="navbar-brand">
          <Link to="/">Frame By Frame</Link>
        </div>

        {/* Menú desplegable */}
        <div className="navbar-center">
          <div className="dropdown">
            <span className="dropdown-toggle">Explorar</span>
            <div className="dropdown-menu">
              <Link to="/movies" className="dropdown-item">Películas</Link>
              <Link to="/series" className="dropdown-item">Series</Link>
              <Link to="/actors" className="dropdown-item">Actores</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <span className="welcome-message">Hola, {user?.username}</span>
            <Link to="/profile" className="navbar-item">Perfil</Link>
            <button onClick={handleLogout} className="logout-button">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">Iniciar sesión</Link>
            <Link to="/register" className="navbar-item">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;