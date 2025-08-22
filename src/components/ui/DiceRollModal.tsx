import { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Animação de rolagem dos dados
const diceRoll = keyframes`
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  20% { transform: rotateX(90deg) rotateY(180deg) rotateZ(45deg); }
  40% { transform: rotateX(180deg) rotateY(360deg) rotateZ(90deg); }
  60% { transform: rotateX(270deg) rotateY(540deg) rotateZ(135deg); }
  80% { transform: rotateX(360deg) rotateY(720deg) rotateZ(180deg); }
  90% { transform: rotateX(380deg) rotateY(740deg) rotateZ(185deg); }
  100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(180deg); }
`;

// Animação de entrada suave dos resultados
const fadeInScale = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.5); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1); 
  }
`;

const ModalContainer = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 100%)',
    border: '3px solid #8B4513',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    minWidth: '300px',
    maxWidth: '400px',
    padding: '20px'
  }
});

const DiceContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  padding: '40px 20px',
  minHeight: '120px'
});

const DiceCube = styled(Box)<{ isRolling: boolean; value?: number }>(({ isRolling, value }) => ({
  width: '60px',
  height: '60px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
  border: '2px solid #333',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  animation: isRolling 
    ? `${diceRoll} 2s ease-out forwards` 
    : value 
    ? `${fadeInScale} 0.5s ease-out forwards`
    : 'none',
  transformStyle: 'preserve-3d',
  perspective: '1000px',
  transition: 'all 0.3s ease'
}));

const ResultText = styled(Typography)({
  textAlign: 'center',
  fontFamily: '"Cinzel", serif',
  fontSize: '18px',
  fontWeight: '700',
  color: '#4a2c00',
  marginTop: '16px',
  textShadow: '1px 1px 2px rgba(245,222,179,0.8)'
});

const LoadingText = styled(Typography)({
  textAlign: 'center',
  fontFamily: '"Spectral", serif',
  fontSize: '16px',
  color: '#8B4513',
  fontStyle: 'italic',
  marginTop: '8px'
});

interface DiceRollModalProps {
  open: boolean;
  numDice: 1 | 2;
  onComplete: (dice: number[], total: number) => void;
  bonus?: number;
  rollFunction: () => { dice: number[]; total: number } | number[];
}

const DiceRollModal: React.FC<DiceRollModalProps> = ({
  open,
  numDice,
  onComplete,
  bonus = 0,
  rollFunction
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState<number[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      // Reset state
      setResults(null);
      setTotal(null);
      setIsRolling(true);

      // Simular tempo de rolagem dos dados
      const rollTimer = setTimeout(() => {
        const rollResult = rollFunction();
        
        let dice: number[];
        let finalTotal: number;

        if (Array.isArray(rollResult)) {
          // Se rollFunction retorna apenas array de dados
          dice = rollResult;
          finalTotal = dice.reduce((sum, die) => sum + die, 0) + bonus;
        } else {
          // Se rollFunction retorna objeto { dice, total }
          dice = rollResult.dice;
          finalTotal = rollResult.total;
        }

        setResults(dice);
        setTotal(finalTotal);
        setIsRolling(false);

        // Auto-close após mostrar resultado
        const closeTimer = setTimeout(() => {
          onComplete(dice, finalTotal);
        }, 2000); // Mantido em 2000ms para garantir precisão na leitura dos resultados

        return () => clearTimeout(closeTimer);
      }, 800); // Reduzido de 2000ms para 800ms para maior responsividade na inicialização

      return () => clearTimeout(rollTimer);
    }
  }, [open, rollFunction, bonus, onComplete]);

  const formatResult = () => {
    if (!results || total === null) return '';
    
    if (numDice === 1) {
      return bonus > 0 
        ? `Dado: ${results[0]} + Bônus: ${bonus} = Total: ${total}`
        : `Resultado: ${results[0]}`;
    } else {
      return bonus > 0 
        ? `Dados: ${results.join(' + ')} + Bônus: ${bonus} = Total: ${total}`
        : `Resultado: ${results.join(' + ')} = ${total}`;
    }
  };

  return (
    <ModalContainer
      open={open}
      onClose={() => {}} // Não permite fechar manualmente
      maxWidth="xs"
      fullWidth
    >
      <DialogContent sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Cinzel", serif',
            fontWeight: '700',
            color: '#4a2c00',
            marginBottom: '20px'
          }}
        >
          {isRolling ? 'Rolando...' : 'Resultado'}
        </Typography>

        <DiceContainer>
          {Array.from({ length: numDice }).map((_, index) => (
            <DiceCube
              key={index}
              isRolling={isRolling}
              value={results?.[index]}
            >
              {isRolling ? '?' : results?.[index] || '?'}
            </DiceCube>
          ))}
        </DiceContainer>

        {isRolling ? (
          <LoadingText>
            Rolando os dados...
          </LoadingText>
        ) : results ? (
          <ResultText>
            {formatResult()}
          </ResultText>
        ) : null}
      </DialogContent>
    </ModalContainer>
  );
};

export default DiceRollModal;
