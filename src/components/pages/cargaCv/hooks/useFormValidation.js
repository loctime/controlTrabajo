import { useState, useCallback } from 'react';

/**
 * Hook personalizado para validaciones del formulario de CV
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  /**
   * Valida un campo específico
   */
  const validateField = useCallback((fieldName, value, rules = {}) => {
    const fieldErrors = [];
    const fieldWarnings = [];

    // Reglas de validación
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      customValidation = null,
      email = false,
      url = false,
      phone = false,
      date = false
    } = rules;

    // Validación de campo obligatorio
    if (required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${fieldName} es obligatorio`);
    }

    // Validación de longitud mínima
    if (value && value.toString().length < minLength) {
      fieldErrors.push(`${fieldName} debe tener al menos ${minLength} caracteres`);
    }

    // Validación de longitud máxima
    if (value && value.toString().length > maxLength) {
      fieldErrors.push(`${fieldName} no puede tener más de ${maxLength} caracteres`);
    }

    // Validación de patrón (regex)
    if (value && pattern && !pattern.test(value)) {
      fieldErrors.push(`${fieldName} tiene un formato inválido`);
    }

    // Validación de email
    if (value && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldErrors.push(`${fieldName} debe ser un email válido`);
    }

    // Validación de URL
    if (value && url && !value.startsWith('http://') && !value.startsWith('https://')) {
      fieldWarnings.push(`${fieldName} debería empezar con http:// o https://`);
    }

    // Validación de teléfono
    if (value && phone && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(value)) {
      fieldWarnings.push(`${fieldName} debe ser un número de teléfono válido`);
    }

    // Validación de fecha (formato MM/YYYY)
    if (value && date && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
      fieldErrors.push(`${fieldName} debe tener el formato MM/YYYY`);
    }

    // Validación personalizada
    if (value && customValidation) {
      const customResult = customValidation(value);
      if (customResult && customResult.error) {
        fieldErrors.push(customResult.error);
      }
      if (customResult && customResult.warning) {
        fieldWarnings.push(customResult.warning);
      }
    }

    return {
      errors: fieldErrors,
      warnings: fieldWarnings
    };
  }, []);

  /**
   * Valida todo el formulario de CV
   */
  const validateForm = useCallback((cvData, mode = 'generator') => {
    const newErrors = {};
    const newWarnings = {};

    // Validaciones básicas obligatorias
    const basicFields = {
      Nombre: { required: true, minLength: 2, maxLength: 50 },
      Apellido: { required: true, minLength: 2, maxLength: 50 },
      Email: { required: true, email: true, maxLength: 100 },
      categoriaGeneral: { required: true, minLength: 2, maxLength: 100 }
    };

    Object.entries(basicFields).forEach(([field, rules]) => {
      const result = validateField(field, cvData[field], rules);
      if (result.errors.length > 0) {
        newErrors[field] = result.errors;
      }
      if (result.warnings.length > 0) {
        newWarnings[field] = result.warnings;
      }
    });

    // Validaciones específicas del modo generador
    if (mode === 'generator') {
      // Validar que haya al menos una experiencia
      if (!cvData.experiencias || cvData.experiencias.length === 0) {
        newErrors.experiencias = ['Debes agregar al menos una experiencia laboral'];
      } else {
        // Validar cada experiencia
        cvData.experiencias.forEach((exp, index) => {
          const expFields = {
            cargo: { required: true, minLength: 2, maxLength: 100 },
            empresa: { required: true, minLength: 2, maxLength: 100 },
            fechaInicio: { required: true, date: true },
            descripcion: { required: true, minLength: 20, maxLength: 500 }
          };

          Object.entries(expFields).forEach(([field, rules]) => {
            const result = validateField(
              `${field} (Experiencia ${index + 1})`,
              exp[field],
              rules
            );
            if (result.errors.length > 0) {
              newErrors[`experiencias_${index}_${field}`] = result.errors;
            }
          });

          // Validar fecha fin si no es trabajo actual
          if (!exp.esActual && exp.fechaFin) {
            const result = validateField(
              `Fecha fin (Experiencia ${index + 1})`,
              exp.fechaFin,
              { date: true }
            );
            if (result.errors.length > 0) {
              newErrors[`experiencias_${index}_fechaFin`] = result.errors;
            }
          }
        });
      }

      // Validar perfil profesional si existe
      if (cvData.perfilProfesional) {
        const result = validateField(
          'Perfil profesional',
          cvData.perfilProfesional,
          { maxLength: 300 }
        );
        if (result.warnings.length > 0) {
          newWarnings.perfilProfesional = result.warnings;
        }
      }

      // Validar certificaciones si existen
      if (cvData.certificaciones && cvData.certificaciones.length > 0) {
        cvData.certificaciones.forEach((cert, index) => {
          // Validar campos obligatorios de certificación
          const certFields = {
            nombre: { required: true, minLength: 2, maxLength: 100 },
            institucion: { required: true, minLength: 2, maxLength: 100 },
            fecha: { required: true, date: true }
          };

          Object.entries(certFields).forEach(([field, rules]) => {
            // Crear nombres de campo más descriptivos para los mensajes
            let fieldName = field;
            if (field === 'nombre') fieldName = 'Nombre de la certificación';
            else if (field === 'institucion') fieldName = 'Institución';
            else if (field === 'fecha') fieldName = 'Fecha de obtención';
            
            const result = validateField(
              `${fieldName} (Certificación ${index + 1})`,
              cert[field],
              rules
            );
            if (result.errors.length > 0) {
              newErrors[`certificaciones_${index}_${field}`] = result.errors;
            }
          });
          
          // Validar que cada certificación tenga al menos una forma de verificación (OPCIONAL - solo warning)
          if (!cert.url && !cert.archivoUrl) {
            newWarnings[`certificaciones_${index}_certificado`] = ['Se recomienda proporcionar una URL o subir un archivo del certificado para verificación'];
          }
        });
      }
    }

    // Validaciones opcionales con warnings
    const optionalFields = {
      telefono: { phone: true },
      linkedin: { url: true },
      sitioWeb: { url: true }
    };

    Object.entries(optionalFields).forEach(([field, rules]) => {
      if (cvData[field]) {
        const result = validateField(field, cvData[field], rules);
        if (result.warnings.length > 0) {
          newWarnings[field] = result.warnings;
        }
      }
    });

    // Validar habilidades si existen
    if (cvData.habilidades && cvData.habilidades.length > 0) {
      cvData.habilidades.forEach((skill, index) => {
        if (!skill.nombre || skill.nombre.trim() === '') {
          newErrors[`habilidades_${index}`] = ['El nombre de la habilidad es obligatorio'];
        }
      });
    }

    // Validar idiomas si existen
    if (cvData.idiomas && cvData.idiomas.length > 0) {
      cvData.idiomas.forEach((idioma, index) => {
        if (!idioma.idioma || idioma.idioma.trim() === '') {
          newErrors[`idiomas_${index}`] = ['El idioma es obligatorio'];
        }
      });
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
      warnings: newWarnings,
      errorCount: Object.values(newErrors).flat().length,
      warningCount: Object.values(newWarnings).flat().length
    };
  }, [validateField]);

  /**
   * Limpia los errores de un campo específico
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Limpia todos los errores y warnings
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  /**
   * Obtiene los errores de un campo específico
   */
  const getFieldErrors = useCallback((fieldName) => {
    return errors[fieldName] || [];
  }, [errors]);

  /**
   * Obtiene los warnings de un campo específico
   */
  const getFieldWarnings = useCallback((fieldName) => {
    return warnings[fieldName] || [];
  }, [warnings]);

  /**
   * Verifica si un campo tiene errores
   */
  const hasFieldError = useCallback((fieldName) => {
    return errors[fieldName] && errors[fieldName].length > 0;
  }, [errors]);

  /**
   * Obtiene un resumen de la validación
   */
  const getValidationSummary = useCallback(() => {
    const totalErrors = Object.values(errors).flat().length;
    const totalWarnings = Object.values(warnings).flat().length;

    return {
      isValid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      hasErrors: totalErrors > 0,
      hasWarnings: totalWarnings > 0
    };
  }, [errors, warnings]);

  return {
    errors,
    warnings,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    getFieldErrors,
    getFieldWarnings,
    hasFieldError,
    getValidationSummary
  };
};
