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
  doc.setFillColor('#1e3a8a'); // Azul más oscuro - base unificado
  doc.rect(0, 0, pageWidth, 65, 'F');
  doc.setFillColor('#3b82f6'); // Azul medio
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setFillColor('#60a5fa'); // Azul claro - para el gradiente superior
  doc.rect(0, 0, pageWidth, 30, 'F');

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
      
      // La imagen ya será circular, no necesitamos círculos de fondo
      
      // Cargar imagen desde URL
      const img = await loadImageFromUrl(cvData.Foto);
      
      // Crear canvas para procesar la imagen como círculo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 144; // Aumentar resolución para mejor calidad (4x más resolución)
      canvas.width = size;
      canvas.height = size;
      
      // Calcular dimensiones con recorte inteligente centrado (crop to fill)
      const imgAspect = img.width / img.height;
      let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
      
      if (imgAspect > 1) {
        // Imagen más ancha que alta - recortar los lados para centrar
        const cropWidth = img.height; // Hacer cuadrada
        sourceX = (img.width - cropWidth) / 2;
        sourceWidth = cropWidth;
      } else {
        // Imagen más alta que ancha - recortar arriba y abajo para centrar
        const cropHeight = img.width; // Hacer cuadrada
        sourceY = (img.height - cropHeight) / 2;
        sourceHeight = cropHeight;
      }
      
      // Crear imagen circular sin fondo blanco
      ctx.save();
      
      // Crear máscara circular perfecta
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
      ctx.clip();
      
      // Dibujar imagen dentro del círculo
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
      
      ctx.restore();
      
      // Crear borde circular sutil
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Convertir canvas a base64 y agregar al PDF (posicionado en el círculo de la plantilla)
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // Mejorar calidad de 0.8 a 0.95
      doc.addImage(imgData, 'JPEG', -10, 0, 60, 60); // Posición en el círculo de la plantilla (20, 30)
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil:', error);
      
      // Fallback: mostrar placeholder circular simple
      doc.setFillColor('#e5e7eb');
      doc.circle(20, 30, 30, 'F');
      
      doc.setTextColor('#6b7280');
      doc.setFontSize(8);
      doc.text('FOTO', 20, 33, { align: 'center' });
    }
  }

  // === HEADER CON TODO EL ANCHO ===
  
  // NOMBRE PRINCIPAL - Posicionado para no tapar la foto y quedar en el color claro
  doc.setTextColor('#ffffff');
  doc.setFontSize(32); // Más grande para mejor legibilidad
  doc.setFont('helvetica', 'bold');
  const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
  // Ajustar ancho para dejar espacio a la foto (que está en x=4, ancho=32, más margen)
  const splitName = doc.splitTextToSize(fullName, pageWidth - 55); 
  doc.text(splitName, 50, 15); // Un poco más abajo para quedar en el color claro
  
  // Calcular posición Y después del nombre (ajustado para márgenes más estrechos)
  let currentHeaderY = 15 + (splitName.length * 8); // Más espacio para fuente más grande
  
  // SIN LÍNEA DECORATIVA - Para evitar que tape el texto
  currentHeaderY += 5;

  // EDAD - A la derecha, en la misma línea del nombre si cabe
  if (cvData.Edad) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#e2e8f0');
    doc.text(`${cvData.Edad} años`, pageWidth - 25, 21);
  }

  // TÍTULO PROFESIONAL - Posicionado en el color medio (después de y=30)
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 55);
    // Asegurar que esté en el color medio (después de y=30)
    const titleY = Math.max(currentHeaderY, 32);
    doc.text(splitTitle, 50, titleY);
    currentHeaderY = titleY + (splitTitle.length * 6) + 8;
  }

  // INFORMACIÓN DE CONTACTO - Posicionado en el color oscuro (después de y=45)
  doc.setFontSize(10);
  doc.setTextColor('#e2e8f0');
  const contactInfo = buildContactInfo(cvData);
  const contactText = contactInfo.join(' • ');
  const splitContact = doc.splitTextToSize(contactText, pageWidth - 55);
  // Asegurar que esté en el color oscuro (después de y=45)
  const contactY = Math.max(currentHeaderY, 47);
  doc.text(splitContact, 50, contactY);

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

  // === MAIN CONTENT (Layout simplificado) ===
  // Usar todo el ancho disponible para mejor aprovechamiento del espacio
  const contentX = 10;
  const contentWidth = pageWidth - 20;
  
  // Variable para controlar la posición Y - usar currentY del perfil profesional
  let contentY = currentY;

  // Función para verificar si hay espacio suficiente en la página actual
  const hasSpaceForContent = (contentHeight) => {
    const availableSpace = pageHeight - contentY - 30; // 30px para footer
    return availableSpace >= contentHeight;
  };

  // Función para agregar nueva página cuando sea necesario
  const addNewPageIfNeeded = (doc, contentHeight) => {
    if (!hasSpaceForContent(contentHeight)) {
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    return contentY;
  };

  // Función para verificar si hay suficiente espacio para una sección completa
  const hasSpaceForSection = (sectionName, estimatedContentHeight = 50) => {
    // Calcular altura del título (aproximadamente 15px)
    const titleHeight = 15;
    const totalNeededHeight = titleHeight + estimatedContentHeight;
    const availableSpace = pageHeight - contentY - 30; // 30px para footer
    return availableSpace >= totalNeededHeight;
  };

  // Función más inteligente que evalúa si vale la pena crear nueva página
  const shouldCreateNewPage = (sectionName, estimatedContentHeight = 50, isCompact = false) => {
    const titleHeight = 15;
    const totalNeededHeight = titleHeight + estimatedContentHeight;
    const availableSpace = pageHeight - contentY - 30;
    
    // Si hay suficiente espacio, no crear nueva página
    if (availableSpace >= totalNeededHeight) {
      return false;
    }
    
    // Para secciones compactas (habilidades, idiomas), ser más permisivo
    if (isCompact) {
      // Solo crear nueva página si queda menos del 20% del espacio de la página
      const spacePercentage = availableSpace / (pageHeight - 30);
      if (spacePercentage > 0.2 && estimatedContentHeight <= 40) {
        return false; // Hay suficiente espacio para secciones pequeñas
      }
    }
    
    // Para secciones grandes, ser más estricto
    if (estimatedContentHeight > 60) {
      // Solo crear nueva página si queda menos del 30% del espacio
      const spacePercentage = availableSpace / (pageHeight - 30);
      return spacePercentage < 0.3;
    }
    
    return true; // Crear nueva página por defecto
  };

  // Función para agregar sección con verificación inteligente
  const addSectionWithSmartPaging = (doc, sectionName, renderFunction, estimatedHeight = 50) => {
    // Si no hay espacio suficiente para título + contenido mínimo, crear nueva página
    if (!hasSpaceForSection(sectionName, estimatedHeight)) {
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, sectionName, contentX, contentY, primaryColor);
    contentY = renderFunction(doc, contentX, contentY, contentWidth);
    return contentY;
  };

  // Función helper para agregar header consistente en páginas adicionales
  const addConsistentHeader = (doc, pageNumber) => {
    // Header con gradiente simulado (más compacto para páginas adicionales)
    doc.setFillColor('#1e3a8a');
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor('#3b82f6');
    doc.rect(0, 0, pageWidth, 32, 'F');
    doc.setFillColor('#60a5fa');
    doc.rect(0, 0, pageWidth, 24, 'F');
    
    // Línea decorativa
    doc.setDrawColor('#ffffff');
    doc.setLineWidth(0.8);
    doc.line(0, 39, pageWidth, 39);
    
    // Línea adicional sutil
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.5);
    doc.line(0, 38.5, pageWidth, 38.5);
    
    // HEADER CONSISTENTE SIMPLE
    
    // Nombre principal - simple y limpio (mejor centrado en header compacto)
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
    const splitHeaderName = doc.splitTextToSize(fullName, pageWidth - 50);
    doc.text(splitHeaderName, 10, 18); // Bajado de 15 a 18
    
    // Título profesional - debajo del nombre
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const professionalTitle = buildProfessionalTitle(cvData);
    if (professionalTitle) {
      const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 50);
      doc.text(splitTitle, 10, 31); // Bajado de 28 a 31
    }
    
    // Número de página (opcional)
    if (pageNumber > 1) {
      doc.setFontSize(8);
      doc.text(`Página ${pageNumber}`, pageWidth - 25, 29); // Bajado de 26 a 29
    }
    
    return 55; // Retornar Y inicial para el contenido (más separado del header)
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
    // Verificar si hay espacio para título + al menos una experiencia
    const estimatedHeight = 60; // Altura estimada para una experiencia
    if (!hasSpaceForSection('EXPERIENCIA LABORAL', estimatedHeight)) {
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'EXPERIENCIA LABORAL', contentX, contentY, primaryColor);

    cvData.experiencias.forEach((exp, index) => {
      // Verificar si necesitamos nueva página para cada experiencia
      if (contentY > pageHeight - 80) {
        addFooter(doc, `Página ${pageCounter}`);
        doc.addPage();
        pageCounter++;
        contentY = addConsistentHeader(doc, pageCounter);
      }

      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const splitCargo = doc.splitTextToSize(exp.cargo || '', contentWidth);
      doc.text(splitCargo, contentX, contentY);
      contentY += splitCargo.length * 4;
      
      contentY += 4;
      doc.setFont('helvetica', 'normal');
      const splitEmpresaInfo = doc.splitTextToSize(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, contentWidth);
      doc.text(splitEmpresaInfo, contentX, contentY);
      contentY += splitEmpresaInfo.length * 4;
      
      contentY += 4;
      if (exp.ubicacion) {
        const splitUbicacion = doc.splitTextToSize(`Ubicación: ${exp.ubicacion}`, contentWidth);
        doc.text(splitUbicacion, contentX, contentY);
        contentY += splitUbicacion.length * 4;
      }
      
      if (exp.descripcion) {
        doc.setTextColor(textColor);
        const result = renderTextWithOverflow(doc, exp.descripcion, contentX, contentY, contentWidth - 10, 9);
        contentY = result !== null ? result : contentY + 50;
      }
      contentY += 8;
    });
  }

  // EDUCACIÓN
  if (cvData.educacion && cvData.educacion.length > 0) {
    // Verificar si hay espacio para título + al menos una educación
    const estimatedHeight = 40; // Altura estimada para una educación
    if (!hasSpaceForSection('EDUCACIÓN', estimatedHeight)) {
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'EDUCACIÓN', contentX, contentY, primaryColor);

    cvData.educacion.forEach((edu) => {
      // Verificar si necesitamos nueva página para cada educación
      if (contentY > pageHeight - 80) {
        addFooter(doc, `Página ${pageCounter}`);
        doc.addPage();
        pageCounter++;
        contentY = addConsistentHeader(doc, pageCounter);
      }

      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', contentX, contentY);
      
      contentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, contentX, contentY);
      
      if (edu.ubicacion) {
        contentY += 4;
        doc.text(`Ubicación: ${edu.ubicacion}`, contentX, contentY);
      }
      
      if (edu.descripcion) {
        contentY += 4;
        const result = renderTextWithOverflow(doc, edu.descripcion, contentX, contentY, contentWidth - 10, 9);
        contentY = result !== null ? result : contentY + 20;
      }
      
      contentY += 8;
    });
  }

  // HABILIDADES
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    // Verificar si hay espacio para título + contenido de habilidades (sección compacta)
    const estimatedHeight = 30; // Altura estimada para habilidades
    if (shouldCreateNewPage('HABILIDADES', estimatedHeight, true)) { // true = isCompact
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'HABILIDADES', contentX, contentY, primaryColor);
    
    // Usar formato compacto para habilidades (siempre con comas para mejor aprovechamiento del espacio)
    const habilidadesText = cvData.habilidades.map(h => h.nombre || h).join(', ');
    const splitHabilidades = doc.splitTextToSize(habilidadesText, contentWidth - 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(splitHabilidades, contentX, contentY);
    contentY += splitHabilidades.length * 4 + 10; // Más espacio entre secciones
  }

  // IDIOMAS
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    // Verificar si hay espacio para título + contenido de idiomas (sección compacta)
    const estimatedHeight = 25; // Altura estimada para idiomas
    if (shouldCreateNewPage('IDIOMAS', estimatedHeight, true)) { // true = isCompact
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'IDIOMAS', contentX, contentY, primaryColor);
    
    // Usar formato compacto para idiomas
    const idiomasText = cvData.idiomas.map(i => {
      if (typeof i === 'object' && i.idioma) {
        return `${i.idioma} (${i.nivel})`;
      }
      return i;
    }).join(', ');
    const splitIdiomas = doc.splitTextToSize(idiomasText, contentWidth - 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(splitIdiomas, contentX, contentY);
    contentY += splitIdiomas.length * 4 + 10; // Más espacio entre secciones
  }

  // CERTIFICACIONES
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    // Verificar si hay espacio para título + al menos una certificación (sección mediana)
    const estimatedHeight = 25; // Altura estimada para una certificación
    if (shouldCreateNewPage('CERTIFICACIONES', estimatedHeight, true)) { // true = isCompact (certificaciones son compactas)
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'CERTIFICACIONES', contentX, contentY, primaryColor);

    cvData.certificaciones.forEach((cert) => {
      // Verificar si necesitamos nueva página para cada certificación
      if (contentY > pageHeight - 80) {
        addFooter(doc, `Página ${pageCounter}`);
        doc.addPage();
        pageCounter++;
        contentY = addConsistentHeader(doc, pageCounter);
      }

      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.nombre || '', contentX, contentY);
      
      contentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, contentX, contentY);
      
      // Agregar enlace si existe URL
      if (cert.url) {
        contentY += 4;
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'italic');
        doc.textWithLink('Ver certificado', contentX, contentY, { url: cert.url, target: '_blank' });
        doc.setTextColor(textColor);
      }
      
      contentY += 8;
    });
  }

  // REFERENCIAS
  if (cvData.referencias && cvData.referencias.length > 0) {
    // Verificar si hay espacio para título + al menos una referencia (sección mediana)
    const estimatedHeight = 25; // Altura estimada para una referencia
    if (shouldCreateNewPage('REFERENCIAS', estimatedHeight, true)) { // true = isCompact (referencias son compactas)
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'REFERENCIAS', contentX, contentY, primaryColor);
    
    cvData.referencias.slice(0, 3).forEach((ref) => {
      // Verificar si necesitamos nueva página para cada referencia
      if (contentY > pageHeight - 80) {
        addFooter(doc, `Página ${pageCounter}`);
        doc.addPage();
        pageCounter++;
        contentY = addConsistentHeader(doc, pageCounter);
      }

      // Solo renderizar si la referencia tiene datos
      if (ref && (ref.nombre || ref.cargo || ref.empresa)) {
        doc.setTextColor(textColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        if (ref.nombre) {
          doc.text(ref.nombre, contentX, contentY);
          contentY += 4;
        }
        
        doc.setFont('helvetica', 'normal');
        if (ref.cargo && ref.empresa) {
          doc.text(`${ref.cargo} en ${ref.empresa}`, contentX, contentY);
          contentY += 4;
        } else if (ref.cargo) {
          doc.text(ref.cargo, contentX, contentY);
          contentY += 4;
        } else if (ref.empresa) {
          doc.text(ref.empresa, contentX, contentY);
          contentY += 4;
        }
        
        if (ref.telefono) {
          doc.text(`Tel: ${ref.telefono}`, contentX, contentY);
        }
        if (ref.email) {
          doc.text(`Email: ${ref.email}`, contentX + 40, contentY);
        }
        if (ref.telefono || ref.email) {
          contentY += 4;
        }
        
        contentY += 8;
      }
    });
  }

  // PROYECTOS
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    // Verificar si hay espacio para título + al menos un proyecto
    const estimatedHeight = 50; // Altura estimada para un proyecto
    if (!hasSpaceForSection('PROYECTOS', estimatedHeight)) {
      addFooter(doc, `Página ${pageCounter}`);
      doc.addPage();
      pageCounter++;
      contentY = addConsistentHeader(doc, pageCounter);
    }
    
    contentY = addSectionTitle(doc, 'PROYECTOS', contentX, contentY, primaryColor);

    cvData.proyectos.forEach((proyecto) => {
      // Verificar si necesitamos nueva página para cada proyecto
      if (contentY > pageHeight - 80) {
        addFooter(doc, `Página ${pageCounter}`);
        doc.addPage();
        pageCounter++;
        contentY = addConsistentHeader(doc, pageCounter);
      }

      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', contentX, contentY);
      
      contentY += 8; // Más espacio después del título del proyecto
      doc.setFont('helvetica', 'normal');
      if (proyecto.descripcion) {
        const result = renderTextWithOverflow(doc, proyecto.descripcion, contentX, contentY, contentWidth - 10, 9);
        contentY = result !== null ? result : contentY + 20;
      }
      
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, contentX, contentY);
        contentY += 4;
      }
      
      if (proyecto.url) {
        doc.setTextColor(primaryColor);
        doc.textWithLink(`Ver proyecto: ${proyecto.url}`, contentX, contentY, { url: proyecto.url, target: '_blank' });
        doc.setTextColor(textColor);
        contentY += 4;
      }
      
      contentY += 8;
    });
  }

  // === FOOTER FINAL ===
  addFooter(doc);

  return doc;
};