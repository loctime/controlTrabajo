import Swal from 'sweetalert2';

// Configuración global de SweetAlert2
export const swalConfig = {
  confirmButtonColor: '#66bb6a',
  cancelButtonColor: '#f44336',
  customClass: {
    popup: 'scale-in',
    confirmButton: 'swal-button-confirm',
    cancelButton: 'swal-button-cancel',
  },
  buttonsStyling: true,
  showClass: {
    popup: 'scale-in'
  },
};

// Función helper para alertas consistentes
export const showAlert = {
  success: (title, text, options = {}) => Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#66bb6a',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'scale-in',
    },
    ...options
  }),

  error: (title, text, options = {}) => Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#66bb6a',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'scale-in',
    },
    ...options
  }),

  warning: (title, text, options = {}) => Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#66bb6a',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'scale-in',
    },
    ...options
  }),

  info: (title, text, options = {}) => Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#66bb6a',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'scale-in',
    },
    ...options
  }),

  confirm: (title, text, options = {}) => Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#66bb6a',
    cancelButtonColor: '#f44336',
    customClass: {
      popup: 'scale-in',
    },
    ...options
  }),

  loading: (title = 'Procesando...', text = 'Por favor espera') => Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  }),

  close: () => Swal.close(),
};

// Estilos CSS deshabilitados temporalmente para evitar conflictos
// const swalStyles = ``;

