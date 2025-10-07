import React, { useState, useEffect, useRef } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import { getDownloadUrl } from '../../lib/controlFileStorage';

/**
 * Verifica si una cadena es una URL válida
 */
const isUrl = (str) => {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Avatar que carga imágenes desde ControlFile o URLs directas
 * @param {string} fileId - ID del archivo en ControlFile o URL directa
 * @param {object} props - Props adicionales para el Avatar de MUI
 */
const ControlFileAvatar = ({ fileId, ...props }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Reset mounted flag
    isMounted.current = true;

    const loadImage = async () => {
      if (!fileId) {
        if (isMounted.current) {
          setLoading(false);
          setError(true);
        }
        return;
      }

      // Si es una URL directa (CVs viejos), usarla directamente
      if (isUrl(fileId)) {
        console.log('✅ Usando URL directa (CV antiguo):', fileId);
        if (isMounted.current) {
          setImageUrl(fileId);
          setError(false);
          setLoading(false);
        }
        return;
      }

      // Si es un fileId de ControlFile, obtener URL temporal
      try {
        if (isMounted.current) {
          setLoading(true);
        }
        
        console.log('📥 Obteniendo URL de ControlFile para fileId:', fileId);
        const url = await getDownloadUrl(fileId);
        
        if (isMounted.current) {
          setImageUrl(url);
          setError(false);
          console.log('✅ URL obtenida correctamente');
        }
      } catch (err) {
        console.error('❌ Error al cargar imagen de ControlFile:', err.message);
        if (isMounted.current) {
          setError(true);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup para evitar bucles infinitos
    return () => {
      isMounted.current = false;
    };
  }, [fileId]);

  if (loading) {
    return (
      <Avatar {...props}>
        <CircularProgress size={24} />
      </Avatar>
    );
  }

  if (error || !imageUrl) {
    return (
      <Avatar {...props} sx={{ bgcolor: 'grey.400', ...props.sx }}>
        ?
      </Avatar>
    );
  }

  return <Avatar src={imageUrl} {...props} />;
};

export default ControlFileAvatar;

