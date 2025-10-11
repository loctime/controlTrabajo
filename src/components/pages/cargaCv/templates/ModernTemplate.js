import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDownloadUrl } from '../../../../lib/controlFileStorage';

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
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // Crear círculo de fondo blanco
      doc.setFillColor('#ffffff');
      doc.circle(25, 25, 20, 'F');
      
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
      doc.addImage(imgData, 'JPEG', 7, 7, 36, 36);
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil:', error);
      
      // Fallback: mostrar placeholder
      doc.setFillColor(primaryColor);
      doc.circle(25, 25, 18, 'F');
      
      doc.setTextColor('#ffffff');
      doc.setFontSize(10);
      doc.text('FOTO', 25, 28, { align: 'center' });
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
  if (cvData.Email) contactInfo.push(`Email: ${cvData.Email}`);
  if (cvData.telefono) contactInfo.push(`Tel: ${cvData.telefono}`);
  if (cvData.ciudad) contactInfo.push(`Ciudad: ${cvData.ciudad}`);
  if (cvData.linkedin) contactInfo.push(`LinkedIn`);
  if (cvData.sitioWeb) contactInfo.push(`Web: ${cvData.sitioWeb}`);

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
    doc.text('EXPERIENCIA LABORAL', leftColumnX, currentY);
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
      if (exp.ubicacion) {
        doc.text(`📍 ${exp.ubicacion}`, leftColumnX, currentY);
        currentY += 4;
      }
      
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
    doc.text('EDUCACIÓN', leftColumnX, currentY);
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
    doc.text('HABILIDADES', rightColumnX, rightY);
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
    doc.text('IDIOMAS', rightColumnX, rightY);
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
    doc.text('CERTIFICACIONES', rightColumnX, rightY);
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
    doc.text('PROYECTOS', rightColumnX, rightY);
    rightY += 8;

    cvData.proyectos.forEach((proyecto) => {
      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(proyecto.nombre || '', rightColumnX, rightY);
      
      rightY += 4;
      doc.setFont('helvetica', 'normal');
      if (proyecto.descripcion) {
        const splitDesc = doc.splitTextToSize(proyecto.descripcion, columnWidth);
        doc.text(splitDesc, rightColumnX, rightY);
        rightY += splitDesc.length * 3.5;
      }
      
      if (proyecto.tecnologias) {
        doc.text(`Tecnologías: ${proyecto.tecnologias}`, rightColumnX, rightY);
        rightY += 4;
      }
      
      if (proyecto.url) {
        doc.setTextColor(primaryColor);
        doc.text(`🔗 Ver proyecto: ${proyecto.url}`, rightColumnX, rightY);
        doc.setTextColor(textColor);
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
    doc.text('REFERENCIAS', leftColumnX, refY);
    
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
      if (ref.telefono) doc.text(`Tel: ${ref.telefono}`, leftColumnX, refCurrentY);
      if (ref.email) doc.text(`Email: ${ref.email}`, leftColumnX + 40, refCurrentY);
      
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
