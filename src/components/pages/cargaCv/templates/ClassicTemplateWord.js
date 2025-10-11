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

    // Helper para dividir texto en párrafos
    const createParagraphsFromText = (text, options = {}) => {
      if (!text) return [];
      
      // Dividir por puntos seguidos de espacio o por dobles saltos de línea
      const paragraphs = text
        .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])|(?:\n\s*\n)/)
        .filter(p => p.trim().length > 0)
        .map(p => p.trim());
      
      return paragraphs.map((paragraph, index) => 
        createStyledParagraph(paragraph, {
          size: options.size || 24,
          color: options.color || textColor,
          font: options.font || "Calibri",
          spacing: { 
            before: index === 0 ? 100 : 0,
            after: options.spacing || 200 
          },
        })
      );
    };

    // Función para crear párrafo con formato mejorado
    const createFormattedParagraph = (text, options = {}) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: options.bold || false,
            italic: options.italic || false,
            color: options.color || textColor,
            size: options.size || 24,
            font: options.font || "Calibri",
          }),
        ],
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: options.spacing || { before: 120, after: 240 },
        indent: options.indent || undefined,
      });
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
            size: 36,
            font: "Calibri",
            underline: {
              type: UnderlineType.SINGLE,
              color: primaryColor,
            },
          }),
        ],
        spacing: { before: 800, after: 400 },
        border: {
          bottom: {
            color: primaryColor,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 8,
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
            size: 60,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 150 },
          }),

          // Título profesional
          createStyledParagraphWithBackground(buildProfessionalTitle(cvData), {
            color: "E0F2FE",
            size: 36,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 150 },
          }),

          // Información de contacto en el header
          createStyledParagraphWithBackground(buildContactInfo(cvData).join(' • '), {
            color: "F1F5F9",
            size: 28,
            font: "Calibri",
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
          }),

          // Edad (párrafo separado alineado a la derecha)
          createFormattedParagraph(`${cvData.Edad} años`, {
            color: primaryColor,
            size: 32,
            font: "Calibri",
            bold: true,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 600 },
          }),

          // === PERFIL PROFESIONAL ===
          createSectionHeader('PERFIL PROFESIONAL'),
          ...createParagraphsFromText(cvData.perfilProfesional || '', {
            size: 28,
            color: textColor,
            font: "Calibri",
            spacing: 300,
          }),

          // === EXPERIENCIA LABORAL ===
          ...(cvData.experiencias && cvData.experiencias.length > 0 ? [
            createSectionHeader('EXPERIENCIA LABORAL'),
            ...cvData.experiencias.flatMap(exp => [
              createFormattedParagraph(exp.cargo || '', { 
                bold: true, 
                size: 32, 
                color: primaryColor,
                font: "Calibri",
                spacing: { before: 200, after: 150 }
              }),
              createFormattedParagraph(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, {
                size: 26,
                color: secondaryColor,
                font: "Calibri",
                bold: true,
                spacing: { before: 0, after: 150 },
              }),
              ...(exp.ubicacion ? [createFormattedParagraph(`📍 Ubicación: ${exp.ubicacion}`, { 
                size: 24, 
                color: textColor,
                font: "Calibri",
                spacing: { before: 0, after: 200 }
              })] : []),
              ...createParagraphsFromText(exp.descripcion || '', {
                size: 26,
                color: textColor,
                font: "Calibri",
                spacing: 250,
              }),
              // Separador entre experiencias
              new Paragraph({
                children: [
                  new TextRun({
                    text: "─".repeat(50),
                    color: "#E5E7EB",
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 300 },
              }),
            ]),
          ] : []),

          // === EDUCACIÓN ===
          ...(cvData.educacion && cvData.educacion.length > 0 ? [
            createSectionHeader('EDUCACIÓN'),
            ...cvData.educacion.flatMap(edu => [
              createFormattedParagraph(edu.titulo || '', { 
                bold: true, 
                size: 32, 
                color: primaryColor,
                font: "Calibri",
                spacing: { before: 200, after: 150 }
              }),
              createFormattedParagraph(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, {
                size: 26,
                color: secondaryColor,
                font: "Calibri",
                bold: true,
                spacing: { before: 0, after: 150 },
              }),
              ...(edu.ubicacion ? [createFormattedParagraph(`🎓 Ubicación: ${edu.ubicacion}`, { 
                size: 24, 
                color: textColor,
                font: "Calibri",
                spacing: { before: 0, after: 200 }
              })] : []),
              ...createParagraphsFromText(edu.descripcion || '', {
                size: 26,
                color: textColor,
                font: "Calibri",
                spacing: 250,
              }),
              // Separador entre educaciones
              new Paragraph({
                children: [
                  new TextRun({
                    text: "─".repeat(50),
                    color: "#E5E7EB",
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 300 },
              }),
            ]),
          ] : []),

          // === HABILIDADES ===
          ...(cvData.habilidades && cvData.habilidades.length > 0 ? [
            createSectionHeader('HABILIDADES'),
            createFormattedParagraph(
              `💼 ${cvData.habilidades.map(h => h.nombre || h).join(' • ')}`,
              { 
                size: 28, 
                color: textColor,
                font: "Calibri",
                spacing: { before: 200, after: 600 } 
              }
            ),
          ] : []),

          // === IDIOMAS ===
          ...(cvData.idiomas && cvData.idiomas.length > 0 ? [
            createSectionHeader('IDIOMAS'),
            createFormattedParagraph(
              `🌍 ${cvData.idiomas.map(i => {
                if (typeof i === 'object' && i.idioma) {
                  return `${i.idioma} (${i.nivel})`;
                }
                return i;
              }).join(' • ')}`,
              { 
                size: 28, 
                color: textColor,
                font: "Calibri",
                spacing: { before: 200, after: 600 } 
              }
            ),
          ] : []),

          // === CERTIFICACIONES ===
          ...(cvData.certificaciones && cvData.certificaciones.length > 0 ? [
            createSectionHeader('CERTIFICACIONES'),
            ...cvData.certificaciones.flatMap(cert => [
              createFormattedParagraph(`🏆 ${cert.nombre || ''}`, { 
                bold: true, 
                size: 30, 
                color: primaryColor,
                font: "Calibri",
                spacing: { before: 200, after: 150 }
              }),
              createFormattedParagraph(`${cert.institucion || ''} | ${cert.fecha || ''}`, {
                size: 26,
                color: secondaryColor,
                font: "Calibri",
                bold: true,
                spacing: { before: 0, after: 150 },
              }),
              ...(cert.url ? [
                createFormattedParagraph(`🔗 Ver certificado: ${cert.url}`, {
                  color: secondaryColor,
                  italic: true,
                  size: 24,
                  font: "Calibri",
                  spacing: { before: 0, after: 300 },
                }),
              ] : [new Paragraph({ spacing: { after: 300 } })]),
            ]),
          ] : []),

          // === REFERENCIAS ===
          ...(cvData.referencias && cvData.referencias.length > 0 ? [
            createSectionHeader('REFERENCIAS'),
            ...cvData.referencias.slice(0, 3).filter(ref => ref && (ref.nombre || ref.cargo || ref.empresa)).flatMap(ref => [
              ...(ref.nombre ? [createFormattedParagraph(`👤 ${ref.nombre}`, { 
                bold: true, 
                size: 30, 
                color: primaryColor,
                font: "Calibri",
                spacing: { before: 200, after: 150 }
              })] : []),
              createFormattedParagraph(
                ref.cargo && ref.empresa ? `${ref.cargo} en ${ref.empresa}` :
                ref.cargo ? ref.cargo :
                ref.empresa ? ref.empresa : '',
                { 
                  size: 26, 
                  color: secondaryColor,
                  font: "Calibri",
                  bold: true,
                  spacing: { before: 0, after: 150 } 
                }
              ),
              ...(ref.telefono || ref.email ? [
                createFormattedParagraph(
                  `${ref.telefono ? `📞 Tel: ${ref.telefono}` : ''}${ref.telefono && ref.email ? ' • ' : ''}${ref.email ? `📧 Email: ${ref.email}` : ''}`,
                  { 
                    size: 24, 
                    color: textColor,
                    font: "Calibri",
                    spacing: { before: 0, after: 300 } 
                  }
                ),
              ] : [new Paragraph({ spacing: { after: 300 } })]),
            ]),
          ] : []),

          // === PROYECTOS ===
          ...(cvData.proyectos && cvData.proyectos.length > 0 ? [
            createSectionHeader('PROYECTOS'),
            ...cvData.proyectos.flatMap(proyecto => [
              createFormattedParagraph(`🚀 ${proyecto.nombre || ''}`, { 
                bold: true, 
                size: 30, 
                color: primaryColor,
                font: "Calibri",
                spacing: { before: 200, after: 150 }
              }),
              ...createParagraphsFromText(proyecto.descripcion || '', {
                size: 26,
                color: textColor,
                font: "Calibri",
                spacing: 200,
              }),
              ...(proyecto.tecnologias ? [
                createFormattedParagraph(`💻 Tecnologías: ${proyecto.tecnologias}`, { 
                  size: 24, 
                  color: secondaryColor,
                  font: "Calibri",
                  bold: true,
                  spacing: { before: 0, after: 150 }
                }),
              ] : []),
              ...(proyecto.url ? [
                createFormattedParagraph(`🔗 Ver proyecto: ${proyecto.url}`, {
                  color: secondaryColor,
                  italic: true,
                  size: 24,
                  font: "Calibri",
                  spacing: { before: 0, after: 300 },
                }),
              ] : [new Paragraph({ spacing: { after: 300 } })]),
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
