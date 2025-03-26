// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRouter.jsx";
import Navbar from "./Components/Navbar/Navbar";
import MovieSlider from "./Components/Carrousel/MovieSlider.jsx";
import MovieSearch from "./Components/Buscador/Buscador.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import Faq from "./Pages/Faq.jsx";
import Help from "./Pages/Help.jsx";
import Terms from "./Pages/Terms.jsx";
import Privacy from "./Pages/Privacy.jsx";
import MovieList from "./Components/MovieList/MovieList.jsx";
import MoviesPage from "./Pages/MoviesPage.jsx";
import SeriesPage from "./Pages/SeriesPage.jsx";
import ActorsPage from "./Pages/ActorsPage.jsx";
import ActorProfile from "./Pages/ActorProfile.jsx";

import "./index.css";
import "./Components/Buscador/Buscador.css";
import "./Components/MovieList/MovieList.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <MovieSlider />
                  <MovieSearch />
                  <MovieList />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/help" element={<Help />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/actors" element={<ActorsPage />} />
            <Route path="/actor/:actorId" element={<ActorProfile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;