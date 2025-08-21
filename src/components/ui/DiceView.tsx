import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const diceRoll = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.05); }
  50% { transform: rotate(180deg) scale(1.1); }
  75% { transform: rotate(270deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
`;

const DiceContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '14px',
});

const Die = styled(Box, { shouldForwardProp: (prop) => prop !== 'isRolling' })<{ isRolling?: boolean }>(({ isRolling }) => ({
  width: 64,
  height: 64,
  background: 'linear-gradient(135deg, #F5DEB3 0%, #D2B48C 100%)',
  border: '3px solid #8B4513',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  fontWeight: 900,
  color: '#8B4513',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  transition: 'transform 0.3s ease',
  animation: isRolling ? `${diceRoll} 0.6s ease-in-out` : 'none',
  userSelect: 'none'
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
    <Box sx={{ textAlign: 'center' }}>
      {label && (
        <Typography sx={{ color: '#F5DEB3', mb: 1, fontFamily: '"Cinzel", serif', fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      <DiceContainer role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : -1}
        onClick={onClick}
        onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
        aria-label={label || 'Dados'}
        title={onClick ? 'Clique para rolar' : undefined}
        sx={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {shown.map((v, i) => (
          <Die key={i} isRolling={isRolling}>{v ?? '?'}</Die>
        ))}
      </DiceContainer>
    </Box>
  );
};

export default DiceView;


