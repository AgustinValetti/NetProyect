// src/Pages/Privacy.jsx
import React from 'react';


const Privacy = () => {
  return (
    <div className="page-content">
      <h1>Privacidad</h1>
      <p>Entérate de cómo manejamos tus datos personales.</p>
      <ul>
        <li>
          <strong>Recopilación de datos</strong>
          <p>
            Recopilamos la siguiente información para mejorar tu experiencia:
            <ul>
              <li>
                <strong>Información personal:</strong> Nombre, correo electrónico, dirección y número de teléfono.
              </li>
              <li>
                <strong>Información de pago:</strong> Datos de tarjetas de crédito/débito o cuentas de PayPal.
              </li>
              <li>
                <strong>Datos de uso:</strong> Cómo interactúas con nuestro servicio (páginas visitadas, tiempo de uso, etc.).
              </li>
            </ul>
            Esta información se utiliza para procesar transacciones, personalizar tu experiencia y mejorar nuestros servicios.
          </p>
        </li>

        <li>
          <strong>Uso de cookies</strong>
          <p>
            Utilizamos cookies y tecnologías similares para:
            <ul>
              <li>Recordar tus preferencias y configuraciones.</li>
              <li>Analizar el tráfico y uso del sitio.</li>
              <li>Mostrar publicidad personalizada.</li>
            </ul>
            Puedes gestionar o desactivar las cookies desde la configuración de tu navegador.
          </p>
        </li>

        <li>
          <strong>Derechos del usuario</strong>
          <p>
            Como usuario, tienes los siguientes derechos sobre tus datos:
            <ul>
              <li>
                <strong>Acceso:</strong> Puedes solicitar una copia de los datos que tenemos sobre ti.
              </li>
              <li>
                <strong>Rectificación:</strong> Puedes corregir o actualizar tus datos personales.
              </li>
              <li>
                <strong>Eliminación:</strong> Puedes solicitar que eliminemos tus datos, salvo que debamos conservarlos por obligaciones legales.
              </li>
              <li>
                <strong>Oposición:</strong> Puedes oponerte al uso de tus datos para fines específicos, como marketing.
              </li>
            </ul>
            Para ejercer estos derechos, contáctanos en privacidad@miservicio.com.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Privacy;