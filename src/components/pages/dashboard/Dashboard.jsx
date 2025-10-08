import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';

// Hook personalizado
import { useCVManagement } from './hooks/useCVManagement';

// Componentes
import { ViewSwitcher } from './components/ViewSwitcher';
import { CVCard } from './components/CVCard';
import { RejectDialog } from './components/RejectDialog';
import { PreviewModal } from './components/PreviewModal';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('pending');
  
  const {
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
  } = useCVManagement();

  useEffect(() => {
    fetchData();
  }, []);

  // Obtener los CVs actuales según la vista
  const getCurrentCVs = () => {
    switch (currentView) {
      case 'active':
        return activeCVs;
      case 'pending':
        return pendingCVs;
      case 'rejected':
        return rejectedCVs;
      default:
        return [];
    }
  };

  // Obtener chip de estado
  const getStatusChip = (view) => {
    switch (view) {
      case 'active':
        return { label: 'Aprobado', color: 'success' };
      case 'pending':
        return { label: 'Pendiente', color: 'warning' };
      case 'rejected':
        return { label: 'Rechazado', color: 'error' };
      default:
        return { label: 'Desconocido', color: 'default' };
    }
  };

  const currentCVs = getCurrentCVs();
  const statusChip = getStatusChip(currentView);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header con título y botones de vista */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Panel de Administración de CVs
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <ViewSwitcher
            currentView={currentView}
            setCurrentView={setCurrentView}
            pendingCount={pendingCVs.length}
            activeCount={activeCVs.length}
            rejectedCount={rejectedCVs.length}
            onCacheClick={handleCacheClick}
          />
        </Box>
      </Box>

      {/* Grid de Cards */}
      {currentCVs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay CVs {currentView === 'active' ? 'aprobados' : currentView === 'pending' ? 'pendientes' : 'rechazados'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentCVs.map((cv) => (
            <Grid item xs={12} sm={6} md={4} key={cv.id}>
              <CVCard
                cv={cv}
                currentView={currentView}
                statusChip={statusChip}
                onPreview={handlePreviewCV}
                onDownload={handleDownload}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para rechazar CV */}
      <RejectDialog
        open={rejectDialogOpen}
        cv={cvToReject}
        motivoRechazo={motivoRechazo}
        setMotivoRechazo={setMotivoRechazo}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />

      {/* Modal de Vista Previa */}
      <PreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        url={previewUrl}
        fileName={previewFileName}
        loading={previewLoading}
      />
    </Container>
  );
};

export default Dashboard;
