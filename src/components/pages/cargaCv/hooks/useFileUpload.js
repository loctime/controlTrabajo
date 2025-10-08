import { useState } from 'react';
import Swal from 'sweetalert2';
import { uploadFile, ensureAppFolder, createPublicShareLink } from '../../../../lib/controlFileStorage';

export const useFileUpload = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isCvLoaded, setIsCvLoaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);

  const handleFileUpload = async (file, type) => {
    if (!file) return null;
    
    if (type === "Foto") setLoadingImage(true);
    if (type === "cv") setLoadingCv(true);

    try {
      // 1. Crear/obtener carpeta principal "BolsaTrabajo"
      console.log('📁 Obteniendo carpeta BolsaTrabajo...');
      const folderId = await ensureAppFolder();
      console.log('✅ Carpeta BolsaTrabajo ID:', folderId);
      
      // 2. Subir archivo directamente a la carpeta BolsaTrabajo
      console.log(`📤 Subiendo ${type} a BolsaTrabajo...`);
      let fileId = await uploadFile(file, folderId, (progress) => {
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
    handleFileChange
  };
};


