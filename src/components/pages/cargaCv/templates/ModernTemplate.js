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
  
  // Colores del tema moderno
  const primaryColor = '#1976d2';
  const secondaryColor = '#42a5f5';
  const accentColor = '#bbdefb';
  const textColor = '#424242';
  const lightGray = '#f5f5f5';

  // Configuración de fuentes
  doc.setFont('helvetica');

  // === HEADER SECTION ===
  // Fondo azul del header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // Crear círculo de fondo blanco
      doc.setFillColor('#ffffff');
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
      
      // Fallback: mostrar placeholder
      doc.setFillColor(primaryColor);
      doc.circle(25, 30, 18, 'F');
      
      doc.setTextColor('#ffffff');
      doc.setFontSize(10);
      doc.text('FOTO', 25, 33, { align: 'center' });
    }
  }

  // Nombre y apellidos
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
  const splitName = doc.splitTextToSize(fullName, pageWidth - 120);
  doc.text(splitName, 60, 25);

  // Edad (opcional, solo si está completada)
  if (cvData.Edad) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cvData.Edad} años`, 60, 32);
  }

  // Título profesional completo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 120);
    doc.text(splitTitle, 60, cvData.Edad ? 39 : 35);
  }

  // Información de contacto completa
  doc.setFontSize(10);
  const contactInfo = buildContactInfo(cvData);
  const contactText = contactInfo.join(' • ');
  const contactY = cvData.Edad ? 46 : 42;
  const splitContact = doc.splitTextToSize(contactText, pageWidth - 120);
  doc.text(splitContact, 60, contactY);

  // === PERFIL PROFESIONAL ===
  let currentY = 75;
  if (cvData.perfilProfesional) {
    currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL', 15, currentY, primaryColor);
    
    const result = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
    if (result !== null) {
      currentY = result;
    } else {
      // Necesita nueva página
      currentY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL (cont.)', 15, currentY, primaryColor);
      const result2 = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
      currentY = result2 !== null ? result2 : currentY + 50;
    }
    currentY += 15;
  }

  // === MAIN CONTENT (Two columns) ===
  // Ajustar anchos: izquierda 58%, derecha 38%
  const leftColumnX = 15;
  const leftColumnWidth = pageWidth * 0.58;
  const rightColumnX = leftColumnWidth + 20;
  const rightColumnWidth = pageWidth * 0.38;

  // Función helper para agregar header consistente en páginas adicionales
  const addConsistentHeader = (doc, pageNumber) => {
    // Header con color de marca
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Nombre y apellidos
    doc.setTextColor('#ffffff');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
    const splitHeaderName = doc.splitTextToSize(fullName, pageWidth - 60);
    doc.text(splitHeaderName, 15, 20);
    
    // Título profesional
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const professionalTitle = buildProfessionalTitle(cvData);
    if (professionalTitle) {
      const splitTitle = doc.splitTextToSize(professionalTitle, pageWidth - 60);
      doc.text(splitTitle, 15, 30);
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
      doc.text(exp.cargo || '', leftColumnX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, leftColumnX, currentY);
      
      currentY += 4;
      if (exp.ubicacion) {
        doc.text(`Ubicación: ${exp.ubicacion}`, leftColumnX, currentY);
        currentY += 4;
      }
      
      if (exp.descripcion) {
        const result = renderTextWithOverflow(doc, exp.descripcion, leftColumnX, currentY, leftColumnWidth - 10, 9);
        if (result !== null) {
          currentY = result;
        } else {
          // Continuar en nueva página
          currentY = addNewPageWithHeader(doc);
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
    
    // Usar formato adaptativo para habilidades
    rightY = renderAdaptiveList(
      doc, 
      cvData.habilidades, 
      rightColumnX, 
      rightY, 
      rightColumnWidth - 10, 
      rightColumnWidth / 2 - 5
    );
  }

  // IDIOMAS
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 25)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'IDIOMAS', rightColumnX, rightY, primaryColor);
    
    // Usar formato adaptativo para idiomas
    rightY = renderAdaptiveList(
      doc, 
      cvData.idiomas, 
      rightColumnX, 
      rightY, 
      rightColumnWidth - 10, 
      rightColumnWidth / 2 - 5
    );
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
      
      currentY += 5;
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