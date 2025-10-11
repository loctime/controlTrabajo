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
  // Fondo con gradiente simulado usando múltiples rectángulos
  doc.setFillColor('#1e3a8a'); // Azul más oscuro
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setFillColor('#3b82f6'); // Azul medio
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setFillColor('#60a5fa'); // Azul más claro
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Línea decorativa en la parte inferior del header
  doc.setDrawColor('#ffffff');
  doc.setLineWidth(1);
  doc.line(0, 59, pageWidth, 59);

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // Crear círculo de fondo con sombra
      doc.setFillColor('#ffffff');
      doc.circle(25, 30, 22, 'F');
      doc.setFillColor('#f8fafc');
      doc.circle(25, 30, 20, 'F');
      
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
      
      // Convertir canvas a base64 y agregar al PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      doc.addImage(imgData, 'JPEG', 7, 12, 36, 36);
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil:', error);
      
      // Fallback: mostrar placeholder con mejor diseño
      doc.setFillColor('#ffffff');
      doc.circle(25, 30, 20, 'F');
      doc.setFillColor('#e5e7eb');
      doc.circle(25, 30, 18, 'F');
      
      doc.setTextColor('#6b7280');
      doc.setFontSize(9);
      doc.text('FOTO', 25, 33, { align: 'center' });
    }
  }

  // === HEADER CON TODO EL ANCHO ===
  
  // NOMBRE PRINCIPAL - Usando todo el ancho disponible
  doc.setTextColor('#ffffff');
  doc.setFontSize(30); // Más grande
  doc.setFont('helvetica', 'bold');
  const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
  const splitName = doc.splitTextToSize(fullName, pageWidth - 40); // Usar casi todo el ancho
  doc.text(splitName, 20, 20); // Empezar más a la izquierda
  
  // Calcular posición Y después del nombre
  let currentHeaderY = 20 + (splitName.length * 7);
  
  // SIN LÍNEA DECORATIVA - Para evitar que tape el texto
  currentHeaderY += 5;

  // EDAD - A la derecha, en la misma línea del nombre si cabe
  if (cvData.Edad) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#e2e8f0');
    doc.text(`${cvData.Edad} años`, pageWidth - 30, 25);
  }

  // TÍTULO PROFESIONAL - Usando todo el ancho
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 40);
    doc.text(splitTitle, 20, currentHeaderY);
    currentHeaderY += (splitTitle.length * 5) + 8;
  }

  // INFORMACIÓN DE CONTACTO - Usando todo el ancho
  doc.setFontSize(9);
  doc.setTextColor('#e2e8f0');
  const contactInfo = buildContactInfo(cvData);
  const contactText = contactInfo.join(' • ');
  const splitContact = doc.splitTextToSize(contactText, pageWidth - 40);
  doc.text(splitContact, 20, currentHeaderY);

  // === PERFIL PROFESIONAL ===
  let currentY = 75;
  if (cvData.perfilProfesional) {
    // Fondo gris claro para la sección
    doc.setFillColor('#f8fafc');
    doc.rect(15, currentY - 5, pageWidth - 30, 8, 'F');
    
    currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL', 15, currentY, primaryColor);
    
    // Establecer color oscuro para el texto del perfil profesional
    doc.setTextColor(textColor);
    const result = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
    if (result !== null) {
      currentY = result;
    } else {
      // Necesita nueva página
      currentY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL (cont.)', 15, currentY, primaryColor);
      // Establecer color oscuro para la continuación del texto
      doc.setTextColor(textColor);
      const result2 = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
      currentY = result2 !== null ? result2 : currentY + 50;
    }
    currentY += 15;
  }

  // === MAIN CONTENT (Two columns) ===
  // Ajustar anchos: izquierda 52%, derecha 45% (más espacio para habilidades)
  const leftColumnX = 15;
  const leftColumnWidth = pageWidth * 0.52;
  const rightColumnX = leftColumnWidth + 15;
  const rightColumnWidth = pageWidth * 0.45;

  // Función helper para agregar header consistente en páginas adicionales
  const addConsistentHeader = (doc, pageNumber) => {
    // Header con gradiente simulado
    doc.setFillColor('#1e3a8a');
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor('#3b82f6');
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Línea decorativa
    doc.setDrawColor('#ffffff');
    doc.setLineWidth(1);
    doc.line(0, 39, pageWidth, 39);
    
    // HEADER CONSISTENTE SIMPLE
    
    // Nombre principal - simple y limpio
    doc.setTextColor('#ffffff');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
    const splitHeaderName = doc.splitTextToSize(fullName, pageWidth - 60);
    doc.text(splitHeaderName, 15, 18);
    
    // Título profesional - debajo del nombre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#f1f5f9');
    const professionalTitle = buildProfessionalTitle(cvData);
    if (professionalTitle) {
      const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 60);
      doc.text(splitTitle, 15, 28);
    }
    
    // Número de página (opcional)
    if (pageNumber > 1) {
      doc.setFontSize(10);
      doc.text(`Página ${pageNumber}`, pageWidth - 30, 25);
    }
    
    return 50; // Retornar Y inicial para el contenido
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

  // === LEFT COLUMN ===
  
  // EXPERIENCIA LABORAL
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 50)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'EXPERIENCIA LABORAL', leftColumnX, currentY, primaryColor);

    cvData.experiencias.forEach((exp, index) => {
      // Verificar overflow antes de cada experiencia
      if (checkPageOverflow(doc, currentY + 40)) {
        currentY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const splitCargo = doc.splitTextToSize(exp.cargo || '', leftColumnWidth);
      doc.text(splitCargo, leftColumnX, currentY);
      currentY += splitCargo.length * 4;
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      const splitEmpresaInfo = doc.splitTextToSize(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, leftColumnWidth);
      doc.text(splitEmpresaInfo, leftColumnX, currentY);
      currentY += splitEmpresaInfo.length * 4;
      
      currentY += 4;
      if (exp.ubicacion) {
        const splitUbicacion = doc.splitTextToSize(`Ubicación: ${exp.ubicacion}`, leftColumnWidth);
        doc.text(splitUbicacion, leftColumnX, currentY);
        currentY += splitUbicacion.length * 4;
      }
      
      if (exp.descripcion) {
        // Establecer color del texto antes de renderizar
        doc.setTextColor(textColor);
        const result = renderTextWithOverflow(doc, exp.descripcion, leftColumnX, currentY, leftColumnWidth - 10, 9);
        if (result !== null) {
          currentY = result;
        } else {
          // Continuar en nueva página
          currentY = addNewPageWithHeader(doc);
          doc.setTextColor(textColor); // Establecer color en la nueva página
          const result2 = renderTextWithOverflow(doc, exp.descripcion, leftColumnX, currentY, leftColumnWidth - 10, 9);
          currentY = result2 !== null ? result2 : currentY + 50;
        }
      }
      currentY += 8;
    });
  }

  // EDUCACIÓN
  if (cvData.educacion && cvData.educacion.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 30)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'EDUCACIÓN', leftColumnX, currentY, primaryColor);

    cvData.educacion.forEach((edu) => {
      // Verificar overflow antes de cada educación
      if (checkPageOverflow(doc, currentY + 25)) {
        currentY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', leftColumnX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, leftColumnX, currentY);
      
      if (edu.ubicacion) {
        currentY += 4;
        doc.text(`Ubicación: ${edu.ubicacion}`, leftColumnX, currentY);
      }
      
      if (edu.descripcion) {
        currentY += 4;
        const result = renderTextWithOverflow(doc, edu.descripcion, leftColumnX, currentY, leftColumnWidth - 10, 9);
        currentY = result !== null ? result : currentY + 20;
      }
      
      currentY += 8;
    });
  }

  // === RIGHT COLUMN ===
  let rightY = 75;

  // HABILIDADES
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 30)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'HABILIDADES', rightColumnX, rightY, primaryColor);
    
    // Usar formato compacto para habilidades (siempre con comas para mejor aprovechamiento del espacio)
    const habilidadesText = cvData.habilidades.map(h => h.nombre || h).join(', ');
    const splitHabilidades = doc.splitTextToSize(habilidadesText, rightColumnWidth - 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(splitHabilidades, rightColumnX, rightY);
    rightY += splitHabilidades.length * 4 + 10; // Más espacio entre secciones
  }

  // IDIOMAS
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 25)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'IDIOMAS', rightColumnX, rightY, primaryColor);
    
    // Usar formato compacto para idiomas
    const idiomasText = cvData.idiomas.map(i => {
      if (typeof i === 'object' && i.idioma) {
        return `${i.idioma} (${i.nivel})`;
      }
      return i;
    }).join(', ');
    const splitIdiomas = doc.splitTextToSize(idiomasText, rightColumnWidth - 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(splitIdiomas, rightColumnX, rightY);
    rightY += splitIdiomas.length * 4 + 10; // Más espacio entre secciones
  }

  // CERTIFICACIONES
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 30)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'CERTIFICACIONES', rightColumnX, rightY, primaryColor);

    cvData.certificaciones.forEach((cert) => {
      // Verificar overflow antes de cada certificación
      if (checkPageOverflow(doc, rightY + 25)) {
        rightY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.nombre || '', rightColumnX, rightY);
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, rightColumnX, rightY);
      
      // Agregar enlace si existe URL
      if (cert.url) {
        rightY += 4;
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'italic');
        doc.textWithLink('Ver certificado', rightColumnX, rightY, { url: cert.url, target: '_blank' });
        doc.setTextColor(textColor);
      }
      
      rightY += 8;
    });
  }

  // === REFERENCIAS (nueva página si es necesario) ===
  if (cvData.referencias && cvData.referencias.length > 0) {
    const refY = Math.max(currentY, rightY) + 20;
    
    // Si no hay espacio suficiente, crear nueva página
    if (checkPageOverflow(doc, refY + 50)) {
      const newPageY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'REFERENCIAS', 15, newPageY, primaryColor);
    } else {
      currentY = addSectionTitle(doc, 'REFERENCIAS', 15, refY, primaryColor);
    }
    
    let refCurrentY = currentY;
    cvData.referencias.slice(0, 3).forEach((ref) => {
      // Verificar overflow antes de cada referencia
      if (checkPageOverflow(doc, refCurrentY + 20)) {
        refCurrentY = addNewPageWithHeader(doc);
      }
      
      // Solo renderizar si la referencia tiene datos
      if (ref && (ref.nombre || ref.cargo || ref.empresa)) {
        doc.setTextColor(textColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        if (ref.nombre) {
          doc.text(ref.nombre, 15, refCurrentY);
          refCurrentY += 4;
        }
        
        doc.setFont('helvetica', 'normal');
        if (ref.cargo && ref.empresa) {
          doc.text(`${ref.cargo} en ${ref.empresa}`, 15, refCurrentY);
          refCurrentY += 4;
        } else if (ref.cargo) {
          doc.text(ref.cargo, 15, refCurrentY);
          refCurrentY += 4;
        } else if (ref.empresa) {
          doc.text(ref.empresa, 15, refCurrentY);
          refCurrentY += 4;
        }
        
        if (ref.telefono) {
          doc.text(`Tel: ${ref.telefono}`, 15, refCurrentY);
        }
        if (ref.email) {
          doc.text(`Email: ${ref.email}`, 15 + 40, refCurrentY);
        }
        if (ref.telefono || ref.email) {
          refCurrentY += 4;
        }
        
        refCurrentY += 8;
      }
    });
  }

  // === PROYECTOS (nueva página si es necesario) ===
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    const projY = Math.max(currentY, rightY) + 20;
    
    // Si no hay espacio suficiente, crear nueva página
    if (checkPageOverflow(doc, projY + 40)) {
      const newPageY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'PROYECTOS', 15, newPageY, primaryColor);
    } else {
      currentY = addSectionTitle(doc, 'PROYECTOS', 15, projY, primaryColor);
    }

    cvData.proyectos.forEach((proyecto) => {
      // Verificar overflow antes de cada proyecto
      if (checkPageOverflow(doc, currentY + 30)) {
        currentY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', 15, currentY);
      
      currentY += 8; // Más espacio después del título del proyecto
      doc.setFont('helvetica', 'normal');
      if (proyecto.descripcion) {
        const result = renderTextWithOverflow(doc, proyecto.descripcion, 15, currentY, pageWidth - 30, 9);
        currentY = result !== null ? result : currentY + 20;
      }
      
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, 15, currentY);
        currentY += 4;
      }
      
      if (proyecto.url) {
        doc.setTextColor(primaryColor);
        doc.textWithLink(`Ver proyecto: ${proyecto.url}`, 15, currentY, { url: proyecto.url, target: '_blank' });
        doc.setTextColor(textColor);
        currentY += 4;
      }
      
      currentY += 8;
    });
  }

  // === FOOTER FINAL ===
  addFooter(doc);

  return doc;
};