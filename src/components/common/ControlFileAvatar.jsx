import React, { useState, useEffect } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import { getDownloadUrl } from '../../lib/controlFileStorage';

/**
 * Avatar que carga imágenes desde ControlFile
 * @param {string} fileId - ID del archivo en ControlFile
 * @param {object} props - Props adicionales para el Avatar de MUI
 */
const ControlFileAvatar = ({ fileId, ...props }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!fileId) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        setLoading(true);
        // Obtener URL temporal de ControlFile
        const url = await getDownloadUrl(fileId);
        setImageUrl(url);
        setError(false);
      } catch (err) {
        console.error('Error al cargar imagen:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
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
      <Avatar {...props}>?</Avatar>
    );
  }

  return <Avatar src={imageUrl} {...props} />;
};

export default ControlFileAvatar;

