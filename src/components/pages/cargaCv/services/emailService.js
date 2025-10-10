import emailjs from '@emailjs/browser';

// Verificar si EmailJS está configurado
export const isEmailConfigured = () => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const userTemplateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID;
  const adminTemplateId = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
  return serviceId && 
         userTemplateId && userTemplateId !== 'template_id_usuario' && 
         adminTemplateId && adminTemplateId !== 'template_id_admin' && 
         publicKey && publicKey !== 'public_key';
};

// Función para enviar correo electrónico al usuario
export const sendUserEmail = async (userEmail, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      message: 'Su registro ha sido realizado con éxito. Su CV está en revisión y pronto estará disponible.',
      subject: 'Registro exitoso en Bolsa de Trabajo CCF',
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    
    if (serviceId && templateId && publicKey) {
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      console.log('Correo enviado al usuario exitosamente');
    } else {
      console.log('Configuración de EmailJS no completada. Saltando envío de correo al usuario.');
    }
  } catch (error) {
    console.error('Error al enviar correo al usuario:', error);
  }
};

// Función para enviar correo electrónico al administrador
export const sendAdminEmail = async (cvData) => {
  try {
    const ubicacionCompleta = cvData.localidad 
      ? `${cvData.ciudad}, ${cvData.localidad}` 
      : cvData.ciudad;
    
    const templateParams = {
      to_email: 'ccariramallo@gmail.com',
      to_name: 'Administrador',
      message: `Hay un nuevo registro para aprobar:\n\nNombre: ${cvData.Nombre} ${cvData.Apellido}\nProfesión: ${cvData.categoriaGeneral}\nUbicación: ${ubicacionCompleta}\nEmail: ${cvData.Email}`,
      subject: 'Nuevo registro en Bolsa de Trabajo CCF',
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    
    if (serviceId && templateId && publicKey) {
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      console.log('Correo enviado al administrador exitosamente');
    } else {
      console.log('Configuración de EmailJS no completada. Saltando envío de correo al administrador.');
    }
  } catch (error) {
    console.error('Error al enviar correo al administrador:', error);
  }
};

// Función para enviar todos los correos
export const sendRegistrationEmails = async (cvData) => {
  try {
    if (!isEmailConfigured()) {
      console.log('EmailJS no está completamente configurado. No se enviarán correos.');
      console.log('Para configurar EmailJS, completa los valores en el archivo .env');
      return;
    }

    // Enviar correo al usuario
    await sendUserEmail(cvData.Email, cvData.Nombre);
    
    // Enviar correo al administrador
    await sendAdminEmail(cvData);
    
    console.log('Correos enviados exitosamente');
  } catch (error) {
    console.error('Error al enviar correos:', error);
    // Continuamos con el proceso aunque falle el envío de correos
  }
};


