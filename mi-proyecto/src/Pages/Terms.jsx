// src/Pages/Terms.jsx
import React from 'react';

const Terms = () => {
  return (
    <div className="page-content">
      <h1>Términos de uso</h1>
      <p>Lee nuestros términos y condiciones antes de usar el servicio.</p>
      <ul>
        <li>
          <strong>Uso aceptable</strong>
          <p>
            Al usar nuestro servicio, aceptas lo siguiente:
            <ul>
              <li>No utilizar el servicio para actividades ilegales o no autorizadas.</li>
              <li>No compartir tu cuenta con terceros.</li>
              <li>No intentar acceder a áreas restringidas del servicio sin autorización.</li>
              <li>No realizar acciones que puedan dañar la infraestructura del servicio.</li>
            </ul>
            Cualquier violación de estas normas puede resultar en la suspensión o cancelación de tu cuenta.
          </p>
        </li>

        <li>
          <strong>Derechos de propiedad intelectual</strong>
          <p>
            Todo el contenido disponible en nuestro servicio (videos, imágenes, texto, etc.) está protegido por derechos de autor y otras leyes de propiedad intelectual. Está estrictamente prohibido:
            <ul>
              <li>Copiar, distribuir o modificar el contenido sin autorización.</li>
              <li>Utilizar el contenido con fines comerciales sin nuestro consentimiento.</li>
              <li>Eliminar o alterar avisos de derechos de autor o marcas registradas.</li>
            </ul>
            Si deseas usar nuestro contenido de alguna manera, contáctanos en legal@miservicio.com.
          </p>
        </li>

        <li>
          <strong>Limitación de responsabilidad</strong>
          <p>
            Nuestro servicio se proporciona "tal cual" y no nos hacemos responsables de:
            <ul>
              <li>Daños directos, indirectos o consecuenciales derivados del uso del servicio.</li>
              <li>Interrupciones o fallos en el servicio debido a causas fuera de nuestro control.</li>
              <li>Contenido generado por usuarios que pueda ser ofensivo o inapropiado.</li>
            </ul>
            Nos esforzamos por ofrecer un servicio de alta calidad, pero no garantizamos que esté libre de errores o interrupciones.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Terms