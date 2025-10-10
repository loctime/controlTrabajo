import Swal from 'sweetalert2';

// Configuración global de SweetAlert2 mejorada
export const swalConfig = {
  confirmButtonColor: '#66bb6a',
  cancelButtonColor: '#f44336',
  buttonsStyling: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: 'Aceptar',
  customClass: {
    popup: 'swal-popup-custom',
    confirmButton: 'swal-button-confirm',
    cancelButton: 'swal-button-cancel',
    container: 'swal-container-custom'
  },
  showClass: {
    popup: 'swal-fade-in',
    backdrop: 'swal-fade-in'
  },
  hideClass: {
    popup: 'swal-fade-out',
    backdrop: 'swal-fade-out'
  }
};

// Función helper para alertas consistentes y más confiables
export const showAlert = {
  success: (title, text, options = {}) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#66bb6a',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      hideClass: {
        popup: 'swal-fade-out'
      },
      ...options
    });
  },

  error: (title, text, options = {}) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#66bb6a',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      hideClass: {
        popup: 'swal-fade-out'
      },
      ...options
    });
  },

  warning: (title, text, options = {}) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#66bb6a',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      hideClass: {
        popup: 'swal-fade-out'
      },
      ...options
    });
  },

  info: (title, text, options = {}) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#66bb6a',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      hideClass: {
        popup: 'swal-fade-out'
      },
      ...options
    });
  },

  confirm: (title, text, options = {}) => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#66bb6a',
      cancelButtonColor: '#f44336',
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm',
        cancelButton: 'swal-button-cancel'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      hideClass: {
        popup: 'swal-fade-out'
      },
      ...options
    });
  },

  loading: (title = 'Procesando...', text = 'Por favor espera') => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-custom'
      },
      showClass: {
        popup: 'swal-fade-in'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  close: () => {
    Swal.close();
  }
};

// Estilos CSS mejorados para SweetAlert2
const swalStyles = `
  .swal-popup-custom {
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
  }
  
  .swal-button-confirm {
    background-color: #66bb6a !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    padding: 10px 20px !important;
    font-size: 14px !important;
    transition: all 0.2s ease !important;
  }
  
  .swal-button-confirm:hover {
    background-color: #4caf50 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(102, 187, 106, 0.3) !important;
  }
  
  .swal-button-cancel {
    background-color: #f44336 !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    padding: 10px 20px !important;
    font-size: 14px !important;
    transition: all 0.2s ease !important;
  }
  
  .swal-button-cancel:hover {
    background-color: #d32f2f !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3) !important;
  }
  
  .swal-fade-in {
    animation: swalFadeIn 0.3s ease-out !important;
  }
  
  .swal-fade-out {
    animation: swalFadeOut 0.2s ease-in !important;
  }
  
  @keyframes swalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes swalFadeOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.8) translateY(-20px);
    }
  }
  
  .swal2-html-container {
    font-size: 16px !important;
    line-height: 1.5 !important;
  }
  
  .swal2-title {
    font-size: 24px !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin-bottom: 16px !important;
  }
  
  .swal2-icon {
    width: 64px !important;
    height: 64px !important;
  }
`;

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = swalStyles;
  document.head.appendChild(style);
}

