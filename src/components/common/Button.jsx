import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

/**
 * Componente Button reutilizable con estilos consistentes
 * Wrapper de MUI Button con mejoras de UX
 */
export const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  sx = {},
  ...props 
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      sx={{
        position: 'relative',
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: 'absolute',
            left: '50%',
            marginLeft: '-10px',
            color: 'inherit',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </MuiButton>
  );
};

export default Button;

