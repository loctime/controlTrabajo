import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateModernTemplate = (cvData) => {
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
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      // Crear círculo para la foto
      doc.setFillColor('#ffffff');
      doc.circle(25, 25, 20, 'F');
      
      // Aquí se podría agregar la imagen, pero por simplicidad usamos un placeholder
      doc.setFillColor(primaryColor);
      doc.circle(25, 25, 18, 'F');
      
      // Texto placeholder
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text('FOTO', 25, 28, { align: 'center' });
    } catch (error) {
      console.log('Error al procesar foto:', error);
    }
  }

  // Nombre y título
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, 60, 20);

  // Título profesional
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(cvData.categoriaGeneral || '', 60, 30);

  // Información de contacto
  doc.setFontSize(10);
  const contactInfo = [];
  if (cvData.Email) contactInfo.push(`📧 ${cvData.Email}`);
  if (cvData.telefono) contactInfo.push(`📞 ${cvData.telefono}`);
  if (cvData.ciudad) contactInfo.push(`📍 ${cvData.ciudad}`);
  if (cvData.linkedin) contactInfo.push(`💼 LinkedIn`);

  doc.text(contactInfo.join(' • '), 60, 40);

  // === PERFIL PROFESIONAL ===
  let currentY = 65;
  if (cvData.perfilProfesional) {
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFIL PROFESIONAL', 15, currentY);
    
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitPerfil = doc.splitTextToSize(cvData.perfilProfesional, pageWidth - 30);
    doc.text(splitPerfil, 15, currentY);
    currentY += splitPerfil.length * 4 + 10;
  }

  // === MAIN CONTENT (Two columns) ===
  const leftColumnX = 15;
  const rightColumnX = pageWidth / 2 + 5;
  const columnWidth = (pageWidth / 2) - 20;

  // === LEFT COLUMN ===
  
  // EXPERIENCIA LABORAL
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('💼 EXPERIENCIA LABORAL', leftColumnX, currentY);
    currentY += 8;

    cvData.experiencias.forEach((exp, index) => {
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.cargo || '', leftColumnX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, leftColumnX, currentY);
      
      currentY += 4;
      if (exp.descripcion) {
        const splitDesc = doc.splitTextToSize(exp.descripcion, columnWidth);
        doc.text(splitDesc, leftColumnX, currentY);
        currentY += splitDesc.length * 3.5;
      }
      currentY += 5;
    });
  }

  // EDUCACIÓN
  if (cvData.educacion && cvData.educacion.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🎓 EDUCACIÓN', leftColumnX, currentY);
    currentY += 8;

    cvData.educacion.forEach((edu) => {
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', leftColumnX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, leftColumnX, currentY);
      
      currentY += 6;
    });
  }

  // === RIGHT COLUMN ===
  let rightY = 65;

  // HABILIDADES
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🛠️ HABILIDADES', rightColumnX, rightY);
    rightY += 8;

    cvData.habilidades.forEach((skill) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${skill.nombre} (${skill.nivel})`, rightColumnX, rightY);
      rightY += 4;
    });
    rightY += 5;
  }

  // IDIOMAS
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🌍 IDIOMAS', rightColumnX, rightY);
    rightY += 8;

    cvData.idiomas.forEach((idioma) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${idioma.idioma} - ${idioma.nivel}`, rightColumnX, rightY);
      rightY += 4;
    });
    rightY += 5;
  }

  // CERTIFICACIONES
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🏆 CERTIFICACIONES', rightColumnX, rightY);
    rightY += 8;

    cvData.certificaciones.forEach((cert) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.nombre || '', rightColumnX, rightY);
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${cert.institucion || ''} | ${cert.fecha || ''}`, rightColumnX, rightY);
      
      rightY += 6;
    });
  }

  // PROYECTOS
  if (cvData.proyectos && cvData.proyectos.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🚀 PROYECTOS', rightColumnX, rightY);
    rightY += 8;

    cvData.proyectos.forEach((proyecto) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', rightColumnX, rightY);
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, rightColumnX, rightY);
        rightY += 4;
      }
      
      rightY += 6;
    });
  }

  // === REFERENCIAS (si hay espacio) ===
  if (cvData.referencias && cvData.referencias.length > 0) {
    const refY = Math.max(currentY, rightY) + 20;
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('👥 REFERENCIAS', leftColumnX, refY);
    
    let refCurrentY = refY + 8;
    cvData.referencias.slice(0, 2).forEach((ref) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(ref.nombre || '', leftColumnX, refCurrentY);
      
      refCurrentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${ref.cargo || ''} en ${ref.empresa || ''}`, leftColumnX, refCurrentY);
      
      refCurrentY += 4;
      if (ref.telefono) doc.text(`📞 ${ref.telefono}`, leftColumnX, refCurrentY);
      if (ref.email) doc.text(`📧 ${ref.email}`, leftColumnX + 40, refCurrentY);
      
      refCurrentY += 8;
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
