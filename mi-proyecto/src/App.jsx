// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext"; // Importamos AuthProvider
import ProtectedRoute from "./ProtectedRoutes/ProtectedRouter.jsx";
import Navbar from "./Components/Navbar/Navbar";
import MovieSlider from "./Components/Carrousel/MovieSlider.jsx";
import MovieSearch from "./Components/Buscador/Buscador.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import Footer from "./Components/Footer/Footer.jsx";

// Importa los nuevos componentes para las páginas del footer
import Faq from "./Pages/Faq.jsx"; // Preguntas frecuentes
import Help from "./Pages/Help.jsx"; // Centro de ayuda
import Terms from "./Pages/Terms.jsx"; // Términos de uso
import Privacy from "./Pages/Privacy.jsx"; // Privacidad

// Importa el componente MovieList
import MovieList from "./Components/MovieList/MovieList.jsx";

// Importa los componentes para las páginas del menú desplegable
import MoviesPage from "./Pages/MoviesPage.jsx";
import SeriesPage from "./Pages/SeriesPage.jsx";
import ActorsPage from "./Pages/ActorsPage.jsx";
import WatchLaterPage from "./Pages/WatchLaterPage.jsx"; // Importamos WatchLaterPage

import "./index.css";
import "./Components/Buscador/Buscador.css";
import "./Components/MovieList/MovieList.css";
import "./App.css";

function App() {
  return (
    <AuthProvider> {/* Envolvemos la aplicación con AuthProvider */}
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Página principal (Pública) */}
            <Route
              path="/"
              element={
                <>
                  <MovieSlider />
                  <MovieSearch />
                  <MovieList /> {/* Integra MovieList aquí */}
                </>
              }
            />

            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas públicas para el footer */}
            <Route path="/faq" element={<Faq />} /> {/* Preguntas frecuentes */}
            <Route path="/help" element={<Help />} /> {/* Centro de ayuda */}
            <Route path="/terms" element={<Terms />} /> {/* Términos de uso */}
            <Route path="/privacy" element={<Privacy />} /> {/* Privacidad */}

            {/* Rutas públicas para el menú desplegable */}
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/actors" element={<ActorsPage />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/watchlater" element={<WatchLaterPage />} /> {/* Nueva ruta protegida */}
            </Route>
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;