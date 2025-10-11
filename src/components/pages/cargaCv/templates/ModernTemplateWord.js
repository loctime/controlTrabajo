import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  ShadingType,
  UnderlineType,
  PageBreak
} from 'docx';
import { saveAs } from 'file-saver';

// Función para generar CV en formato Word
export const generateModernCVWord = async (cvData) => {
  try {
    // Colores del template
    const primaryColor = '#1e3a8a';
    const secondaryColor = '#3b82f6';
    const textColor = '#1e293b';
    const lightGray = '#f8fafc';

    // Helper para construir información de contacto
    const buildContactInfo = (data) => {
      const contact = [];
      if (data.Direccion) contact.push(data.Direccion);
      if (data.Telefono) contact.push(`Tel: ${data.Telefono}`);
      if (data.Email) contact.push(`Email: ${data.Email}`);
      if (data.Linkedin) contact.push(`LinkedIn: ${data.Linkedin}`);
      if (data.Web) contact.push(`Web: ${data.Web}`);
      return contact;
    };

    // Helper para construir título profesional
    const buildProfessionalTitle = (data) => {
      const parts = [];
      if (data.CampoEstudio) parts.push(data.CampoEstudio);
      if (data.TituloProfesional) parts.push(data.TituloProfesional);
      return parts.join(' • ');
    };

    // Función para crear párrafo con estilo
    const createStyledParagraph = (text, options = {}) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: options.bold || false,
            italic: options.italic || false,
            color: options.color || textColor,
            size: options.size || 22,
            font: options.font || "Calibri",
          }),
        ],
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: options.spacing || { after: 200 },
        border: options.border || undefined,
        shading: options.shading || undefined,
      });
    };

    // Función para crear encabezado de sección con estilo
    const createSectionHeader = (title) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: primaryColor,
            size: 32,
            font: "Calibri",
            underline: {
              type: UnderlineType.SINGLE,
              color: primaryColor,
            },
          }),
        ],
        spacing: { before: 600, after: 300 },
        border: {
          bottom: {
            color: primaryColor,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      });
    };

    // Función para crear header con fondo azul usando párrafos con fondo
    const createStyledParagraphWithBackground = (text, options = {}) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: options.bold || false,
            italic: options.italic || false,
            color: options.color || "FFFFFF",
            size: options.size || 52,
            font: options.font || "Calibri",
          }),
        ],
        alignment: options.alignment || AlignmentType.CENTER,
        spacing: options.spacing || { before: 200, after: 200 },
        shading: {
          type: ShadingType.SOLID,
          color: primaryColor,
        },
        border: {
          top: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
          bottom: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
          left: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
          right: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
      });
    };

    // Crear documento
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // === HEADER PRINCIPAL CON FONDO AZUL ===
          // Nombre principal
          createStyledParagraphWithBackground(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, {
            bold: true,
            color: "FFFFFF",
            size: 52,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
          }),

          // Título profesional
          createStyledParagraphWithBackground(buildProfessionalTitle(cvData), {
            color: "E0F2FE",
            size: 30,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
          }),

          // Información de contacto
          createStyledParagraphWithBackground(buildContactInfo(cvData).join(' • '), {
            color: "F1F5F9",
            size: 24,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
          }),

          // Edad (párrafo separado alineado a la derecha)
          new Paragraph({
            children: [
              new TextRun({
                text: `${cvData.Edad} años`,
                color: primaryColor,
                size: 28,
                font: "Calibri",
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 400 },
          }),

          // === PERFIL PROFESIONAL ===
          createSectionHeader('PERFIL PROFESIONAL'),
          createStyledParagraph(cvData.perfilProfesional || '', {
            size: 24,
            spacing: { after: 400 },
            font: "Calibri",
          }),

          // === EXPERIENCIA LABORAL ===
          ...(cvData.experiencias && cvData.experiencias.length > 0 ? [
            createSectionHeader('EXPERIENCIA LABORAL'),
            ...cvData.experiencias.flatMap(exp => [
              createStyledParagraph(exp.cargo || '', { 
                bold: true, 
                size: 26, 
                color: primaryColor,
                font: "Calibri",
                spacing: { after: 100 }
              }),
              createStyledParagraph(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, {
                size: 22,
                color: secondaryColor,
                font: "Calibri",
                spacing: { after: 100 },
              }),
              ...(exp.ubicacion ? [createStyledParagraph(`📍 Ubicación: ${exp.ubicacion}`, { 
                size: 20, 
                color: textColor,
                font: "Calibri",
                spacing: { after: 150 }
              })] : []),
              createStyledParagraph(exp.descripcion || '', {
                size: 22,
                color: textColor,
                font: "Calibri",
                spacing: { after: 400 },
              }),
            ]),
          ] : []),

          // === EDUCACIÓN ===
          ...(cvData.educacion && cvData.educacion.length > 0 ? [
            createSectionHeader('EDUCACIÓN'),
            ...cvData.educacion.flatMap(edu => [
              createStyledParagraph(edu.titulo || '', { 
                bold: true, 
                size: 26, 
                color: primaryColor,
                font: "Calibri",
                spacing: { after: 100 }
              }),
              createStyledParagraph(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, {
                size: 22,
                color: secondaryColor,
                font: "Calibri",
                spacing: { after: 100 },
              }),
              ...(edu.ubicacion ? [createStyledParagraph(`🎓 Ubicación: ${edu.ubicacion}`, { 
                size: 20, 
                color: textColor,
                font: "Calibri",
                spacing: { after: 150 }
              })] : []),
              createStyledParagraph(edu.descripcion || '', {
                size: 22,
                color: textColor,
                font: "Calibri",
                spacing: { after: 400 },
              }),
            ]),
          ] : []),

          // === HABILIDADES ===
          ...(cvData.habilidades && cvData.habilidades.length > 0 ? [
            createSectionHeader('HABILIDADES'),
            createStyledParagraph(
              `💼 ${cvData.habilidades.map(h => h.nombre || h).join(' • ')}`,
              { 
                size: 24, 
                color: textColor,
                font: "Calibri",
                spacing: { after: 400 } 
              }
            ),
          ] : []),

          // === IDIOMAS ===
          ...(cvData.idiomas && cvData.idiomas.length > 0 ? [
            createSectionHeader('IDIOMAS'),
            createStyledParagraph(
              `🌍 ${cvData.idiomas.map(i => {
                if (typeof i === 'object' && i.idioma) {
                  return `${i.idioma} (${i.nivel})`;
                }
                return i;
              }).join(' • ')}`,
              { 
                size: 24, 
                color: textColor,
                font: "Calibri",
                spacing: { after: 400 } 
              }
            ),
          ] : []),

          // === CERTIFICACIONES ===
          ...(cvData.certificaciones && cvData.certificaciones.length > 0 ? [
            createSectionHeader('CERTIFICACIONES'),
            ...cvData.certificaciones.flatMap(cert => [
              createStyledParagraph(`🏆 ${cert.nombre || ''}`, { 
                bold: true, 
                size: 24, 
                color: primaryColor,
                font: "Calibri",
                spacing: { after: 100 }
              }),
              createStyledParagraph(`${cert.institucion || ''} | ${cert.fecha || ''}`, {
                size: 22,
                color: secondaryColor,
                font: "Calibri",
                spacing: { after: 100 },
              }),
              ...(cert.url ? [
                createStyledParagraph(`🔗 Ver certificado: ${cert.url}`, {
                  color: secondaryColor,
                  italic: true,
                  size: 20,
                  font: "Calibri",
                  spacing: { after: 200 },
                }),
              ] : [new Paragraph({ spacing: { after: 200 } })]),
            ]),
          ] : []),

          // === REFERENCIAS ===
          ...(cvData.referencias && cvData.referencias.length > 0 ? [
            createSectionHeader('REFERENCIAS'),
            ...cvData.referencias.slice(0, 3).filter(ref => ref && (ref.nombre || ref.cargo || ref.empresa)).flatMap(ref => [
              ...(ref.nombre ? [createStyledParagraph(`👤 ${ref.nombre}`, { 
                bold: true, 
                size: 24, 
                color: primaryColor,
                font: "Calibri",
                spacing: { after: 100 }
              })] : []),
              createStyledParagraph(
                ref.cargo && ref.empresa ? `${ref.cargo} en ${ref.empresa}` :
                ref.cargo ? ref.cargo :
                ref.empresa ? ref.empresa : '',
                { 
                  size: 22, 
                  color: secondaryColor,
                  font: "Calibri",
                  spacing: { after: 100 } 
                }
              ),
              ...(ref.telefono || ref.email ? [
                createStyledParagraph(
                  `${ref.telefono ? `📞 Tel: ${ref.telefono}` : ''}${ref.telefono && ref.email ? ' • ' : ''}${ref.email ? `📧 Email: ${ref.email}` : ''}`,
                  { 
                    size: 20, 
                    color: textColor,
                    font: "Calibri",
                    spacing: { after: 200 } 
                  }
                ),
              ] : [new Paragraph({ spacing: { after: 200 } })]),
            ]),
          ] : []),

          // === PROYECTOS ===
          ...(cvData.proyectos && cvData.proyectos.length > 0 ? [
            createSectionHeader('PROYECTOS'),
            ...cvData.proyectos.flatMap(proyecto => [
              createStyledParagraph(`🚀 ${proyecto.nombre || ''}`, { 
                bold: true, 
                size: 24, 
                color: primaryColor,
                font: "Calibri",
                spacing: { after: 100 }
              }),
              createStyledParagraph(proyecto.descripcion || '', {
                size: 22,
                color: textColor,
                font: "Calibri",
                spacing: { after: 100 },
              }),
              ...(proyecto.tecnologias ? [
                createStyledParagraph(`💻 Tecnologías: ${proyecto.tecnologias}`, { 
                  size: 20, 
                  color: secondaryColor,
                  font: "Calibri",
                  spacing: { after: 100 }
                }),
              ] : []),
              ...(proyecto.url ? [
                createStyledParagraph(`🔗 Ver proyecto: ${proyecto.url}`, {
                  color: secondaryColor,
                  italic: true,
                  size: 20,
                  font: "Calibri",
                  spacing: { after: 200 },
                }),
              ] : [new Paragraph({ spacing: { after: 200 } })]),
            ]),
          ] : []),
        ],
      }],
    });

    // Generar y descargar el documento
    const blob = await Packer.toBlob(doc);
    const fileName = `CV_${cvData.Nombre}_${cvData.Apellido}_Moderno.docx`;
    saveAs(blob, fileName);

    return true;
  } catch (error) {
    console.error('Error generando CV en Word:', error);
    return false;
  }
};
