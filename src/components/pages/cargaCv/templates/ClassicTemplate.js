import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // Información de contacto en una línea
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactInfo = [];
  if (cvData.Email) contactInfo.push(cvData.Email);
  if (cvData.telefono) contactInfo.push(cvData.telefono);
  if (cvData.ciudad) contactInfo.push(cvData.ciudad);
  if (cvData.linkedin) contactInfo.push('LinkedIn');
  if (cvData.sitioWeb) contactInfo.push(cvData.sitioWeb);

  doc.text(contactInfo.join(' • '), 15, currentY);
  currentY += 15;

  // === PERFIL PROFESIONAL ===
  if (cvData.perfilProfesional) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFIL PROFESIONAL', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitPerfil = doc.splitTextToSize(cvData.perfilProfesional, pageWidth - 30);
    doc.text(splitPerfil, 15, currentY);
    currentY += splitPerfil.length * 4 + 15;
  }

  // === EXPERIENCIA LABORAL ===
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERIENCIA LABORAL', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.experiencias.forEach((exp, index) => {
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.cargo || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, 15, currentY);
      
      currentY += 5;
      if (exp.ubicacion) {
        doc.text(exp.ubicacion, 15, currentY);
        currentY += 5;
      }
      
      if (exp.descripcion) {
        const splitDesc = doc.splitTextToSize(exp.descripcion, pageWidth - 30);
        doc.text(splitDesc, 15, currentY);
        currentY += splitDesc.length * 3.5 + 5;
      }
      
      // Línea separadora entre experiencias
      if (index < cvData.experiencias.length - 1) {
        doc.setLineWidth(0.2);
        doc.line(15, currentY, pageWidth - 15, currentY);
        currentY += 5;
      }
    });
    currentY += 10;
  }

  // === EDUCACIÓN ===
  if (cvData.educacion && cvData.educacion.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMACIÓN ACADÉMICA', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.educacion.forEach((edu) => {
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, 15, currentY);
      
      if (edu.ubicacion) {
        currentY += 4;
        doc.text(edu.ubicacion, 15, currentY);
      }
      
      currentY += 8;
    });
    currentY += 5;
  }

  // === HABILIDADES ===
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPETENCIAS TÉCNICAS', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    // Agrupar habilidades por nivel
    const habilidadesPorNivel = {};
    cvData.habilidades.forEach(skill => {
      if (!habilidadesPorNivel[skill.nivel]) {
        habilidadesPorNivel[skill.nivel] = [];
      }
      habilidadesPorNivel[skill.nivel].push(skill.nombre);
    });

    Object.entries(habilidadesPorNivel).forEach(([nivel, habilidades]) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${nivel}:`, 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(habilidades.join(' • '), 20, currentY);
      currentY += 8;
    });
    currentY += 5;
  }

  // === IDIOMAS ===
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IDIOMAS', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.idiomas.forEach((idioma) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idioma.idioma}:`, 15, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(idioma.nivel, 40, currentY);
      currentY += 6;
    });
    currentY += 5;
  }

  // === CERTIFICACIONES ===
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICACIONES', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.certificaciones.forEach((cert) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.nombre || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, 15, currentY);
      currentY += 8;
    });
    currentY += 5;
  }

  // === PROYECTOS ===
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROYECTOS DESTACADOS', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.proyectos.forEach((proyecto) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, 15, currentY);
        currentY += 5;
      }
      
      if (proyecto.descripcion) {
        const splitDesc = doc.splitTextToSize(proyecto.descripcion, pageWidth - 30);
        doc.text(splitDesc, 15, currentY);
        currentY += splitDesc.length * 3.5 + 5;
      }
      
      if (proyecto.url) {
        doc.setTextColor(primaryColor);
        doc.text(`🔗 Ver proyecto: ${proyecto.url}`, 15, currentY);
        doc.setTextColor(primaryColor);
        currentY += 5;
      }
    });
    currentY += 5;
  }

  // === REFERENCIAS ===
  if (cvData.referencias && cvData.referencias.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCIAS', 15, currentY);
    
    // Línea debajo del título
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
    currentY += 8;

    cvData.referencias.slice(0, 2).forEach((ref) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(ref.nombre || '', 15, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`${ref.cargo || ''} en ${ref.empresa || ''}`, 15, currentY);
      
      currentY += 4;
      if (ref.telefono) doc.text(`Tel: ${ref.telefono}`, 15, currentY);
      if (ref.email) doc.text(`Email: ${ref.email}`, 15, currentY + 4);
      
      currentY += 12;
    });
  }

  // === FOOTER ===
  const footerY = pageHeight - 15;
  doc.setTextColor('#666666');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CV generado automáticamente por BolsaTrabajo.com', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};
