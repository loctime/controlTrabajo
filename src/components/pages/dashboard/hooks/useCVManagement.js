import { useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../../../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getDownloadUrl } from '../../../../lib/controlFileStorage';
import { preloadCriticalImages } from '../../../../utils/imagePreloader';
import { precacheUrls, clearCache, getCacheStats } from '../../../../utils/imageCache';
import { shareUrlToImageUrl, isControlFileShareUrl } from '../../../../utils/shareUrl';

export const useCVManagement = () => {
  const [activeCVs, setActiveCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [rejectedCVs, setRejectedCVs] = useState([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [cvToReject, setCvToReject] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const showAlert = (title, text, icon) => {
    Swal.fire({ title, text, icon, confirmButtonText: 'Aceptar' });
  };

  const fetchCVs = async (status) => {
    const q = query(collection(db, 'cv'), where('estado', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchData = async () => {
    const activeData = await fetchCVs('aprobado');
    const pendingData = await fetchCVs('pendiente');
    const rejectedData = await fetchCVs('no aprobado');
    setActiveCVs(activeData);
    setPendingCVs(pendingData);
    setRejectedCVs(rejectedData);
    
    // Precargar y cachear imágenes críticas
    const allCvs = [...pendingData, ...activeData, ...rejectedData];
    const controlFileUrls = allCvs
      .map(cv => cv.Foto)
      .filter(url => url && isControlFileShareUrl(url));
    
    if (controlFileUrls.length > 0) {
      const criticalUrls = controlFileUrls.slice(0, 5);
      precacheUrls(criticalUrls, shareUrlToImageUrl);
    }
    
    if (pendingData.length > 0) {
      preloadCriticalImages(pendingData, 3);
    }
  };

  const handleDelete = async (cv) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'cv', cv.id));
        fetchData();
        showAlert('Eliminado', 'El CV ha sido eliminado.', 'success');
      }
    });
  };

  const handleApprove = async (cv) => {
    await updateDoc(doc(db, 'cv', cv.id), { estado: 'aprobado' });
    fetchData();
    showAlert('Aprobado', 'El CV ha sido aprobado.', 'success');
  };

  const handleRejectClick = (cv) => {
    setCvToReject(cv);
    setMotivoRechazo('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!motivoRechazo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes proporcionar un motivo para el rechazo.',
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'cv', cvToReject.id), { 
        estado: 'no aprobado',
        motivoRechazo: motivoRechazo,
        fechaRechazo: new Date()
      });
      
      setRejectDialogOpen(false);
      setCvToReject(null);
      setMotivoRechazo('');
      fetchData();
      showAlert('Rechazado', 'El CV ha sido rechazado con el motivo proporcionado.', 'success');
    } catch (error) {
      console.error('Error al rechazar CV:', error);
      showAlert('Error', 'No se pudo rechazar el CV.', 'error');
    }
  };

  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setCvToReject(null);
    setMotivoRechazo('');
  };

  const handleDownload = async (cv) => {
    if (cv.cv) {
      try {
        Swal.fire({
          title: 'Obteniendo archivo...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        console.log('📥 Obteniendo URL de descarga para:', cv.cv);
        const downloadUrl = await getDownloadUrl(cv.cv);
        
        Swal.close();
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cv.Nombre + '_' + cv.Apellido + '_CV';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('❌ Error al obtener URL de descarga:', error);
        showAlert('Error', 'No se pudo obtener el archivo. Inténtalo nuevamente.', 'error');
      }
    } else {
      showAlert('Error', 'No se encontró el archivo del CV.', 'error');
    }
  };

  const handlePreviewCV = async (cv) => {
    if (!cv.cv) {
      showAlert('Error', 'No se encontró el archivo del CV.', 'error');
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      
      console.log('📄 Abriendo vista previa para:', cv.cv);
      const downloadUrl = await getDownloadUrl(cv.cv);
      
      setPreviewUrl(downloadUrl);
      setPreviewFileName(`${cv.Nombre}_${cv.Apellido}_CV`);
      setPreviewLoading(false);
    } catch (error) {
      console.error('❌ Error al obtener URL de vista previa:', error);
      showAlert('Error', 'No se pudo cargar la vista previa del CV.', 'error');
      setPreviewLoading(false);
      setPreviewOpen(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewFileName('');
    setPreviewLoading(false);
  };

  const handleCacheClick = () => {
    const stats = getCacheStats();
    Swal.fire({
      title: 'Cache de Imágenes',
      html: `
        <div style="text-align: center;">
          <p><strong>${stats.total} imágenes cacheadas</strong></p>
          <p style="color: #666; font-size: 0.9em;">
            Cache persistente: ${stats.persistentCache}<br/>
            Cache de sesión: ${stats.sessionCache}
          </p>
        </div>
      `,
      confirmButtonText: 'Limpiar Cache',
      showCancelButton: true,
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        clearCache();
        Swal.fire('Cache limpiado', 'El cache de imágenes ha sido limpiado.', 'success');
      }
    });
  };

  return {
    activeCVs,
    pendingCVs,
    rejectedCVs,
    rejectDialogOpen,
    motivoRechazo,
    setMotivoRechazo,
    cvToReject,
    previewOpen,
    previewUrl,
    previewFileName,
    previewLoading,
    fetchData,
    handleDelete,
    handleApprove,
    handleRejectClick,
    handleRejectConfirm,
    handleRejectCancel,
    handleDownload,
    handlePreviewCV,
    handleClosePreview,
    handleCacheClick
  };
};


