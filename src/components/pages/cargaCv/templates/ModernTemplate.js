import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDownloadUrl } from '../../../../lib/controlFileStorage';
import { 
  checkPageOverflow, 
  addNewPage, 
  addFooter, 
  renderAdaptiveList,
  addSectionTitle,
  addSeparatorLine,
  buildContactInfo,
  buildProfessionalTitle,
  renderTextWithOverflow
} from './templateUtils';

// Función auxiliar para cargar imagen desde URL usando ControlFile API
const loadImageFromUrl = async (imageUrl) => {
  try {
    console.log('📸 Cargando imagen usando ControlFile API:', imageUrl);
    
    // Usar getDownloadUrl para obtener la URL directa de descarga
    const downloadUrl = await getDownloadUrl(imageUrl);
    console.log('✅ URL de descarga obtenida para imagen:', downloadUrl);
    
    // Ahora cargar la imagen desde la URL directa
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Imagen cargada exitosamente:', downloadUrl);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error('❌ Error al cargar imagen desde URL directa:', error);
        reject(new Error('Error al cargar la imagen desde la URL de descarga'));
      };
      
      img.src = downloadUrl;
    });
    
  } catch (error) {
    console.error('❌ Error al obtener URL de descarga:', error);
    throw new Error(`No se pudo obtener la URL de descarga para la imagen: ${error.message}`);
  }
};

