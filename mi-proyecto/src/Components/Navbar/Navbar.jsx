import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Sección izquierda - Logo y Explorar */}
        <div className="navbar-left">
          <div className="navbar-brand">
            
            <Link to="/">Frame By Frame</Link>
          </div>

          <div className="navbar-center">
            <div className="dropdown">
              <span className="dropdown-toggle">Explorar</span>
              <div className="dropdown-menu">
                <Link to="/movies" className="dropdown-item">
                  Películas
                </Link>
                <Link to="/series" className="dropdown-item">
                  Series
                </Link>
                <Link to="/actors" className="dropdown-item">
                  Actores
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/watch-later" className="dropdown-item">
                      Ver Más Tarde
                    </Link>
                    <Link to="/favorite-actors" className="dropdown-item">
                      Actores Favoritos
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha - Auth */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <span className="welcome-message">Hola, {user?.username}</span>
              <Link to="/profile" className="navbar-item">
                Perfil
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">
                Iniciar sesión
              </Link>
              <Link to="/register" className="navbar-item">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;