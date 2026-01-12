import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: 'transparent',
    boxShadow: 'none',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'visible'
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(4px)'
  }
}));

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${fadeIn} 0.3s ease-out`,
  '& img': {
    maxWidth: '100%',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
  }
}));

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#FFFFFF',
  background: 'rgba(0, 0, 0, 0.6)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  zIndex: 1600,
  '&:hover': {
    background: 'rgba(179, 18, 18, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  transition: 'all 0.2s ease'
});

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ open, onClose, imageSrc, imageAlt }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none'
        }
      }}
    >
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        <CloseButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </CloseButton>
        <ImageContainer>
          <img src={imageSrc} alt={imageAlt} />
        </ImageContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default ImageModal;
