import { db } from '../../../../firebaseConfig';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';
import { showAlert } from '../../../../utils/swalConfig';
import { sendRegistrationEmails } from './emailService';
import { pdfGeneratorService } from './pdfGeneratorService';

export const cvSubmissionService = {
  /**
   * Procesa el envío del CV según el modo (generador o subida)
   * @param {Object} params - Parámetros del envío
   * @returns {Promise<Object>} Resultado del envío
   */
  submitCV: async ({
    newCv,
    user,
    currentCv,
    tabValue,
    selectedTemplate,
    handleFileChange
  }) => {
    try {
      let docRef;
      let cvPdfUrl = "";
      
      // Si es un CV generado, crear el PDF y subirlo
      if (tabValue === 0) {
        console.log("🎨 Generando CV con plantilla:", selectedTemplate);
        
        // Validar datos antes de generar
        const validation = pdfGeneratorService.validateCVData(newCv);
        if (!validation.isValid) {
          const errorMessages = validation.errors.join(', ');
          throw new Error(`Error de validación: ${errorMessages}`);
        }
        
        // Generar PDF
        const pdfDoc = await pdfGeneratorService.generateCVPdf(newCv, selectedTemplate);
        const pdfBlob = pdfGeneratorService.getPDFAsBlob(pdfDoc);
       
        // Crear archivo para subir
        const fileName = `CV_${newCv.Nombre}_${newCv.Apellido}_${selectedTemplate}.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Subir PDF usando el hook de subida de archivos
        console.log("📤 Subiendo PDF generado...");
        await new Promise((resolve, reject) => {
          handleFileChange(
            { target: { files: [pdfFile] } }, 
            "cv", 
            (url) => {
              cvPdfUrl = url;
              console.log("✅ PDF generado y subido:", url);
              resolve();
            }
          );
        });
      }
      
      // Preparar datos según el modo
      const finalCvUrl = tabValue === 0 ? cvPdfUrl : newCv.cv;
      
      console.log("📋 Datos del CV a guardar:", {
        modo: tabValue === 0 ? "Generado" : "Subido manualmente",
        cvUrl: finalCvUrl,
        plantilla: tabValue === 0 ? selectedTemplate : "N/A"
      });
      
      const cvData = {
        ...newCv,
        estado: "pendiente",
        uid: user.uid,
        cv: finalCvUrl, // Campo principal para compatibilidad con Dashboard
        cvGenerado: tabValue === 0, // true si es generador, false si es subida
        plantillaSeleccionada: tabValue === 0 ? selectedTemplate : null,
        cvPdfUrl: finalCvUrl, // URL del PDF (compatibilidad futura)
        fechaCreacion: new Date().toISOString(),
        versionCV: currentCv ? (currentCv.versionCV || 1) + 1 : 1
      };
      
      // Guardar en Firestore
      if (currentCv) {
        docRef = doc(db, "cv", currentCv.id);
        await setDoc(docRef, cvData, { merge: true });
      } else {
        const docSnap = await addDoc(collection(db, "cv"), cvData);
        docRef = docSnap;
      }

      // Enviar correos electrónicos
      await sendRegistrationEmails(cvData);

      const mensaje = tabValue === 0 
        ? "Tu CV profesional ha sido creado exitosamente. Está en revisión y pronto estará disponible."
        : "Tu CV ha sido enviado exitosamente. Está en revisión y pronto estará disponible.";

      return {
        success: true,
        message: mensaje,
        docRef
      };
    } catch (error) {
      console.error("Error al procesar el CV:", error);
      throw error;
    }
  }
};
