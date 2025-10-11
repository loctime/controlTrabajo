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

// Función para generar CV en formato Word con diseño moderno de 2 columnas
export const generateModernCVWord = async (cvData) => {
  try {
    // Colores del template
    const primaryColor = '#2E5266'; // Azul oscuro para sidebar
    const secondaryColor = '#4A90A4'; // Azul medio
    const textColor = '#333333'; // Negro para texto principal
    const whiteColor = '#FFFFFF'; // Blanco
    const lightGray = '#F5F5F5'; // Gris claro

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
      return parts.join(' - ');
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
        spacing: options.spacing || { before: 25, after: 50 },
      });
    };

    // Función para crear título de sección
    const createSectionTitle = (title, isSidebar = false) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: isSidebar ? whiteColor : primaryColor,
            size: 28,
            font: "Calibri",
          }),
        ],
        spacing: { before: 100, after: 50 },
        alignment: isSidebar ? AlignmentType.CENTER : AlignmentType.LEFT,
      });
    };

    // Función para crear tabla de 2 columnas
    const createTwoColumnLayout = () => {
      return new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        columnWidths: [3500, 7500], // Ancho ultra máximo: 32% izquierda, 68% derecha
        rows: [
          new TableRow({
            children: [
              // Columna izquierda (sidebar)
              new TableCell({
                children: [
                  // FOTO DE PERFIL (placeholder)
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "👤",
                        size: 48,
                        color: whiteColor,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 300 },
                  }),

                  // CONTACTO
                  createSectionTitle('CONTACTO', true),
                  ...buildContactInfo(cvData).map(info => 
                    createStyledParagraph(info, {
                      color: whiteColor,
                      size: 20,
                      spacing: { before: 0, after: 100 },
                    })
                  ),

                  // APTITUDES
                  createSectionTitle('APTITUDES', true),
                  createStyledParagraph(
                    cvData.habilidades ? cvData.habilidades.map(h => h.nombre || h).join(' • ') : '',
                    {
                      color: whiteColor,
                      size: 20,
                      spacing: { before: 0, after: 200 },
                    }
                  ),

                  // IDIOMAS
                  ...(cvData.idiomas && cvData.idiomas.length > 0 ? [
                    createSectionTitle('IDIOMAS', true),
                    createStyledParagraph(
                      cvData.idiomas.map(i => {
                        if (typeof i === 'object' && i.idioma) {
                          return `${i.idioma} (${i.nivel})`;
                        }
                        return i;
                      }).join(' • '),
                      {
                        color: whiteColor,
                        size: 20,
                        spacing: { before: 0, after: 200 },
                      }
                    ),
                  ] : []),
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: primaryColor,
                },
                margins: {
                  top: 50,
                  bottom: 50,
                  left: 50,
                  right: 50,
                },
              }),

              // Columna derecha (contenido principal)
              new TableCell({
                children: [
                  // NOMBRE PRINCIPAL
                  createStyledParagraph(`${cvData.Nombre || ''} ${cvData.Apellido || ''}`, {
                    bold: true,
                    size: 48,
                    color: primaryColor,
                    spacing: { before: 50, after: 25 },
                  }),

                  // EDAD
                  createStyledParagraph(`${cvData.Edad} años`, {
                    size: 24,
                    color: secondaryColor,
                    spacing: { before: 0, after: 50 },
                  }),

                  // TÍTULO PROFESIONAL
                  createStyledParagraph(buildProfessionalTitle(cvData), {
                    size: 28,
                    color: textColor,
                    spacing: { before: 0, after: 100 },
                  }),

                  // PERFIL PROFESIONAL
                  ...(cvData.perfilProfesional ? [
                    createSectionTitle('PERFIL PROFESIONAL'),
                    createStyledParagraph(cvData.perfilProfesional, {
                      size: 22,
                      spacing: { before: 0, after: 75 },
                    }),
                  ] : []),

                  // EXPERIENCIA LABORAL
                  ...(cvData.experiencias && cvData.experiencias.length > 0 ? [
                    createSectionTitle('EXPERIENCIA LABORAL'),
                    ...cvData.experiencias.flatMap(exp => [
                      createStyledParagraph(exp.cargo || '', {
                        bold: true,
                        size: 26,
                        color: primaryColor,
                        spacing: { before: 100, after: 50 },
                      }),
                      createStyledParagraph(`${exp.empresa || ''} | ${exp.fechaInicio || ''} - ${exp.fechaFin || ''}`, {
                        size: 22,
                        color: secondaryColor,
                        bold: true,
                        spacing: { before: 0, after: 100 },
                      }),
                      ...(exp.ubicacion ? [
                        createStyledParagraph(`📍 ${exp.ubicacion}`, {
                          size: 20,
                          color: textColor,
                          spacing: { before: 0, after: 150 },
                        }),
                      ] : []),
                      createStyledParagraph(exp.descripcion || '', {
                        size: 22,
                        spacing: { before: 0, after: 200 },
                      }),
                    ]),
                  ] : []),

                  // EDUCACIÓN
                  ...(cvData.educacion && cvData.educacion.length > 0 ? [
                    createSectionTitle('EDUCACIÓN'),
                    ...cvData.educacion.flatMap(edu => [
                      createStyledParagraph(edu.titulo || '', {
                        bold: true,
                        size: 26,
                        color: primaryColor,
                        spacing: { before: 100, after: 50 },
                      }),
                      createStyledParagraph(`${edu.institucion || ''} | ${edu.fechaInicio || ''} - ${edu.fechaFin || ''}`, {
                        size: 22,
                        color: secondaryColor,
                        bold: true,
                        spacing: { before: 0, after: 100 },
                      }),
                      ...(edu.ubicacion ? [
                        createStyledParagraph(`🎓 ${edu.ubicacion}`, {
                          size: 20,
                          color: textColor,
                          spacing: { before: 0, after: 150 },
                        }),
                      ] : []),
                      createStyledParagraph(edu.descripcion || '', {
                        size: 22,
                        spacing: { before: 0, after: 200 },
                      }),
                    ]),
                  ] : []),

                  // CERTIFICACIONES
                  ...(cvData.certificaciones && cvData.certificaciones.length > 0 ? [
                    createSectionTitle('CERTIFICACIONES'),
                    ...cvData.certificaciones.flatMap(cert => [
                      createStyledParagraph(`🏆 ${cert.nombre || ''}`, {
                        bold: true,
                        size: 24,
                        color: primaryColor,
                        spacing: { before: 100, after: 50 },
                      }),
                      createStyledParagraph(`${cert.institucion || ''} | ${cert.fecha || ''}`, {
                        size: 22,
                        color: secondaryColor,
                        spacing: { before: 0, after: 100 },
                      }),
                      ...(cert.url ? [
                        createStyledParagraph(`🔗 Ver certificado`, {
                          color: secondaryColor,
                          italic: true,
                          size: 20,
                          spacing: { before: 0, after: 150 },
                        }),
                      ] : []),
                    ]),
                  ] : []),

                  // PROYECTOS
                  ...(cvData.proyectos && cvData.proyectos.length > 0 ? [
                    createSectionTitle('PROYECTOS'),
                    ...cvData.proyectos.flatMap(proyecto => [
                      createStyledParagraph(`🚀 ${proyecto.nombre || ''}`, {
                        bold: true,
                        size: 24,
                        color: primaryColor,
                        spacing: { before: 100, after: 50 },
                      }),
                      createStyledParagraph(proyecto.descripcion || '', {
                        size: 22,
                        spacing: { before: 0, after: 100 },
                      }),
                      ...(proyecto.tecnologias ? [
                        createStyledParagraph(`💻 ${proyecto.tecnologias}`, {
                          size: 20,
                          color: secondaryColor,
                          spacing: { before: 0, after: 150 },
                        }),
                      ] : []),
                    ]),
                  ] : []),

                  // REFERENCIAS
                  ...(cvData.referencias && cvData.referencias.length > 0 ? [
                    createSectionTitle('REFERENCIAS'),
                    ...cvData.referencias.slice(0, 3).filter(ref => ref && (ref.nombre || ref.cargo || ref.empresa)).flatMap(ref => [
                      ...(ref.nombre ? [
                        createStyledParagraph(`👤 ${ref.nombre}`, {
                          bold: true,
                          size: 24,
                          color: primaryColor,
                          spacing: { before: 100, after: 50 },
                        }),
                      ] : []),
                      createStyledParagraph(
                        ref.cargo && ref.empresa ? `${ref.cargo} en ${ref.empresa}` :
                        ref.cargo ? ref.cargo :
                        ref.empresa ? ref.empresa : '',
                        {
                          size: 22,
                          color: secondaryColor,
                          spacing: { before: 0, after: 100 },
                        }
                      ),
                      ...(ref.telefono || ref.email ? [
                        createStyledParagraph(
                          `${ref.telefono ? `📞 ${ref.telefono}` : ''}${ref.telefono && ref.email ? ' • ' : ''}${ref.email ? `📧 ${ref.email}` : ''}`,
                          {
                            size: 20,
                            color: textColor,
                            spacing: { before: 0, after: 150 },
                          }
                        ),
                      ] : []),
                    ]),
                  ] : []),
                ],
                margins: {
                  top: 50,
                  bottom: 50,
                  left: 50,
                  right: 50,
                },
              }),
            ],
          }),
        ],
      });
    };

    // Crear documento
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 100,      // 0.07 pulgadas
              right: 100,    // 0.07 pulgadas  
              bottom: 100,   // 0.07 pulgadas
              left: 100,     // 0.07 pulgadas
            },
          },
        },
        children: [
          createTwoColumnLayout(),
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
