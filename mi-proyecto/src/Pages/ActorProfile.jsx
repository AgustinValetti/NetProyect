import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ActorProfile.css';

const ActorProfile = () => {
  const { actorId } = useParams();
  const [actorData, setActorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5080/api/tmdb/person/${actorId}`
        );

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos del actor:', data);
        setActorData(data);
      } catch (error) {
        console.error('Error al obtener datos del actor:', error);
        setError('Error al cargar los datos del actor: ' + error.message);
      }
    };
    fetchActorData();
  }, [actorId]);

  if (error) return <p>{error}</p>;
  if (!actorData) return <p>Cargando...</p>;

  return (
    <div className="actor-profile">
      <div className="actor-header">
        {actorData.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w200${actorData.profile_path}`}
            alt={actorData.name}
            className="actor-photo"
          />
        ) : (
          <p>No hay foto disponible.</p>
        )}
        <div className="actor-info">
          <h1>{actorData.name}</h1>
          <p><strong>Fecha de nacimiento:</strong> {actorData.birthday || 'No disponible'}</p>
          <p><strong>Lugar de nacimiento:</strong> {actorData.place_of_birth || 'No disponible'}</p>
        </div>
      </div>
      <div className="actor-bio">
        <h2>Biografía</h2>
        <p>{actorData.biography || 'No hay biografía disponible.'}</p>
      </div>
      <div className="actor-credits">
        <h2>Películas y Series</h2>
        {actorData.credits?.cast?.length > 0 ? (
          <div className="credits-list">
            {actorData.credits.cast.map((credit) => (
              <div key={credit.id} className="credit-item">
                <div className="credit-poster">
                  {credit.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${credit.poster_path}`}
                      alt={credit.title || credit.name}
                      className="credit-poster-img"
                    />
                  ) : (
                    <div className="credit-poster-placeholder">
                      <p>No hay imagen</p>
                    </div>
                  )}
                </div>
                <div className="credit-info">
                  <h3>{credit.title || credit.name}</h3>
                  <p>({credit.release_date?.slice(0, 4) || 'Fecha desconocida'})</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay créditos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default ActorProfile;