export const generateModernTemplate = async (cvData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores del tema moderno mejorado
  const primaryColor = '#1e40af';
  const secondaryColor = '#475569';
  const accentColor = '#3b82f6';
  const textColor = '#0f172a';
  const lightGray = '#f1f5f9';

  // Configuración de fuentes
  doc.setFont('helvetica');

  // === HEADER SECTION ===
  // Fondo con gradiente simulado usando múltiples rectángulos (más altura para todo el contenido)
  doc.setFillColor('#1e3a8a'); // Azul más oscuro - base
  doc.rect(0, 0, pageWidth, 65, 'F');
  doc.setFillColor('#2563eb'); // Azul medio - más vibrante
  doc.rect(0, 0, pageWidth, 55, 'F');
  doc.setFillColor('#3b82f6'); // Azul medio-claro - mejor contraste
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setFillColor('#60a5fa'); // Azul claro - para el gradiente superior
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Línea decorativa en la parte inferior del header (más sutil)
  doc.setDrawColor('#ffffff');
  doc.setLineWidth(0.8);
  doc.line(0, 64, pageWidth, 64);
  
  // Línea adicional sutil para mejor separación
  doc.setDrawColor('#e2e8f0');
  doc.setLineWidth(0.5);
  doc.line(0, 63.5, pageWidth, 63.5);

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // Crear círculo de fondo con sombra (ajustado para header más grande)
      doc.setFillColor('#ffffff');
      doc.circle(20, 30, 18, 'F');
      doc.setFillColor('#f8fafc');
      doc.circle(20, 30, 16, 'F');
      
      // Cargar imagen desde URL
      const img = await loadImageFromUrl(cvData.Foto);
      
      // Crear canvas para procesar la imagen como círculo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 36; // Tamaño de la imagen
      canvas.width = size;
      canvas.height = size;
      
      // Calcular dimensiones manteniendo aspecto ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = size / size; // 1:1 para círculo
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > canvasAspect) {
        // Imagen más ancha que alta
        drawHeight = size;
        drawWidth = size * imgAspect;
        offsetX = (size - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Imagen más alta que ancha
        drawWidth = size;
        drawHeight = size / imgAspect;
        offsetX = 0;
        offsetY = (size - drawHeight) / 2;
      }
      
      // Dibujar imagen circular manteniendo proporciones
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      // Convertir canvas a base64 y agregar al PDF (ajustado para header más grande)
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      doc.addImage(imgData, 'JPEG', 4, 14, 32, 32);
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil:', error);
      
      // Fallback: mostrar placeholder con mejor diseño (ajustado para header más grande)
      doc.setFillColor('#ffffff');
      doc.circle(20, 30, 16, 'F');
      doc.setFillColor('#e5e7eb');
      doc.circle(20, 30, 14, 'F');
      
      doc.setTextColor('#6b7280');
      doc.setFontSize(8);
      doc.text('FOTO', 20, 33, { align: 'center' });
    }
  }

  // === HEADER CON TODO EL ANCHO ===
  
  // NOMBRE PRINCIPAL - Usando todo el ancho disponible (márgenes más estrechos)
  doc.setTextColor('#ffffff');
  doc.setFontSize(32); // Más grande para mejor legibilidad
  doc.setFont('helvetica', 'bold');
  const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
  const splitName = doc.splitTextToSize(fullName, pageWidth - 45); // Usar casi todo el ancho
  doc.text(splitName, 15, 18); // Ajustado para el header más grande
  
  // Calcular posición Y después del nombre (ajustado para márgenes más estrechos)
  let currentHeaderY = 18 + (splitName.length * 8); // Más espacio para fuente más grande
  
  // SIN LÍNEA DECORATIVA - Para evitar que tape el texto
  currentHeaderY += 5;

  // EDAD - A la derecha, en la misma línea del nombre si cabe
  if (cvData.Edad) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#e2e8f0');
    doc.text(`${cvData.Edad} años`, pageWidth - 25, 25);
  }

  // TÍTULO PROFESIONAL - Usando todo el ancho
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 45);
    doc.text(splitTitle, 15, currentHeaderY);
    currentHeaderY += (splitTitle.length * 6) + 8;
  }

  // INFORMACIÓN DE CONTACTO - Usando todo el ancho (más grande y mejor espaciado)
  doc.setFontSize(10);
  doc.setTextColor('#e2e8f0');
  const contactInfo = buildContactInfo(cvData);
  const contactText = contactInfo.join(' • ');
  const splitContact = doc.splitTextToSize(contactText, pageWidth - 45);
  doc.text(splitContact, 15, currentHeaderY);

  // === PERFIL PROFESIONAL ===
  let currentY = 75; // Ajustado para el header más grande con más espacio
  if (cvData.perfilProfesional) {
    // Fondo gris claro para la sección (márgenes más estrechos)
    doc.setFillColor('#f8fafc');
    doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
    
    currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL', 10, currentY, primaryColor);
    
    // Establecer color oscuro para el texto del perfil profesional
    doc.setTextColor(textColor);
    const result = renderTextWithOverflow(doc, cvData.perfilProfesional, 10, currentY, pageWidth - 20, 10, false);
    if (result !== null) {
      currentY = result;
    } else {
      // Necesita nueva página
      currentY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL (cont.)', 10, currentY, primaryColor);
      // Establecer color oscuro para la continuación del texto
      doc.setTextColor(textColor);
      const result2 = renderTextWithOverflow(doc, cvData.perfilProfesional, 10, currentY, pageWidth - 20, 10, false);
      currentY = result2 !== null ? result2 : currentY + 50;
    }
    currentY += 15;
  }

  // === MAIN CONTENT (Flujo Continuo) ===
  // Distribución de columnas para flujo continuo (márgenes más estrechos)
  const leftColumnX = 10;
  const leftColumnWidth = pageWidth * 0.48;
  const rightColumnX = leftColumnWidth + 15;
  const rightColumnWidth = pageWidth * 0.47;
  
  // Variables para controlar el flujo continuo
  let leftY = currentY;
  let rightY = currentY;
  let currentColumn = 'left'; // 'left' o 'right'
  let columnSwitchThreshold = 80; // Píxeles desde el final de la página para cambiar de columna

  // Función para determinar la mejor columna para el contenido
  const getBestColumn = (contentHeight) => {
    const leftSpace = pageHeight - leftY - 30; // 30px para footer
    const rightSpace = pageHeight - rightY - 30;
    
    // Si la columna actual tiene espacio suficiente
    if (currentColumn === 'left' && leftSpace >= contentHeight) {
      return 'left';
    }
    if (currentColumn === 'right' && rightSpace >= contentHeight) {
      return 'right';
    }
    
    // Si ninguna columna tiene espacio, crear nueva página
    if (leftSpace < contentHeight && rightSpace < contentHeight) {
      return 'newpage';
    }
    
    // Cambiar a la columna con más espacio
    if (rightSpace > leftSpace) {
      return 'right';
    } else {
      return 'left';
    }
  };

  // Función para agregar nueva página con flujo continuo
  const addNewPageWithFlow = (doc) => {
    addFooter(doc, `Página ${pageCounter}`);
    doc.addPage();
    pageCounter++;
    addConsistentHeader(doc, pageCounter);
    
    // Resetear posiciones Y pero mantener la columna actual (márgenes más estrechos)
    leftY = 50;
    rightY = 50;
    
    return currentColumn === 'left' ? leftY : rightY;
  };

  // Función para renderizar contenido en la columna óptima
  const renderInOptimalColumn = (doc, content, contentHeight, renderFunction) => {
    const bestColumn = getBestColumn(contentHeight);
    
    if (bestColumn === 'newpage') {
      const newY = addNewPageWithFlow(doc);
      currentColumn = newY === leftY ? 'left' : 'right';
      
      // Determinar parámetros de columna según la columna actual
      if (currentColumn === 'left') {
        return renderFunction(doc, newY, leftColumnX, leftColumnWidth);
      } else {
        return renderFunction(doc, newY, rightColumnX, rightColumnWidth);
      }
    }
    
    if (bestColumn === 'right') {
      currentColumn = 'right';
      const result = renderFunction(doc, rightY, rightColumnX, rightColumnWidth);
      rightY = result;
      return result;
    } else {
      currentColumn = 'left';
      const result = renderFunction(doc, leftY, leftColumnX, leftColumnWidth);
      leftY = result;
      return result;
    }
  };

  // Función helper para agregar header consistente en páginas adicionales
  const addConsistentHeader = (doc, pageNumber) => {
    // Header con gradiente simulado (reducido para páginas adicionales)
    doc.setFillColor('#1e3a8a');
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor('#2563eb');
    doc.rect(0, 0, pageWidth, 38, 'F');
    doc.setFillColor('#3b82f6');
    doc.rect(0, 0, pageWidth, 32, 'F');
    
    // Línea decorativa
    doc.setDrawColor('#ffffff');
    doc.setLineWidth(0.8);
    doc.line(0, 44, pageWidth, 44);
    
    // Línea adicional sutil
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.5);
    doc.line(0, 43.5, pageWidth, 43.5);
    
    // HEADER CONSISTENTE SIMPLE
    
    // Nombre principal - simple y limpio (márgenes más estrechos)
    doc.setTextColor('#ffffff');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
    const splitHeaderName = doc.splitTextToSize(fullName, pageWidth - 50);
    doc.text(splitHeaderName, 10, 15);
    
    // Título profesional - debajo del nombre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const professionalTitle = buildProfessionalTitle(cvData);
    if (professionalTitle) {
      const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 50);
      doc.text(splitTitle, 10, 28);
    }
    
    // Número de página (opcional)
    if (pageNumber > 1) {
      doc.setFontSize(9);
      doc.text(`Página ${pageNumber}`, pageWidth - 25, 26);
    }
    
    return 50; // Retornar Y inicial para el contenido (más cerca del header)
  };

  // Función personalizada para agregar nueva página con header consistente
  let pageCounter = 1;
  const addNewPageWithHeader = (doc) => {
    pageCounter++;
    addFooter(doc);
    doc.addPage();
    const startY = addConsistentHeader(doc, pageCounter);
    return startY;
  };

  // === FLUJO CONTINUO ===
  
  // EXPERIENCIA LABORAL
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    const renderExperiencias = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'EXPERIENCIA LABORAL', columnX, startY, primaryColor);

      cvData.experiencias.forEach((exp, index) => {
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const splitCargo = doc.splitTextToSize(exp.cargo || '', columnWidth);
        doc.text(splitCargo, columnX, y);
        y += splitCargo.length * 4;
        
        y += 4;
        doc.setFont('helvetica', 'normal');
        const splitEmpresaInfo = doc.splitTextToSize(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, columnWidth);
        doc.text(splitEmpresaInfo, columnX, y);
        y += splitEmpresaInfo.length * 4;
        
        y += 4;
        if (exp.ubicacion) {
          const splitUbicacion = doc.splitTextToSize(`Ubicación: ${exp.ubicacion}`, columnWidth);
          doc.text(splitUbicacion, columnX, y);
          y += splitUbicacion.length * 4;
        }
        
        if (exp.descripcion) {
          doc.setTextColor(textColor);
          const result = renderTextWithOverflow(doc, exp.descripcion, columnX, y, columnWidth - 10, 9);
          y = result !== null ? result : y + 50;
        }
        y += 8;
      });
      
      return y;
    };

    // Estimar altura de contenido para experiencias
    const estimatedHeight = cvData.experiencias.length * 60 + 50; // Aproximación
    renderInOptimalColumn(doc, cvData.experiencias, estimatedHeight, renderExperiencias);
  }

  // EDUCACIÓN
  if (cvData.educacion && cvData.educacion.length > 0) {
    const renderEducacion = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'EDUCACIÓN', columnX, startY, primaryColor);

      cvData.educacion.forEach((edu) => {
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.titulo || '', columnX, y);
        
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, columnX, y);
        
        if (edu.ubicacion) {
          y += 4;
          doc.text(`Ubicación: ${edu.ubicacion}`, columnX, y);
        }
        
        if (edu.descripcion) {
          y += 4;
          const result = renderTextWithOverflow(doc, edu.descripcion, columnX, y, columnWidth - 10, 9);
          y = result !== null ? result : y + 20;
        }
        
        y += 8;
      });
      
      return y;
    };

    // Estimar altura de contenido para educación
    const estimatedHeight = cvData.educacion.length * 40 + 30;
    renderInOptimalColumn(doc, cvData.educacion, estimatedHeight, renderEducacion);
  }

  // HABILIDADES
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    const renderHabilidades = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'HABILIDADES', columnX, startY, primaryColor);
      
      // Usar formato compacto para habilidades (siempre con comas para mejor aprovechamiento del espacio)
      const habilidadesText = cvData.habilidades.map(h => h.nombre || h).join(', ');
      const splitHabilidades = doc.splitTextToSize(habilidadesText, columnWidth - 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.text(splitHabilidades, columnX, y);
      y += splitHabilidades.length * 4 + 10; // Más espacio entre secciones
      
      return y;
    };

    // Estimar altura de contenido para habilidades
    const estimatedHeight = 30;
    renderInOptimalColumn(doc, cvData.habilidades, estimatedHeight, renderHabilidades);
  }

  // IDIOMAS
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    const renderIdiomas = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'IDIOMAS', columnX, startY, primaryColor);
      
      // Usar formato compacto para idiomas
      const idiomasText = cvData.idiomas.map(i => {
        if (typeof i === 'object' && i.idioma) {
          return `${i.idioma} (${i.nivel})`;
        }
        return i;
      }).join(', ');
      const splitIdiomas = doc.splitTextToSize(idiomasText, columnWidth - 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.text(splitIdiomas, columnX, y);
      y += splitIdiomas.length * 4 + 10; // Más espacio entre secciones
      
      return y;
    };

    // Estimar altura de contenido para idiomas
    const estimatedHeight = 25;
    renderInOptimalColumn(doc, cvData.idiomas, estimatedHeight, renderIdiomas);
  }

  // CERTIFICACIONES
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    const renderCertificaciones = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'CERTIFICACIONES', columnX, startY, primaryColor);

      cvData.certificaciones.forEach((cert) => {
        doc.setTextColor(textColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(cert.nombre || '', columnX, y);
        
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, columnX, y);
        
        // Agregar enlace si existe URL
        if (cert.url) {
          y += 4;
          doc.setTextColor(secondaryColor);
          doc.setFont('helvetica', 'italic');
          doc.textWithLink('Ver certificado', columnX, y, { url: cert.url, target: '_blank' });
          doc.setTextColor(textColor);
        }
        
        y += 8;
      });
      
      return y;
    };

    // Estimar altura de contenido para certificaciones
    const estimatedHeight = cvData.certificaciones.length * 25 + 30;
    renderInOptimalColumn(doc, cvData.certificaciones, estimatedHeight, renderCertificaciones);
  }

  // REFERENCIAS
  if (cvData.referencias && cvData.referencias.length > 0) {
    const renderReferencias = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'REFERENCIAS', columnX, startY, primaryColor);
      
      cvData.referencias.slice(0, 3).forEach((ref) => {
        // Solo renderizar si la referencia tiene datos
        if (ref && (ref.nombre || ref.cargo || ref.empresa)) {
          doc.setTextColor(textColor);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          
          if (ref.nombre) {
            doc.text(ref.nombre, columnX, y);
            y += 4;
          }
          
          doc.setFont('helvetica', 'normal');
          if (ref.cargo && ref.empresa) {
            doc.text(`${ref.cargo} en ${ref.empresa}`, columnX, y);
            y += 4;
          } else if (ref.cargo) {
            doc.text(ref.cargo, columnX, y);
            y += 4;
          } else if (ref.empresa) {
            doc.text(ref.empresa, columnX, y);
            y += 4;
          }
          
          if (ref.telefono) {
            doc.text(`Tel: ${ref.telefono}`, columnX, y);
          }
          if (ref.email) {
            doc.text(`Email: ${ref.email}`, columnX + 40, y);
          }
          if (ref.telefono || ref.email) {
            y += 4;
          }
          
          y += 8;
        }
      });
      
      return y;
    };

    // Estimar altura de contenido para referencias
    const estimatedHeight = Math.min(cvData.referencias.length, 3) * 25 + 30;
    renderInOptimalColumn(doc, cvData.referencias, estimatedHeight, renderReferencias);
  }

  // PROYECTOS
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    const renderProyectos = (doc, startY, columnX, columnWidth) => {
      let y = addSectionTitle(doc, 'PROYECTOS', columnX, startY, primaryColor);

      cvData.proyectos.forEach((proyecto) => {
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(proyecto.nombre || '', columnX, y);
        
        y += 8; // Más espacio después del título del proyecto
        doc.setFont('helvetica', 'normal');
        if (proyecto.descripcion) {
          const result = renderTextWithOverflow(doc, proyecto.descripcion, columnX, y, columnWidth - 10, 9);
          y = result !== null ? result : y + 20;
        }
        
        if (proyecto.tecnologias) {
          doc.text(`Tecnologías: ${proyecto.tecnologias}`, columnX, y);
          y += 4;
        }
        
        if (proyecto.url) {
          doc.setTextColor(primaryColor);
          doc.textWithLink(`Ver proyecto: ${proyecto.url}`, columnX, y, { url: proyecto.url, target: '_blank' });
          doc.setTextColor(textColor);
          y += 4;
        }
        
        y += 8;
      });
      
      return y;
    };

    // Estimar altura de contenido para proyectos
    const estimatedHeight = cvData.proyectos.length * 50 + 40;
    renderInOptimalColumn(doc, cvData.proyectos, estimatedHeight, renderProyectos);
  }

  // === FOOTER FINAL ===
  addFooter(doc);

  return doc;
};