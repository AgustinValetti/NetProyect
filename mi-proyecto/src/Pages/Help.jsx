// src/Pages/Help.jsx
import React from 'react';


const Help = () => {
  return (
    <div className="page-content">
      <h1>Centro de ayuda</h1>
      <p>¿Necesitas ayuda? Contáctanos o revisa nuestras guías.</p>
      <ul>
        <li>
          <strong>Guía de inicio rápido</strong>
          <p>
            Sigue estos pasos para comenzar a usar nuestro servicio:
            <ol>
              <li>Regístrate o inicia sesión en tu cuenta.</li>
              <li>Explora nuestro catálogo de contenido.</li>
              <li>Selecciona el contenido que deseas ver y haz clic en "Reproducir".</li>
              <li>Configura tu perfil y preferencias en la sección "Mi cuenta".</li>
            </ol>
            Si tienes problemas, consulta nuestra sección de <a href="/faq">preguntas frecuentes</a>.
          </p>
        </li>

        <li>
          <strong>Solución de problemas</strong>
          <p>
            Si encuentras problemas técnicos, prueba lo siguiente:
            <ul>
              <li>
                <strong>Problemas de reproducción:</strong>
                <ol>
                  <li>Verifica tu conexión a internet.</li>
                  <li>Limpia la caché de tu navegador o aplicación.</li>
                  <li>Reinicia tu dispositivo.</li>
                </ol>
              </li>
              <li>
                <strong>Problemas de inicio de sesión:</strong>
                <ol>
                  <li>Asegúrate de que tu correo y contraseña sean correctos.</li>
                  <li>Usa la opción "Recuperar contraseña" si no puedes acceder.</li>
                  <li>Si el problema persiste, contáctanos.</li>
                </ol>
              </li>
            </ul>
          </p>
        </li>

        <li>
          <strong>Contactar soporte</strong>
          <p>
            Nuestro equipo de soporte está disponible para ayudarte. Puedes contactarnos de las siguientes maneras:
            <ul>
              <li>
                <strong>Correo electrónico:</strong> Envía un mensaje a soporte@miservicio.com.
              </li>
              <li>
                <strong>Teléfono:</strong> Llama al +1 234 567 890.
              </li>
              <li>
                <strong>Chat en vivo:</strong> Disponible en nuestra página de ayuda.
              </li>
            </ul>
            Horario de atención: Lunes a domingo, 24 horas al día.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Help;