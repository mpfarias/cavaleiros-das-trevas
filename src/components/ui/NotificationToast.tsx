import React, { memo } from 'react';
import { Box, Typography, IconButton, Fade } from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { NotificationSeverity } from '../../hooks/useNotification';
import { NOTIFICATION_CONFIG } from '../../constants/character';

interface NotificationToastProps {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = memo(({
  open,
  message,
  severity,
  onClose
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'success': return <CheckCircleIcon sx={{ color: 'white', fontSize: '24px' }} />;
      case 'info': return <InfoIcon sx={{ color: 'white', fontSize: '24px' }} />;
      case 'warning': return <WarningIcon sx={{ color: 'white', fontSize: '24px' }} />;
      case 'error': return <ErrorIcon sx={{ color: 'white', fontSize: '24px' }} />;
    }
  };

  const getBackgroundColor = () => {
    switch (severity) {
      case 'success': return 'linear-gradient(135deg, #4CAF50, #45a049)';
      case 'info': return 'linear-gradient(135deg, #2196F3, #1976D2)';
      case 'warning': return 'linear-gradient(135deg, #FF9800, #F57C00)';
      case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
    }
  };

  return (
    <Fade in={open} timeout={NOTIFICATION_CONFIG.transition.enter}>
      <Box
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          display: open ? 'flex' : 'none',
          alignItems: 'center',
          gap: 2,
          padding: '16px 24px',
          background: 'linear-gradient(135deg, rgba(15,17,20,0.95), rgba(25,27,30,0.95))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          minWidth: '300px',
          maxWidth: '500px',
          animation: open ? 'notificationSlideIn 0.3s ease-out' : 'none',
          '@keyframes notificationSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0.8)',
            },
            '100%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
            },
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: getBackgroundColor(),
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {getIcon()}
        </Box>

        {/* Message */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            flex: 1,
            textAlign: 'center',
            fontSize: '16px',
          }}
        >
          {message}
        </Typography>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Fechar notificação"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              background: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
});

NotificationToast.displayName = 'NotificationToast';

export default NotificationToast;
