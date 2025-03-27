// src/Components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa

  console.log('🔍 Navbar renderizado con user:', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Contenedor para navbar-brand y navbar-center */}
      <div className="navbar-left">
        <div className="navbar-brand">
          <Link to="/">Frame By Frame</Link>
        </div>

        {/* Botón hamburguesa para dispositivos móviles */}
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon">{isMenuOpen ? '✖' : '☰'}</span>
        </button>

        {/* Menú desplegable */}
        <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
          <div className="dropdown">
            <span className="dropdown-toggle">Explorar</span>
            <div className="dropdown-menu">
              <Link to="/movies" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                Películas
              </Link>
              <Link to="/series" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                Series
              </Link>
              <Link to="/actors" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                Actores
              </Link>
              {/* Nuevos enlaces */}
              {isAuthenticated && (
                <>
                  <Link to="/watch-later" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Ver Más Tarde
                  </Link>
                  <Link to="/favorite-actors" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Actores Favoritos
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de autenticación */}
      <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            <span className="welcome-message">Hola, {user?.username}</span>
            <Link to="/profile" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
              Perfil
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
              Iniciar sesión
            </Link>
            <Link to="/register" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;