import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Estilo padronizado para os alertas do jogo (baseado na tela 222)
export const GameAlert = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$isVisible'
})<{ $isVisible: boolean }>(({ $isVisible }) => ({
  position: 'fixed',
  right: '16px',
  padding: '12px 16px',
  background: 'rgba(139,69,19,0.95)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  zIndex: 1500,
  userSelect: 'none',
  opacity: $isVisible ? 1 : 0,
  transform: $isVisible ? 'translateX(0)' : 'translateX(100%)',
  transition: 'all 0.5s ease-in-out',
  animation: $isVisible ? 'slideInRight 0.5s ease-out' : 'none',
  '@keyframes slideInRight': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1
    }
  }
}));
