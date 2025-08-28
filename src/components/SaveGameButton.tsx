import React, { useState } from 'react';
import { 
  Fab, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { Ficha } from '../types';
import { useClickSound } from '../hooks/useClickSound';

interface SaveGameButtonProps {
  ficha: Ficha;
}

const SaveGameButton: React.FC<SaveGameButtonProps> = ({ ficha }) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const playClick = useClickSound(0.2);

  const handleSaveClick = () => {
    playClick();
    setOpen(true);
  };

  const handleSaveGame = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Criar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `cavaleiro-trevas-${timestamp}.json`;
      
      // Preparar dados para salvar
      const saveData = {
        ficha,
        lastScreen: window.location.pathname,
        savedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      // Criar blob e download
      const blob = new Blob([JSON.stringify(saveData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSaveSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      setSaveError('Erro ao salvar o jogo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setOpen(false);
      setSaveError(null);
      setSaveSuccess(false);
    }
  };

  return (
    <>
      <Tooltip title="Salvar Jogo" placement="left">
        <Fab
          color="primary"
          aria-label="salvar jogo"
          onClick={handleSaveClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 20000,
            background: 'linear-gradient(135deg, #B67B03, #8B4513)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B4513, #B67B03)',
              transform: 'scale(1.05)',
            },
            boxShadow: '0 4px 20px rgba(182,123,3,0.4)',
          }}
        >
          <SaveIcon />
        </Fab>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(15,17,20,0.98), rgba(25,27,30,0.98))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B67B03, #8B4513)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(182,123,3,0.4)',
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '28px' }}>💾</Typography>
            </Box>
            <Typography variant="h5" sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontFamily: '"Spectral", serif',
              background: 'linear-gradient(135deg, #E0DFDB, #B8B5B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Salvar Jogo
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ py: 2 }}>
            {saveSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Jogo salvo com sucesso! O arquivo foi baixado para seu computador.
              </Alert>
            ) : (
              <>
                <Typography variant="body1" sx={{
                  mb: 3,
                  lineHeight: 1.8,
                  color: 'text.primary',
                  fontSize: '16px',
                  fontFamily: '"Spectral", serif',
                }}>
                  Salve seu progresso atual para continuar de onde parou mais tarde.
                </Typography>

                <Box sx={{
                  p: 3,
                  background: 'rgba(182,123,3,0.1)',
                  border: '1px solid rgba(182,123,3,0.2)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #B67B03',
                  mb: 3
                }}>
                  <Typography variant="body2" sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '14px',
                    mb: 1
                  }}>
                    📊 <strong>Dados do jogo atual:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    {ficha.nome && `• Nome: ${ficha.nome}`}
                    {ficha.nome && <br />}
                    {ficha.pericia?.inicial > 0 && `• Perícia: ${ficha.pericia.inicial}`}
                    {ficha.pericia?.inicial > 0 && <br />}
                    {ficha.forca?.inicial > 0 && `• Força: ${ficha.forca.inicial}`}
                    {ficha.forca?.inicial > 0 && <br />}
                    {ficha.sorte?.inicial > 0 && `• Sorte: ${ficha.sorte.inicial}`}
                    {ficha.sorte?.inicial > 0 && <br />}
                    {ficha.bolsa?.length > 0 && `• Itens na bolsa: ${ficha.bolsa.length}`}
                  </Typography>
                </Box>

                {saveError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {saveError}
                  </Alert>
                )}
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            disabled={isSaving}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'text.secondary',
              padding: '12px 24px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'text.primary',
              },
            }}
          >
            {saveSuccess ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {!saveSuccess && (
            <Button
              onClick={handleSaveGame}
              variant="contained"
              size="large"
              disabled={isSaving}
              sx={{
                background: 'linear-gradient(135deg, #B67B03, #8B4513)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 32px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(182,123,3,0.4)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B4513, #B67B03)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(182,123,3,0.6)',
                },
              }}
            >
              {isSaving ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Salvando...
                </Box>
              ) : (
                'Salvar Jogo'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveGameButton;
