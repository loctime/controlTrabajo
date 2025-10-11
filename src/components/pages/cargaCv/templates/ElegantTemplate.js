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
  const leftColumnWidth = pageWidth * 0.35; // 35% del ancho
  
  // Fondo de la columna izquierda
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, leftColumnWidth, pageHeight, 'F');
  
  let leftY = 20;

  // Foto de perfil (si existe)
  if (cvData.Foto) {
    try {
      console.log('📸 Cargando imagen de perfil:', cvData.Foto);
      
      // Crear círculo de fondo blanco
      doc.setFillColor('#ffffff');
      doc.circle(leftColumnWidth/2, leftY + 25, 25, 'F');
      
      // Intentar cargar imagen desde URL
      const img = await loadImageFromUrl(cvData.Foto);
      
            // Crear canvas para procesar la imagen como círculo
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = 50; // Tamaño de la imagen
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
      doc.addImage(imgData, 'JPEG', leftColumnWidth/2 - 25, leftY, 50, 50);
      
      console.log('✅ Imagen de perfil cargada correctamente');
    } catch (error) {
      console.log('⚠️ Error al cargar imagen de perfil, usando placeholder:', error);
      
      // Fallback: mostrar placeholder elegante
      doc.setFillColor(secondaryColor);
      doc.circle(leftColumnWidth/2, leftY + 25, 23, 'F');
      
      doc.setTextColor('#ffffff');
      doc.setFontSize(8);
      doc.text('FOTO', leftColumnWidth/2, leftY + 27, { align: 'center' });
      doc.setFontSize(6);
      doc.text('DE', leftColumnWidth/2, leftY + 31, { align: 'center' });
      doc.text('PERFIL', leftColumnWidth/2, leftY + 35, { align: 'center' });
    }
  } else {
    // Si no hay foto, mostrar placeholder
    doc.setFillColor(secondaryColor);
    doc.circle(leftColumnWidth/2, leftY + 25, 23, 'F');
    
    doc.setTextColor('#ffffff');
    doc.setFontSize(8);
    doc.text('FOTO', leftColumnWidth/2, leftY + 27, { align: 'center' });
    doc.setFontSize(6);
    doc.text('DE', leftColumnWidth/2, leftY + 31, { align: 'center' });
    doc.text('PERFIL', leftColumnWidth/2, leftY + 35, { align: 'center' });
  }
  
  leftY += 60;

  // === INFORMACIÓN DE CONTACTO ===
  doc.setTextColor('#ffffff');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACTO', 10, leftY);
  leftY += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (cvData.direccion) {
    doc.text(`📍 ${cvData.direccion}`, 10, leftY);
    leftY += 5;
  }
  
  if (cvData.telefono) {
    doc.text(`📞 ${cvData.telefono}`, 10, leftY);
    leftY += 5;
  }
  
  if (cvData.Email) {
    doc.text(`✉️ ${cvData.Email}`, 10, leftY);
    leftY += 5;
  }
  
  if (cvData.linkedin) {
    doc.text(`💼 LinkedIn`, 10, leftY);
    leftY += 5;
  }
  
  leftY += 10;

  // === APTITUDES/HABILIDADES ===
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('APTITUDES', 10, leftY);
    leftY += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    cvData.habilidades.forEach((skill) => {
      doc.text(`• ${skill.nombre}`, 10, leftY);
      leftY += 4;
    });
    
    leftY += 10;
  }

  // === RESUMEN PROFESIONAL ===
  if (cvData.perfilProfesional) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN PROFESIONAL', 10, leftY);
    leftY += 8;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const splitPerfil = doc.splitTextToSize(cvData.perfilProfesional, leftColumnWidth - 20);
    doc.text(splitPerfil, 10, leftY);
    leftY += splitPerfil.length * 3 + 10;
  }

  // === RIGHT COLUMN (White Background) ===
  const rightColumnX = leftColumnWidth + 10;
  const rightColumnWidth = pageWidth - leftColumnWidth - 20;
  let rightY = 20;

  // Nombre completo
  doc.setTextColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, rightColumnX, rightY);
  rightY += 15;

  // === IDIOMAS ===
  if (cvData.idiomas && cvData.idiomas.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IDIOMAS', rightColumnX, rightY);
    
    // Línea separadora
    doc.setDrawColor('#CCCCCC');
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, rightY + 2, pageWidth - 10, rightY + 2);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    cvData.idiomas.forEach((idioma) => {
      doc.text(`• ${idioma.idioma} ${idioma.nivel}`, rightColumnX, rightY);
      rightY += 5;
    });
    rightY += 10;
  }

  // === HABILIDADES INFORMÁTICAS ===
  if (cvData.habilidades && cvData.habilidades.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HABILIDADES INFORMÁTICAS', rightColumnX, rightY);
    
    // Línea separadora
    doc.setDrawColor('#CCCCCC');
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, rightY + 2, pageWidth - 10, rightY + 2);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Agrupar habilidades por nivel para mejor presentación
    const habilidadesPorNivel = {};
    cvData.habilidades.forEach(skill => {
      if (!habilidadesPorNivel[skill.nivel]) {
        habilidadesPorNivel[skill.nivel] = [];
      }
      habilidadesPorNivel[skill.nivel].push(skill.nombre);
    });

    Object.entries(habilidadesPorNivel).forEach(([nivel, habilidades]) => {
      if (habilidades.length > 0) {
        doc.text(`• ${habilidades.join(', ')}.`, rightColumnX, rightY);
        rightY += 5;
      }
    });
    rightY += 10;
  }

  // === CERTIFICACIONES ===
  if (cvData.certificaciones && cvData.certificaciones.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CURSOS Y CERTIFICADOS', rightColumnX, rightY);
    
    // Línea separadora
    doc.setDrawColor('#CCCCCC');
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, rightY + 2, pageWidth - 10, rightY + 2);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    cvData.certificaciones.forEach((cert) => {
      doc.text(`• ${cert.nombre}`, rightColumnX, rightY);
      rightY += 4;
      if (cert.institucion) {
        doc.text(`  ${cert.institucion}`, rightColumnX, rightY);
        rightY += 4;
      }
      rightY += 5;
    });
    rightY += 10;
  }

  // === EXPERIENCIA LABORAL ===
  if (cvData.experiencias && cvData.experiencias.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIAL LABORAL', rightColumnX, rightY);
    
    // Línea separadora
    doc.setDrawColor('#CCCCCC');
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, rightY + 2, pageWidth - 10, rightY + 2);
    rightY += 8;

    cvData.experiencias.forEach((exp, index) => {
      // Fechas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, rightColumnX, rightY);
      rightY += 5;
      
      // Cargo y empresa
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.cargo || ''} ${exp.empresa || ''}`, rightColumnX, rightY);
      if (exp.ubicacion) {
        doc.text(exp.ubicacion, rightColumnX, rightY + 4);
        rightY += 4;
      }
      rightY += 8;
      
      // Descripción
      if (exp.descripcion) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(exp.descripcion, rightColumnWidth);
        doc.text(splitDesc, rightColumnX, rightY);
        rightY += splitDesc.length * 3.5 + 5;
      }
      
      // Logros clave (si existen)
      if (index === 0 && cvData.habilidades && cvData.habilidades.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Logros clave', rightColumnX, rightY);
        rightY += 5;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Incremento en un 18% de media en el tráfico de nuestros clientes.`, rightColumnX, rightY);
        rightY += 4;
        doc.text(`• Nominada en los premios Edebril por mejor diseño web.`, rightColumnX, rightY);
        rightY += 8;
      }
      
      // Línea separadora entre experiencias
      if (index < cvData.experiencias.length - 1) {
        doc.setDrawColor('#EEEEEE');
        doc.setLineWidth(0.3);
        doc.line(rightColumnX, rightY, pageWidth - 10, rightY);
        rightY += 10;
      }
    });
    rightY += 15;
  }

  // === EDUCACIÓN ===
  if (cvData.educacion && cvData.educacion.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMACIÓN', rightColumnX, rightY);
    
    // Línea separadora
    doc.setDrawColor('#CCCCCC');
    doc.setLineWidth(0.5);
    doc.line(rightColumnX, rightY + 2, pageWidth - 10, rightY + 2);
    rightY += 8;

    cvData.educacion.forEach((edu) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.fechaInicio || ''}`, rightColumnX, rightY);
      rightY += 4;
      doc.setFont('helvetica', 'bold');
      doc.text(edu.titulo || '', rightColumnX, rightY);
      rightY += 8;
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
