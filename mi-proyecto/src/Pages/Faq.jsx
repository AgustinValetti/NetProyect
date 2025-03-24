const Faq = () => {
    return (
      <div className="page-content">
        <h1>Preguntas frecuentes</h1>
        <p>Aquí encontrarás respuestas a las preguntas más comunes.</p>
        <ul>
          <li>
            <strong>¿Cómo cancelo mi suscripción?</strong>
            <p>
              Para cancelar tu suscripción, sigue estos pasos:
              <ol>
                <li>Inicia sesión en tu cuenta.</li>
                <li>Ve a la sección "Configuración" o "Mi cuenta".</li>
                <li>Selecciona "Cancelar suscripción".</li>
                <li>Confirma la cancelación.</li>
              </ol>
              Recuerda que puedes volver a suscribirte en cualquier momento.
            </p>
          </li>
  
          <li>
            <strong>¿Qué métodos de pago aceptan?</strong>
            <p>
              Aceptamos los siguientes métodos de pago:
              <ul>
                <li>Tarjetas de crédito/débito (Visa, MasterCard, American Express).</li>
                <li>PayPal.</li>
                <li>Transferencia bancaria.</li>
              </ul>
              Si tienes problemas con tu pago, contáctanos en soporte@miservicio.com.
            </p>
          </li>
  
          <li>
            <strong>¿Cómo cambio mi contraseña?</strong>
            <p>
              Para cambiar tu contraseña:
              <ol>
                <li>Inicia sesión en tu cuenta.</li>
                <li>Ve a "Configuración de seguridad".</li>
                <li>Selecciona "Cambiar contraseña".</li>
                <li>Ingresa tu contraseña actual y la nueva contraseña.</li>
                <li>Guarda los cambios.</li>
              </ol>
              Si olvidaste tu contraseña, usa la opción "Recuperar contraseña" en la página de inicio de sesión.
            </p>
          </li>
  
          <li>
            <strong>¿Cómo contacto al soporte técnico?</strong>
            <p>
              Puedes contactar a nuestro soporte técnico de las siguientes maneras:
              <ul>
                <li>Envía un correo a soporte@miservicio.com.</li>
                <li>Llama al +1 234 567 890.</li>
                <li>Usa el chat en vivo disponible en nuestra página de ayuda.</li>
              </ul>
              Nuestro equipo está disponible las 24 horas del día.
            </p>
          </li>
  
          <li>
            <strong>¿Puedo ver contenido en múltiples dispositivos?</strong>
            <p>
              Sí, puedes ver contenido en hasta 3 dispositivos simultáneamente con una sola cuenta. Si necesitas más dispositivos, considera actualizar tu plan.
            </p>
          </li>
  
          <li>
            <strong>¿Qué hago si no puedo reproducir un video?</strong>
            <p>
              Si tienes problemas para reproducir un video, prueba lo siguiente:
              <ol>
                <li>Verifica tu conexión a internet.</li>
                <li>Limpia la caché de tu navegador o aplicación.</li>
                <li>Reinicia tu dispositivo.</li>
                <li>Si el problema persiste, contáctanos para obtener ayuda.</li>
              </ol>
            </p>
          </li>
        </ul>
      </div>
    );
  };
  
  export default Faq;