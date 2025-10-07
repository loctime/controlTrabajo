# Configuración de EmailJS para el envío de correos

Para que el sistema de envío de correos funcione correctamente, debes seguir estos pasos para configurar EmailJS:

## 1. Crear una cuenta en EmailJS

1. Ve a [EmailJS](https://www.emailjs.com/) y regístrate para obtener una cuenta gratuita.
2. Inicia sesión en tu cuenta.

## 2. Configurar un servicio de correo electrónico

1. En el panel de EmailJS, ve a "Email Services" (Servicios de correo electrónico).
2. Haz clic en "Add New Service" (Agregar nuevo servicio).
3. Selecciona el proveedor de correo que deseas usar (Gmail, Outlook, etc.).
4. Sigue las instrucciones para conectar tu cuenta de correo.
5. Una vez configurado, anota el ID del servicio (service_xxxxxxx).

## 3. Crear plantillas de correo electrónico

### Plantilla para usuarios
1. Ve a "Email Templates" (Plantillas de correo electrónico).
2. Haz clic en "Create New Template" (Crear nueva plantilla).
3. Diseña la plantilla para los correos que se enviarán a los usuarios.
4. Asegúrate de incluir las siguientes variables en la plantilla:
   - `{{to_name}}`: Nombre del usuario
   - `{{to_email}}`: Correo electrónico del usuario
   - `{{message}}`: Mensaje personalizado
   - `{{subject}}`: Asunto del correo
5. Guarda la plantilla y anota su ID (template_xxxxxxx).

### Plantilla para administradores
1. Crea otra plantilla para los correos que se enviarán al administrador.
2. Incluye las mismas variables que en la plantilla de usuario.
3. Guarda la plantilla y anota su ID (template_xxxxxxx).

## 4. Configurar las variables de entorno

Edita el archivo `.env` en la raíz del proyecto y actualiza las siguientes variables con los valores que anotaste:

```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_USER_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_ADMIN_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=public_key_xxxxxxx
```

El `PUBLIC_KEY` lo puedes encontrar en la sección "Account" > "API Keys" de tu cuenta de EmailJS.

## 5. Reiniciar la aplicación

Después de configurar las variables de entorno, reinicia la aplicación para que los cambios surtan efecto.

## Limitaciones del plan gratuito

Ten en cuenta que el plan gratuito de EmailJS tiene un límite de 200 correos electrónicos por mes. Si necesitas enviar más correos, considera actualizar a un plan de pago.
