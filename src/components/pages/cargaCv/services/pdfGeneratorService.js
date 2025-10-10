import { generateModernTemplate } from '../templates/ModernTemplate';
import { generateClassicTemplate } from '../templates/ClassicTemplate';

/**
 * Servicio principal para generar CVs en PDF
 */
export const pdfGeneratorService = {
  /**
   * Genera un CV en PDF usando la plantilla especificada
   * @param {Object} cvData - Datos del CV
   * @param {string} template - Plantilla a usar ('moderna' o 'clasica')
   * @returns {jsPDF} Documento PDF generado
   */
  generateCVPdf: (cvData, template = 'moderna') => {
    try {
      // Validar datos básicos
      if (!cvData || !cvData.Nombre || !cvData.Apellido) {
        throw new Error('Faltan datos básicos del CV (Nombre y Apellido son obligatorios)');
      }

      // Seleccionar plantilla
      let pdfDoc;
      switch (template) {
        case 'moderna':
          pdfDoc = generateModernTemplate(cvData);
          break;
        case 'clasica':
          pdfDoc = generateClassicTemplate(cvData);
          break;
        default:
          console.warn(`Plantilla '${template}' no reconocida, usando plantilla moderna por defecto`);
          pdfDoc = generateModernTemplate(cvData);
      }

      return pdfDoc;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new Error(`Error al generar el CV: ${error.message}`);
    }
  },

  /**
   * Descarga el PDF generado
   * @param {jsPDF} pdfDoc - Documento PDF
   * @param {string} filename - Nombre del archivo (opcional)
   */
  downloadPDF: (pdfDoc, filename = null) => {
    try {
      if (!pdfDoc) {
        throw new Error('No hay documento PDF para descargar');
      }

      const defaultFilename = `CV_${new Date().toISOString().split('T')[0]}.pdf`;
      const finalFilename = filename || defaultFilename;
      
      pdfDoc.save(finalFilename);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw new Error(`Error al descargar el CV: ${error.message}`);
    }
  },

  /**
   * Genera y descarga el CV en una sola operación
   * @param {Object} cvData - Datos del CV
   * @param {string} template - Plantilla a usar
   * @param {string} filename - Nombre del archivo (opcional)
   */
  generateAndDownload: (cvData, template = 'moderna', filename = null) => {
    try {
      const pdfDoc = pdfGeneratorService.generateCVPdf(cvData, template);
      
      // Generar nombre de archivo automático si no se proporciona
      if (!filename) {
        const name = `${cvData.Nombre || ''}_${cvData.Apellido || ''}`.replace(/\s+/g, '_');
        filename = `CV_${name}_${template}.pdf`;
      }
      
      pdfGeneratorService.downloadPDF(pdfDoc, filename);
      
      return pdfDoc;
    } catch (error) {
      console.error('Error en generateAndDownload:', error);
      throw error;
    }
  },

  /**
   * Obtiene el PDF como blob para envío o almacenamiento
   * @param {jsPDF} pdfDoc - Documento PDF
   * @returns {Blob} Blob del PDF
   */
  getPDFAsBlob: (pdfDoc) => {
    try {
      if (!pdfDoc) {
        throw new Error('No hay documento PDF');
      }

      return pdfDoc.output('blob');
    } catch (error) {
      console.error('Error al obtener PDF como blob:', error);
      throw new Error(`Error al procesar el PDF: ${error.message}`);
    }
  },

  /**
   * Obtiene el PDF como base64 para almacenamiento en base de datos
   * @param {jsPDF} pdfDoc - Documento PDF
   * @returns {string} Base64 del PDF
   */
  getPDFAsBase64: (pdfDoc) => {
    try {
      if (!pdfDoc) {
        throw new Error('No hay documento PDF');
      }

      return pdfDoc.output('datauristring');
    } catch (error) {
      console.error('Error al obtener PDF como base64:', error);
      throw new Error(`Error al procesar el PDF: ${error.message}`);
    }
  },

  /**
   * Valida los datos del CV antes de generar
   * @param {Object} cvData - Datos del CV
   * @returns {Object} Resultado de la validación
   */
  validateCVData: (cvData) => {
    const errors = [];
    const warnings = [];

    // Validaciones obligatorias
    if (!cvData.Nombre) errors.push('El nombre es obligatorio');
    if (!cvData.Apellido) errors.push('El apellido es obligatorio');
    if (!cvData.Email) errors.push('El email es obligatorio');
    if (!cvData.categoriaGeneral) errors.push('La categoría profesional es obligatoria');

    // Validaciones de experiencia
    if (!cvData.experiencias || cvData.experiencias.length === 0) {
      warnings.push('No se ha agregado ninguna experiencia laboral');
    } else {
      cvData.experiencias.forEach((exp, index) => {
        if (!exp.cargo) errors.push(`La experiencia ${index + 1} necesita un cargo`);
        if (!exp.empresa) errors.push(`La experiencia ${index + 1} necesita una empresa`);
        if (!exp.fechaInicio) errors.push(`La experiencia ${index + 1} necesita fecha de inicio`);
      });
    }

    // Validaciones de formato
    if (cvData.Email && !/\S+@\S+\.\S+/.test(cvData.Email)) {
      errors.push('El formato del email no es válido');
    }

    if (cvData.telefono && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(cvData.telefono)) {
      warnings.push('Verifica el formato del teléfono');
    }

    // Validaciones de URLs
    const urlFields = ['linkedin', 'sitioWeb'];
    urlFields.forEach(field => {
      if (cvData[field] && !cvData[field].startsWith('http')) {
        warnings.push(`El campo ${field} debería empezar con http:// o https://`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canGenerate: errors.length === 0
    };
  },

  /**
   * Obtiene información sobre las plantillas disponibles
   * @returns {Array} Lista de plantillas disponibles
   */
  getAvailableTemplates: () => {
    return [
      {
        id: 'moderna',
        name: 'Plantilla Moderna',
        description: 'Diseño contemporáneo con colores vibrantes y layout de dos columnas',
        icon: '🎨',
        suitableFor: ['Desarrolladores', 'Diseñadores', 'Marketing', 'Creativos']
      },
      {
        id: 'clasica',
        name: 'Plantilla Clásica',
        description: 'Formato tradicional y profesional, ideal para sectores corporativos',
        icon: '📄',
        suitableFor: ['Finanzas', 'Consultoría', 'Administración', 'Sectores tradicionales']
      }
    ];
  }
};

// Exportar funciones individuales para compatibilidad
export const generateCVPdf = pdfGeneratorService.generateCVPdf;
export const downloadPDF = pdfGeneratorService.downloadPDF;
export const generateAndDownload = pdfGeneratorService.generateAndDownload;
export const validateCVData = pdfGeneratorService.validateCVData;
