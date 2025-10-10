import { useState, useEffect } from 'react';

export const useAutoFillUserData = (currentUser, currentCv) => {
  const [autoFillApplied, setAutoFillApplied] = useState(false);

  useEffect(() => {
    if (currentUser && !autoFillApplied && !currentCv) {
      autoFillData();
    }
  }, [currentUser, currentCv]);

  const autoFillData = async () => {
    if (!currentUser) {
      console.warn('No hay usuario autenticado para auto-completar');
      return {};
    }

    try {
      const userData = {
        Email: currentUser.email || "",
        // Intentar extraer nombre y apellido del displayName
        ...(currentUser.displayName && {
          Nombre: currentUser.displayName.split(' ')[0] || "",
          Apellido: currentUser.displayName.split(' ').slice(1).join(' ') || ""
        }),
      };

      setAutoFillApplied(true);
      return userData;
    } catch (error) {
      console.error('Error en auto-completado:', error);
      return {};
    }
  };

  return { autoFillData, autoFillApplied };
};


