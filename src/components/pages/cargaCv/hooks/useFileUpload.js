import { useState } from 'react';
import Swal from 'sweetalert2';
import { uploadFile, ensureAppFolder, createPublicShareLink } from '../../../../lib/controlFileStorage';
import { useImageProcessor } from './useImageProcessor';

export const useFileUpload = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isCvLoaded, setIsCvLoaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  
  // Integrar el procesador de imágenes
  const {
    isProcessing,
    showPreview: showImagePreview,
    selectedFile: selectedImageFile,
    validateImageFile,
    processAndConfirmImage,
    setShowPreview: setShowImagePreview,
    setSelectedFile: setSelectedImageFile
  } = useImageProcessor();

  const validateFile = (file, type) => {
    // Validaciones para imágenes
    if (type === "Foto") {
      // Usar el validador del procesador de imágenes
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        Swal.fire({
          title: "Imagen no válida",
          text: validation.error,
          icon: "warning",
          confirmButtonText: "Entendido"
        });
        return false;
      }
      return true;
    }

    // Validaciones para CV
    if (type === "cv") {
      // Tamaño máximo: 10MB
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        Swal.fire({
          title: "Archivo muy grande",
          text: "El CV debe ser menor a 10MB. Por favor, comprime el archivo o usa uno más pequeño.",
          icon: "warning",
          confirmButtonText: "Entendido"
        });
        return false;
      }

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: "Tipo de archivo no válido",
          text: "Solo se permiten archivos PDF, DOC o DOCX.",
          icon: "error",
          confirmButtonText: "Entendido"
        });
        return false;
      }

      return true;
    }

    return true;
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return null;

    // Validar archivo antes de subir
    const isValid = await validateFile(file, type);
    if (!isValid) {
      return null;
    }
    
    if (type === "Foto") setLoadingImage(true);
    if (type === "cv") setLoadingCv(true);

    try {
      let fileToUpload = file;
      
      // Procesar imagen si es una foto
      if (type === "Foto") {
        console.log('🖼️ Procesando imagen de perfil...');
        try {
          fileToUpload = await processAndConfirmImage(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.95
          });
          console.log('✅ Imagen procesada y optimizada');
        } catch (processError) {
          console.warn('⚠️ Error al procesar imagen, subiendo original:', processError);
          // Si falla el procesamiento, usar archivo original
        }
      }

      // 1. Crear/obtener carpeta principal "BolsaTrabajo"
      console.log('📁 Obteniendo carpeta BolsaTrabajo...');
      const folderId = await ensureAppFolder();
      console.log('✅ Carpeta BolsaTrabajo ID:', folderId);
      
      // 2. Subir archivo directamente a la carpeta BolsaTrabajo
      console.log(`📤 Subiendo ${type} a BolsaTrabajo...`);
      let fileId = await uploadFile(fileToUpload, folderId, (progress) => {
        console.log(`Progreso de ${type}: ${progress}%`);
      });
      
      console.log(`✅ ${type} subido con ID:`, fileId);
      
      // 3. Crear enlace público para que el admin pueda verlo
      console.log(`🔗 Creando enlace público para ${type} con fileId:`, fileId);
      let shareUrl;
      
      try {
        shareUrl = await createPublicShareLink(fileId, 8760); // 1 año
        console.log(`✅ Enlace público creado:`, shareUrl);
      } catch (shareError) {
        console.error(`❌ Error creando share link para ${type}:`, shareError);
        console.log(`⚠️ Guardando fileId directamente como fallback`);
        shareUrl = fileId;
      }
      
      Swal.fire("Carga exitosa", `${type} cargado con éxito.`, "success");

      if (type === "Foto") {
        setIsImageLoaded(true);
        setLoadingImage(false);
      }
      if (type === "cv") {
        setIsCvLoaded(true);
        setLoadingCv(false);
      }

      return shareUrl;
    } catch (error) {
      console.error(`Error al cargar ${type}:`, error);
      Swal.fire("Error", `Error al cargar ${type}. Inténtalo nuevamente.`, "error");
      
      if (type === "Foto") setLoadingImage(false);
      if (type === "cv") setLoadingCv(false);
      
      return null;
    }
  };

  const handleFileChange = async (e, type, callback) => {
    const file = e.target.files[0];
    const result = await handleFileUpload(file, type);
    if (result && callback) {
      callback(result);
    }
  };

  return {
    isImageLoaded,
    isCvLoaded,
    loadingImage,
    loadingCv,
    handleFileUpload,
    handleFileChange,
    // Exponer funcionalidades del procesador de imágenes
    isProcessing,
    showPreview: showImagePreview,
    selectedFile: selectedImageFile,
    setShowPreview: setShowImagePreview,
    setSelectedFile: setSelectedImageFile,
    processAndConfirmImage
  };
};


