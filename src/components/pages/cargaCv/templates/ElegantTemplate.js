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

export const generateElegantTemplate = async (cvData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores del tema elegante
  const primaryColor = '#2E5266'; // Azul oscuro elegante
  const secondaryColor = '#4A90A4'; // Azul medio
  const accentColor = '#7FB3D3'; // Azul claro
  const textColor = '#333333';
  const lightGray = '#F8F9FA';

  // Configuración de fuentes
  doc.setFont('helvetica');
  
  // === LEFT COLUMN (Color Background) ===
  let leftColumnWidth = pageWidth * 0.35; // 35% del ancho
  
  // Fondo de la columna izquierda
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, leftColumnWidth, pageHeight, 'F');
  
  let leftY = 20;

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // La imagen ya será circular, no necesitamos círculo de fondo
      
      // Intentar cargar imagen desde URL
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
      
      // Crear imagen completamente circular sin bordes
      ctx.save();
      
      // Crear máscara circular perfecta
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
      ctx.clip();
      
      // Dibujar imagen dentro del círculo
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
      
      ctx.restore();
      
      // Convertir canvas a base64 con transparencia y agregar al PDF
      const imgData = canvas.toDataURL('image/png'); // PNG para transparencia
      doc.addImage(imgData, 'PNG', leftColumnWidth/2 - 20, leftY - 5, 40, 40);
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil:', error);
      
      // Fallback: mostrar placeholder
      doc.setFillColor(primaryColor);
      doc.circle(leftColumnWidth/2, leftY + 20, 17, 'F');
      
      doc.setTextColor('#ffffff');
      doc.setFontSize(8);
      doc.text('FOTO', leftColumnWidth/2, leftY + 22, { align: 'center' });
    }
  } else {
    // Placeholder cuando no hay foto
    doc.setFillColor('#ffffff');
    doc.circle(leftColumnWidth/2, leftY + 20, 18, 'F');
    doc.setFillColor(primaryColor);
    doc.circle(leftColumnWidth/2, leftY + 20, 17, 'F');
    
    doc.setTextColor('#ffffff');
    doc.setFontSize(8);
    doc.text('FOTO', leftColumnWidth/2, leftY + 22, { align: 'center' });
  }

  leftY += 50;

  // === INFORMACIÓN DE CONTACTO ===
  doc.setTextColor('#ffffff');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACTO', 10, leftY);
  leftY += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const contactInfo = buildContactInfo(cvData);
  contactInfo.forEach(info => {
    const splitInfo = doc.splitTextToSize(info, leftColumnWidth - 20);
    doc.text(splitInfo, 10, leftY);
    leftY += splitInfo.length * 4;
  });
  
  leftY += 8;

  // === APTITUDES/HABILIDADES ===
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('APTITUDES', 10, leftY);
    leftY += 6;
    
    // Usar formato compacto para habilidades en sidebar (siempre comas para ahorrar espacio)
    const sidebarWidth = leftColumnWidth - 20;
    const aptitudesText = cvData.habilidades.map(h => h.nombre || h).join(', ');
    const splitAptitudes = doc.splitTextToSize(aptitudesText, sidebarWidth);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(splitAptitudes, 10, leftY);
    leftY += splitAptitudes.length * 3 + 3;
    
    leftY += 8;
  }

  // === IDIOMAS ===
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('IDIOMAS', 10, leftY);
    leftY += 6;
    
    // Usar formato compacto para idiomas en sidebar
    const sidebarWidth = leftColumnWidth - 20;
    const idiomasText = cvData.idiomas.map(i => {
      if (typeof i === 'object' && i.idioma) {
        return `${i.idioma} (${i.nivel})`;
      }
      return i;
    }).join(', ');
    const splitIdiomas = doc.splitTextToSize(idiomasText, sidebarWidth);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(splitIdiomas, 10, leftY);
    leftY += splitIdiomas.length * 3 + 3;
    
    leftY += 8;
  }

  // === RESUMEN PROFESIONAL ===
  if (cvData.perfilProfesional) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN PROFESIONAL', 10, leftY);
    leftY += 6;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const splitPerfil = doc.splitTextToSize(cvData.perfilProfesional, leftColumnWidth - 20);
    doc.text(splitPerfil, 10, leftY);
    leftY += splitPerfil.length * 3 + 8;
  }

  // === RIGHT COLUMN (White Background) ===
  let rightColumnX = leftColumnWidth + 10;
  let rightColumnWidth = pageWidth - leftColumnWidth - 20;
  let rightY = 20;

  // Función helper para resetear columnas en páginas adicionales
  const resetColumnsForNewPage = () => {
    leftColumnWidth = 0;
    rightColumnX = 15;
    rightColumnWidth = pageWidth - 30;
  };

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
    resetColumnsForNewPage();
    return startY;
  };

  // Nombre completo
  doc.setTextColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const fullName = `${cvData.Nombre || ''} ${cvData.Apellido || ''}`;
  const splitName = doc.splitTextToSize(fullName, rightColumnWidth);
  doc.text(splitName, rightColumnX, rightY);
  rightY += splitName.length * 6;

  // Edad (opcional, solo si está completada)
  if (cvData.Edad) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cvData.Edad} años`, rightColumnX, rightY);
    rightY += 8;
  }

  // Título profesional completo
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const splitTitle = doc.splitTextToSize(professionalTitle, rightColumnWidth);
    doc.text(splitTitle, rightColumnX, rightY);
    rightY += splitTitle.length * 5 + 5;
  }

  // === CERTIFICACIONES ===
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 40)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'CERTIFICACIONES', rightColumnX, rightY, textColor);
    addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);
    
    cvData.certificaciones.forEach((cert) => {
      // Verificar overflow antes de cada certificación
      if (checkPageOverflow(doc, rightY + 25)) {
        rightY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const splitCertNombre = doc.splitTextToSize(cert.nombre || '', rightColumnWidth);
      doc.text(splitCertNombre, rightColumnX, rightY);
      rightY += splitCertNombre.length * 4;
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      const splitCertInfo = doc.splitTextToSize(`${cert.institucion || ''} | ${cert.fecha || ''}`, rightColumnWidth);
      doc.text(splitCertInfo, rightColumnX, rightY);
      rightY += splitCertInfo.length * 4;
      
      // Agregar enlace si existe URL
      if (cert.url) {
        rightY += 4;
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'italic');
        doc.textWithLink('Ver certificado', rightColumnX, rightY, { url: cert.url, target: '_blank' });
      }
      
      rightY += 8;
    });
  }

  // === EDUCACIÓN ===
  if (cvData.educacion && cvData.educacion.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 40)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'EDUCACIÓN', rightColumnX, rightY, textColor);
    addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);
    
    cvData.educacion.forEach((edu) => {
      // Verificar overflow antes de cada educación
      if (checkPageOverflow(doc, rightY + 30)) {
        rightY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const splitEduTitulo = doc.splitTextToSize(edu.titulo || '', rightColumnWidth);
      doc.text(splitEduTitulo, rightColumnX, rightY);
      rightY += splitEduTitulo.length * 4;
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      const splitEduInfo = doc.splitTextToSize(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, rightColumnWidth);
      doc.text(splitEduInfo, rightColumnX, rightY);
      rightY += splitEduInfo.length * 4;
      
      if (edu.ubicacion) {
        rightY += 4;
        const splitEduUbicacion = doc.splitTextToSize(`Ubicación: ${edu.ubicacion}`, rightColumnWidth);
        doc.text(splitEduUbicacion, rightColumnX, rightY);
        rightY += splitEduUbicacion.length * 4;
      }
      
      if (edu.descripcion) {
        rightY += 4;
        const result = renderTextWithOverflow(doc, edu.descripcion, rightColumnX, rightY, rightColumnWidth - 10, 9);
        rightY = result !== null ? result : rightY + 20;
      }
      
      rightY += 8;
    });
  }

  // === EXPERIENCIA LABORAL ===
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 50)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'EXPERIENCIA LABORAL', rightColumnX, rightY, textColor);
    addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);

    cvData.experiencias.forEach((exp, index) => {
      // Verificar overflow antes de cada experiencia
      if (checkPageOverflow(doc, rightY + 40)) {
        rightY = addNewPageWithHeader(doc);
        // Agregar título de continuación si no es la primera experiencia
        if (index > 0) {
          rightY = addSectionTitle(doc, 'EXPERIENCIA LABORAL (cont.)', rightColumnX, rightY, textColor);
          addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);
        }
      }
      
      // Fechas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      doc.text(`${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, rightColumnX, rightY);
      
      // Cargo
      rightY += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor);
      const splitCargo = doc.splitTextToSize(exp.cargo || '', rightColumnWidth);
      doc.text(splitCargo, rightColumnX, rightY);
      rightY += splitCargo.length * 5;
      
      // Empresa
      rightY += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitEmpresa = doc.splitTextToSize(exp.empresa || '', rightColumnWidth);
      doc.text(splitEmpresa, rightColumnX, rightY);
      rightY += splitEmpresa.length * 4;
      
      // Ubicación
      if (exp.ubicacion) {
        rightY += 4;
        const splitUbicacion = doc.splitTextToSize(`Ubicación: ${exp.ubicacion}`, rightColumnWidth);
        doc.text(splitUbicacion, rightColumnX, rightY);
        rightY += splitUbicacion.length * 4;
      }
      
      // Descripción
      if (exp.descripcion) {
        rightY += 6;
        const result = renderTextWithOverflow(doc, exp.descripcion, rightColumnX, rightY, rightColumnWidth - 10, 9);
        if (result !== null) {
          rightY = result;
        } else {
          // Continuar en nueva página
          rightY = addNewPageWithHeader(doc);
          const result2 = renderTextWithOverflow(doc, exp.descripcion, rightColumnX, rightY, rightColumnWidth - 10, 9);
          rightY = result2 !== null ? result2 : rightY + 50;
        }
      }
      
      // Línea separadora entre experiencias
      if (index < cvData.experiencias.length - 1) {
        rightY += 8;
        addSeparatorLine(doc, rightColumnX, rightY, rightColumnWidth, '#EEEEEE', 0.3);
        rightY += 8;
      }
    });
  }

  // === PROYECTOS ===
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 40)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'PROYECTOS', rightColumnX, rightY, textColor);
    addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);

    cvData.proyectos.forEach((proyecto) => {
      // Verificar overflow antes de cada proyecto
      if (checkPageOverflow(doc, rightY + 30)) {
        rightY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', rightColumnX, rightY);
      
      rightY += 5;
      doc.setFont('helvetica', 'normal');
      if (proyecto.descripcion) {
        const result = renderTextWithOverflow(doc, proyecto.descripcion, rightColumnX, rightY, rightColumnWidth - 10, 9);
        rightY = result !== null ? result : rightY + 20;
      }
      
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, rightColumnX, rightY);
        rightY += 4;
      }
      
      if (proyecto.url) {
        doc.setTextColor(primaryColor);
        doc.textWithLink(`Ver proyecto: ${proyecto.url}`, rightColumnX, rightY, { url: proyecto.url, target: '_blank' });
        doc.setTextColor(textColor);
        rightY += 4;
      }
      
      rightY += 8;
    });
  }

  // === REFERENCIAS ===
  if (cvData.referencias && cvData.referencias.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, rightY + 40)) {
      rightY = addNewPageWithHeader(doc);
    }
    
    rightY = addSectionTitle(doc, 'REFERENCIAS', rightColumnX, rightY, textColor);
    addSeparatorLine(doc, rightColumnX, rightY - 2, rightColumnWidth, '#CCCCCC', 0.5);
    
    let refCurrentY = rightY;
    cvData.referencias.slice(0, 3).forEach((ref) => {
      // Verificar overflow antes de cada referencia
      if (checkPageOverflow(doc, refCurrentY + 20)) {
        refCurrentY = addNewPageWithHeader(doc);
      }
      
      // Solo renderizar si la referencia tiene datos
      if (ref && (ref.nombre || ref.cargo || ref.empresa)) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        
        if (ref.nombre) {
          doc.text(ref.nombre, rightColumnX, refCurrentY);
          refCurrentY += 4;
        }
        
        doc.setFont('helvetica', 'normal');
        if (ref.cargo && ref.empresa) {
          doc.text(`${ref.cargo} en ${ref.empresa}`, rightColumnX, refCurrentY);
          refCurrentY += 4;
        } else if (ref.cargo) {
          doc.text(ref.cargo, rightColumnX, refCurrentY);
          refCurrentY += 4;
        } else if (ref.empresa) {
          doc.text(ref.empresa, rightColumnX, refCurrentY);
          refCurrentY += 4;
        }
        
        if (ref.telefono) {
          doc.text(`Tel: ${ref.telefono}`, rightColumnX, refCurrentY);
        }
        if (ref.email) {
          doc.text(`Email: ${ref.email}`, rightColumnX + 40, refCurrentY);
        }
        if (ref.telefono || ref.email) {
          refCurrentY += 4;
        }
        
        refCurrentY += 8;
      }
    });
  }

  // === FOOTER FINAL ===
  addFooter(doc);

  return doc;
};