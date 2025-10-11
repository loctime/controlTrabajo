/**
 * Utilidades comunes para la generación de templates de CV
 * Proporciona funciones para paginación, renderizado de listas y control de overflow
 */

// Función para detectar si necesitamos nueva página
export const checkPageOverflow = (doc, currentY, marginBottom = 30) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  return currentY > (pageHeight - marginBottom);
};

// Función para agregar nueva página con footer
export const addNewPage = (doc, footerText = 'CV generado automáticamente por BolsaTrabajo.com') => {
  addFooter(doc, footerText);
  doc.addPage();
  return 20; // Reset Y position
};

// Función para footer consistente
export const addFooter = (doc, text = '') => {
  if (!doc) return; // Validación básica
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const originalColor = doc.getTextColor();
  const originalFontSize = doc.getFontSize();
  
  doc.setTextColor('#666666');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Usar posición fija en lugar de calcular el ancho del texto
  // para evitar problemas con getTextWidth
  const centerX = pageWidth / 2 - 50; // Aproximadamente centrado
  doc.text(text, centerX, pageHeight - 10);
  
  // Restaurar configuración original
  doc.setTextColor(originalColor);
  doc.setFontSize(originalFontSize);
};

// Función para renderizar lista en 2 columnas
export const renderTwoColumnList = (doc, items, startX, startY, columnWidth, gap = 10, fontSize = 9, lineHeight = 4) => {
  if (!items || items.length === 0) return startY;
  
  const halfIndex = Math.ceil(items.length / 2);
  const column1 = items.slice(0, halfIndex);
  const column2 = items.slice(halfIndex);
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  
  let y1 = startY, y2 = startY;
  
  // Renderizar columna 1
  column1.forEach((item, i) => {
    if (typeof item === 'object' && item.nombre) {
      // Para habilidades con nivel
      doc.text(item.nombre, startX, y1);
    } else if (typeof item === 'object' && item.idioma) {
      // Para idiomas
      doc.text(`${item.idioma} - ${item.nivel}`, startX, y1);
    } else {
      doc.text(item, startX, y1);
    }
    y1 += lineHeight;
  });
  
  // Renderizar columna 2
  column2.forEach((item, i) => {
    if (typeof item === 'object' && item.nombre) {
      doc.text(item.nombre, startX + columnWidth + gap, y2);
    } else if (typeof item === 'object' && item.idioma) {
      doc.text(`${item.idioma} - ${item.nivel}`, startX + columnWidth + gap, y2);
    } else {
      doc.text(item, startX + columnWidth + gap, y2);
    }
    y2 += lineHeight;
  });
  
  return Math.max(y1, y2) + 5; // Retornar Y más bajo + margen
};

// Función para renderizar lista compacta con comas
export const renderCompactList = (doc, items, startX, startY, maxWidth, fontSize = 9) => {
  if (!items || items.length === 0) return startY;
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  
  let text;
  if (items[0] && typeof items[0] === 'object') {
    // Para habilidades o idiomas
    if (items[0].nombre) {
      text = items.map(item => item.nombre).join(', ');
    } else if (items[0].idioma) {
      text = items.map(item => `${item.idioma} (${item.nivel})`).join(', ');
    }
  } else {
    text = items.join(', ');
  }
  
  const splitText = doc.splitTextToSize(text, maxWidth);
  doc.text(splitText, startX, startY);
  return startY + (splitText.length * 4) + 5;
};

// Función para renderizar lista adaptativa (elige formato según cantidad de items)
export const renderAdaptiveList = (doc, items, startX, startY, maxWidth, columnWidth = null, gap = 10) => {
  if (!items || items.length === 0) return startY;
  
  if (items.length <= 6) {
    // Formato vertical normal
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    items.forEach((item, i) => {
      let text;
      if (typeof item === 'object' && item.nombre) {
        text = `${item.nombre} (${item.nivel})`;
      } else if (typeof item === 'object' && item.idioma) {
        text = `${item.idioma} - ${item.nivel}`;
      } else {
        text = item;
      }
      doc.text(text, startX, startY + (i * 4));
    });
    
    return startY + (items.length * 4) + 5;
    
  } else if (items.length <= 20 && columnWidth) {
    // Formato de 2 columnas
    return renderTwoColumnList(doc, items, startX, startY, columnWidth, gap);
    
  } else {
    // Formato compacto con comas
    return renderCompactList(doc, items, startX, startY, maxWidth);
  }
};

// Función para agregar sección con título
export const addSectionTitle = (doc, title, x, y, color = '#1976d2', fontSize = 12) => {
  // Validaciones básicas
  if (!doc || !title || typeof x !== 'number' || typeof y !== 'number') {
    console.warn('addSectionTitle: Invalid arguments', { doc: !!doc, title, x, y });
    return y || 0;
  }
  
  const originalColor = doc.getTextColor();
  const originalFontSize = doc.getFontSize();
  
  doc.setTextColor(color);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(String(title), x, y);
  
  // Restaurar configuración original
  doc.setTextColor(originalColor);
  doc.setFontSize(originalFontSize);
  
  return y + 8;
};

// Función para agregar línea separadora
export const addSeparatorLine = (doc, x, y, width, color = '#CCCCCC', lineWidth = 0.5) => {
  const originalColor = doc.getDrawColor();
  const originalLineWidth = doc.getLineWidth();
  
  doc.setDrawColor(color);
  doc.setLineWidth(lineWidth);
  doc.line(x, y, x + width, y);
  
  // Restaurar configuración original
  doc.setDrawColor(originalColor);
  doc.setLineWidth(originalLineWidth);
};

// Función para construir información de contacto completa
export const buildContactInfo = (cvData) => {
  const contactInfo = [];
  
  if (cvData.direccion) contactInfo.push(`Dirección: ${cvData.direccion}`);
  if (cvData.localidad) contactInfo.push(`${cvData.localidad}`);
  if (cvData.ciudad) contactInfo.push(`${cvData.ciudad}`);
  if (cvData.telefono) contactInfo.push(`Tel: ${cvData.telefono}`);
  if (cvData.Email) contactInfo.push(`Email: ${cvData.Email}`);
  if (cvData.linkedin) contactInfo.push('LinkedIn');
  if (cvData.sitioWeb) contactInfo.push(`Web: ${cvData.sitioWeb}`);
  
  return contactInfo;
};

// Función para construir título profesional completo
export const buildProfessionalTitle = (cvData) => {
  const parts = [];
  if (cvData.categoriaGeneral) parts.push(cvData.categoriaGeneral);
  if (cvData.categoriaEspecifica) parts.push(cvData.categoriaEspecifica);
  return parts.join(' - ');
};

// Función para limpiar texto de caracteres problemáticos
export const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remover caracteres de control
    .replace(/\u00A0/g, ' ') // Reemplazar espacios no rompibles
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
};

// Función para renderizar texto con control de overflow
export const renderTextWithOverflow = (doc, text, x, y, maxWidth, fontSize = 10, checkOverflow = true) => {
  if (!text) return y;
  
  // Limpiar el texto de caracteres problemáticos
  const cleanTextContent = cleanText(text);
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const originalFontSize = doc.getFontSize();
  const originalColor = doc.getTextColor();
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  // Preservar el color del texto
  doc.setTextColor(originalColor);
  
  const splitText = doc.splitTextToSize(cleanTextContent, maxWidth);
  const textHeight = splitText.length * 4;
  
  if (checkOverflow && y + textHeight > pageHeight - 30) {
    return null; // Indica que necesita nueva página
  }
  
  doc.text(splitText, x, y);
  return y + textHeight + 5;
};
