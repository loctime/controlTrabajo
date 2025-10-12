import { memo } from 'react';

/**
 * Función de comparación optimizada para formularios
 * Compara solo los campos relevantes de newCv en lugar de todo el objeto
 */
export const createFormComparison = (relevantFields) => {
  return (prevProps, nextProps) => {
    // Comparar handleChange (debe ser estable)
    if (prevProps.handleChange !== nextProps.handleChange) {
      return false;
    }
    
    // Si no hay campos específicos definidos, comparar referencia completa
    if (!relevantFields || relevantFields.length === 0) {
      return prevProps.newCv === nextProps.newCv;
    }
    
    // Comparar solo los campos relevantes para este formulario
    for (const field of relevantFields) {
      if (prevProps.newCv[field] !== nextProps.newCv[field]) {
        return false; // Hubo un cambio en un campo relevante
      }
    }
    
    // También comparar cualquier otra prop que pueda venir
    for (const key in prevProps) {
      if (key !== 'newCv' && key !== 'handleChange') {
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }
    }
    
    return true; // No hubo cambios relevantes, no re-renderizar
  };
};

/**
 * Wrapper para memorizar componentes de formulario con campos específicos
 */
export const withFormMemo = (Component, relevantFields = null) => {
  const MemoizedComponent = memo(Component, createFormComparison(relevantFields));
  MemoizedComponent.displayName = Component.displayName || Component.name || 'MemoizedFormComponent';
  return MemoizedComponent;
};

