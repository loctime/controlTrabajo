import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  checkPageOverflow, 
  addNewPage, 
  addFooter, 
  renderCompactList,
  addSectionTitle,
  addSeparatorLine,
  buildContactInfo,
  buildProfessionalTitle,
  renderTextWithOverflow
} from './templateUtils';

export const generateClassicTemplate = (cvData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores del tema clásico
  const primaryColor = '#424242';
  const secondaryColor = '#666666';
  const lightGray = '#f5f5f5';

  // Configuración de fuentes
  doc.setFont('helvetica');
  let currentY = 20;

  // Función helper para agregar header consistente en páginas adicionales
  const addConsistentHeader = (doc, pageNumber) => {
    // Header con color de marca
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Nombre y apellidos
    doc.setTextColor('#ffffff');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, 15, 20);
    
    // Título profesional
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const professionalTitle = buildProfessionalTitle(cvData);
    if (professionalTitle) {
      doc.text(professionalTitle, 15, 30);
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

  // === HEADER SECTION ===
  // Línea superior
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(2);
  doc.line(15, 15, pageWidth - 15, 15);

  // Nombre completo
  doc.setTextColor(primaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, 15, currentY);
  currentY += 8;

  // Edad (opcional, solo si está completada)
  if (cvData.Edad) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cvData.Edad} años`, 15, currentY);
    currentY += 5;
  }

  // Título profesional completo
  const professionalTitle = buildProfessionalTitle(cvData);
  if (professionalTitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(professionalTitle, 15, currentY);
    currentY += 5;
  }

  // Información de contacto completa
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactInfo = buildContactInfo(cvData);
  doc.text(contactInfo.join(' • '), 15, currentY);
  currentY += 15;

  // === PERFIL PROFESIONAL ===
  if (cvData.perfilProfesional) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 30)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);
    
    const result = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
    if (result !== null) {
      currentY = result;
    } else {
      // Necesita nueva página
      currentY = addNewPageWithHeader(doc);
      currentY = addSectionTitle(doc, 'PERFIL PROFESIONAL (cont.)', 15, currentY, primaryColor);
      addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);
      const result2 = renderTextWithOverflow(doc, cvData.perfilProfesional, 15, currentY, pageWidth - 30, 10, false);
      currentY = result2 !== null ? result2 : currentY + 50;
    }
    currentY += 15;
  }

  // === EXPERIENCIA LABORAL ===
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 50)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'EXPERIENCIA LABORAL', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    cvData.experiencias.forEach((exp, index) => {
      // Verificar overflow antes de cada experiencia
      if (checkPageOverflow(doc, currentY + 40)) {
        currentY = addNewPageWithHeader(doc);
        // Agregar título de continuación si no es la primera experiencia
        if (index > 0) {
          currentY = addSectionTitle(doc, 'EXPERIENCIA LABORAL (cont.)', 15, currentY, primaryColor);
          addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);
        }
      }
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.cargo || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, 15, currentY);
      
      currentY += 5;
      if (exp.ubicacion) {
        doc.text(`Ubicación: ${exp.ubicacion}`, 15, currentY);
        currentY += 5;
      }
      
      if (exp.descripcion) {
        const result = renderTextWithOverflow(doc, exp.descripcion, 15, currentY, pageWidth - 30, 9);
        if (result !== null) {
          currentY = result;
        } else {
          // Continuar en nueva página
          currentY = addNewPageWithHeader(doc);
          const result2 = renderTextWithOverflow(doc, exp.descripcion, 15, currentY, pageWidth - 30, 9);
          currentY = result2 !== null ? result2 : currentY + 50;
        }
      }
      
      // Línea separadora entre experiencias
      if (index < cvData.experiencias.length - 1) {
        currentY += 5;
        addSeparatorLine(doc, 15, currentY, pageWidth - 30, '#EEEEEE', 0.2);
        currentY += 5;
      }
    });
    currentY += 10;
  }

  // === EDUCACIÓN ===
  if (cvData.educacion && cvData.educacion.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 40)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'FORMACIÓN ACADÉMICA', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    cvData.educacion.forEach((edu) => {
      // Verificar overflow antes de cada educación
      if (checkPageOverflow(doc, currentY + 30)) {
        currentY = addNewPageWithHeader(doc);
      }
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, 15, currentY);
      
      if (edu.ubicacion) {
        currentY += 4;
        doc.text(`Ubicación: ${edu.ubicacion}`, 15, currentY);
      }
      
      if (edu.descripcion) {
        currentY += 4;
        const result = renderTextWithOverflow(doc, edu.descripcion, 15, currentY, pageWidth - 30, 9);
        currentY = result !== null ? result : currentY + 20;
      }
      
      currentY += 8;
    });
    currentY += 5;
  }

  // === HABILIDADES ===
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 40)) {
      currentY = addNewPage(doc);
    }
    
    currentY = addSectionTitle(doc, 'COMPETENCIAS TÉCNICAS', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    // Agrupar habilidades por nivel
    const habilidadesPorNivel = {};
    cvData.habilidades.forEach(skill => {
      if (!habilidadesPorNivel[skill.nivel]) {
        habilidadesPorNivel[skill.nivel] = [];
      }
      habilidadesPorNivel[skill.nivel].push(skill.nombre);
    });

    Object.entries(habilidadesPorNivel).forEach(([nivel, habilidades]) => {
      // Verificar overflow antes de cada nivel
      if (checkPageOverflow(doc, currentY + 20)) {
        currentY = addNewPage(doc);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${nivel}:`, 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      
      // Usar formato compacto si hay muchas habilidades
      if (habilidades.length > 10) {
        currentY = renderCompactList(doc, habilidades, 20, currentY, pageWidth - 50, 9);
      } else {
        doc.text(habilidades.join(' • '), 20, currentY);
        currentY += 8;
      }
    });
    currentY += 5;
  }

  // === IDIOMAS ===
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 30)) {
      currentY = addNewPageWithHeader(doc);
    }
    
    currentY = addSectionTitle(doc, 'IDIOMAS', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    // Usar formato compacto para idiomas si son muchos
    if (cvData.idiomas.length > 5) {
      const idiomasText = cvData.idiomas.map(idioma => `${idioma.idioma} (${idioma.nivel})`);
      currentY = renderCompactList(doc, idiomasText, 15, currentY, pageWidth - 30, 9);
    } else {
      cvData.idiomas.forEach((idioma) => {
        // Verificar overflow antes de cada idioma
        if (checkPageOverflow(doc, currentY + 15)) {
          currentY = addNewPage(doc);
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${idioma.idioma}:`, 15, currentY);
        
        currentY += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(idioma.nivel, 40, currentY);
        currentY += 6;
      });
    }
    currentY += 5;
  }

  // === CERTIFICACIONES ===
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 40)) {
      currentY = addNewPage(doc);
    }
    
    currentY = addSectionTitle(doc, 'CERTIFICACIONES', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    cvData.certificaciones.forEach((cert) => {
      // Verificar overflow antes de cada certificación
      if (checkPageOverflow(doc, currentY + 25)) {
        currentY = addNewPage(doc);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.nombre || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, 15, currentY);
      
      // Agregar enlace si existe URL
      if (cert.url) {
        currentY += 4;
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'italic');
        doc.textWithLink('Ver certificado', 15, currentY, { url: cert.url, target: '_blank' });
        doc.setTextColor('#424242');
        doc.setFont('helvetica', 'normal');
      }
      
      currentY += 8;
    });
    currentY += 5;
  }

  // === PROYECTOS ===
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 40)) {
      currentY = addNewPage(doc);
    }
    
    currentY = addSectionTitle(doc, 'PROYECTOS DESTACADOS', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);

    cvData.proyectos.forEach((proyecto) => {
      // Verificar overflow antes de cada proyecto
      if (checkPageOverflow(doc, currentY + 30)) {
        currentY = addNewPage(doc);
      }
      
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
        doc.setTextColor('#424242');
        currentY += 4;
      }
      
      currentY += 8;
    });
    currentY += 5;
  }

  // === REFERENCIAS ===
  if (cvData.referencias && cvData.referencias.length > 0) {
    // Verificar si necesita nueva página
    if (checkPageOverflow(doc, currentY + 40)) {
      currentY = addNewPage(doc);
    }
    
    currentY = addSectionTitle(doc, 'REFERENCIAS', 15, currentY, primaryColor);
    
    // Línea debajo del título
    addSeparatorLine(doc, 15, currentY - 2, pageWidth - 30);
    
    let refCurrentY = currentY;
    cvData.referencias.slice(0, 3).forEach((ref) => {
      // Verificar overflow antes de cada referencia
      if (checkPageOverflow(doc, refCurrentY + 20)) {
        refCurrentY = addNewPage(doc);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(ref.nombre || '', 15, refCurrentY);
      
      refCurrentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${ref.cargo || ''} en ${ref.empresa || ''}`, 15, refCurrentY);
      
      refCurrentY += 4;
      if (ref.telefono) doc.text(`Tel: ${ref.telefono}`, 15, refCurrentY);
      if (ref.email) doc.text(`Email: ${ref.email}`, 15 + 40, refCurrentY);
      
      refCurrentY += 8;
    });
  }

  // === FOOTER FINAL ===
  addFooter(doc);

  return doc;
};