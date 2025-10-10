import { useState, useEffect } from 'react';

export const useAutoFillUserData = (currentUser, currentCv) => {
  const [autoFillApplied, setAutoFillApplied] = useState(false);

  useEffect(() => {
    if (currentUser && !autoFillApplied && !currentCv) {
      autoFillData();
    }
  }, [currentUser, currentCv]);

  const autoFillData = async () => {
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
  };

  return { autoFillData, autoFillApplied };
};


