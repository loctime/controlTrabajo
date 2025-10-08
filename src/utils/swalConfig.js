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

// Estilos CSS adicionales para los botones de SweetAlert2
const swalStyles = `
  .swal2-popup {
    border-radius: 12px !important;
  }
  
  .swal2-confirm,
  .swal2-cancel {
    border-radius: 8px !important;
    padding: 10px 24px !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
  }

  .swal2-confirm:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.15) !important;
  }

  .swal2-cancel:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.15) !important;
  }
`;

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = swalStyles;
  document.head.appendChild(styleSheet);
}

