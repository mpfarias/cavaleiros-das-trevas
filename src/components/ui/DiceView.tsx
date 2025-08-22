import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Animações aprimoradas
const diceRoll = keyframes`
  0% { transform: rotate(0deg) scale(1) translateY(0); }
  20% { transform: rotate(72deg) scale(1.1) translateY(-2px); }
  40% { transform: rotate(144deg) scale(1.15) translateY(-4px); }
  60% { transform: rotate(216deg) scale(1.1) translateY(-2px); }
  80% { transform: rotate(288deg) scale(1.05) translateY(-1px); }
  100% { transform: rotate(360deg) scale(1) translateY(0); }
`;

const diceHover = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const particleFloat = keyframes`
  0% { opacity: 0; transform: translateY(0) scale(0); }
  50% { opacity: 1; transform: translateY(-10px) scale(1); }
  100% { opacity: 0; transform: translateY(-20px) scale(0); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(245,222,179,0.3), 0 0 10px rgba(245,222,179,0.2); }
  50% { box-shadow: 0 0 15px rgba(245,222,179,0.5), 0 0 25px rgba(245,222,179,0.3); }
`;

const DiceContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
  position: 'relative',
  padding: '20px',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
});

const Die = styled(Box, { shouldForwardProp: (prop) => prop !== 'isRolling' })<{ isRolling?: boolean }>(({ isRolling }) => ({
  width: 64,
  height: 64,
  background: 'linear-gradient(135deg, #F5DEB3 0%, #D2B48C 50%, #CD853F 100%)',
  border: '3px solid #8B4513',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  fontWeight: 900,
  color: '#8B4513',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease',
  animation: isRolling ? `${diceRoll} 0.6s ease-in-out` : 'none',
  userSelect: 'none',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  
  // Efeito de hover aprimorado
  '&:hover': {
    transform: 'scale(1.05) translateY(-2px)',
    boxShadow: '0 8px 25px rgba(139,69,19,0.4), 0 4px 15px rgba(0,0,0,0.2)',
    animation: `${diceHover} 1s ease-in-out infinite`,
  },
  
  // Efeito de glow quando está rolando
  ...(isRolling && {
    animation: `${diceRoll} 0.6s ease-in-out, ${glowPulse} 0.8s ease-in-out infinite`,
    boxShadow: '0 0 20px rgba(245,222,179,0.6), 0 0 40px rgba(245,222,179,0.3)',
  }),
  
  // Efeito de profundidade
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '2px',
    left: '2px',
    right: '2px',
    bottom: '2px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
    borderRadius: '8px',
    pointerEvents: 'none',
  }
}));

// Componente de partículas flutuantes
const FloatingParticle = styled(Box)<{ delay: number; left: number }>(({ delay, left }) => ({
  position: 'absolute',
  width: '4px',
  height: '4px',
  background: 'radial-gradient(circle, rgba(245,222,179,0.8) 0%, rgba(245,222,179,0.3) 100%)',
  borderRadius: '50%',
  left: `${left}%`,
  top: '50%',
  animation: `${particleFloat} 2s ease-out infinite`,
  animationDelay: `${delay}s`,
  pointerEvents: 'none',
}));

export interface DiceViewProps {
  values: number[] | null;
  label?: string;
  isRolling?: boolean;
  onClick?: () => void;
  numDice?: 1 | 2;
}

const DiceView: React.FC<DiceViewProps> = ({ values, label, isRolling, onClick, numDice = 1 }) => {
  const shown = values && values.length >= numDice ? values.slice(0, numDice) : Array.from({ length: numDice }).map(() => null);
  
  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      {label && (
        <Typography 
          sx={{ 
            color: '#F5DEB3', 
            mb: 2, 
            fontFamily: '"Cinzel", serif', 
            fontWeight: 600,
            fontSize: '18px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#FFD700',
              textShadow: '0 2px 8px rgba(255,215,0,0.6)',
            }
          }}
        >
          {label}
        </Typography>
      )}
      
      <DiceContainer 
        role={onClick ? 'button' : undefined} 
        tabIndex={onClick ? 0 : -1}
        onClick={onClick}
        onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
        aria-label={label || 'Dados'}
        title={onClick ? 'Clique para rolar' : undefined}
        sx={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* Partículas flutuantes quando está rolando */}
        {isRolling && (
          <>
            <FloatingParticle delay={0} left={20} />
            <FloatingParticle delay={0.3} left={40} />
            <FloatingParticle delay={0.6} left={60} />
            <FloatingParticle delay={0.9} left={80} />
          </>
        )}
        
        {shown.map((v, i) => (
          <Die key={i} isRolling={isRolling}>
            {v ?? '?'}
          </Die>
        ))}
      </DiceContainer>
    </Box>
  );
};

export default DiceView;


