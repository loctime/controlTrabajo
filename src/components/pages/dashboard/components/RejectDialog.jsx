import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

export const RejectDialog = ({ 
  open, 
  cv, 
  motivoRechazo, 
  setMotivoRechazo, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Rechazar CV</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Proporciona un motivo para el rechazo del CV de {cv?.Nombre} {cv?.Apellido}:
        </Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Motivo del rechazo"
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
          placeholder="Ejemplo: La foto de perfil no es adecuada, el CV no está en formato correcto, etc."
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Rechazar CV
        </Button>
      </DialogActions>
    </Dialog>
  );
};



