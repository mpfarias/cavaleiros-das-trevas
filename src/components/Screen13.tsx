import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, TextField, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useDiceSound } from '../hooks/useDiceSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DiceRollModal3D from './ui/DiceRollModal3D';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.4)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)'
});

const BetInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: '"Cinzel", serif',
    fontSize: '16px',
    color: '#3d2817',
    backgroundColor: 'rgba(245,222,179,0.8)',
    border: '2px solid #8B4513',
    borderRadius: '8px',
    '&:hover': {
      borderColor: '#D2B48C',
    },
    '&.Mui-focused': {
      borderColor: '#FFD700',
      boxShadow: '0 0 0 2px rgba(255,215,0,0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Cinzel", serif',
    color: '#8B4513',
    fontWeight: 600,
  },
  marginBottom: '24px',
});

interface Screen13Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen13: React.FC<Screen13Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(162);
  const playClick = useClickSound(0.2);
  
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState('');
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  
  const availableGold = ficha?.bolsa?.find(item => item.tipo === 'ouro')?.quantidade || 0;
  
  const validateBet = (value: string) => {
    const numValue = parseInt(value);
    if (!value || isNaN(numValue) || numValue <= 0) {
      setError('Digite um valor válido maior que 0');
      return false;
    }
    if (numValue > availableGold) {
      setError(`Você só tem ${availableGold} moedas disponíveis`);
      return false;
    }
    setError('');
    return true;
  };
  
  const startGame = () => {
    if (!validateBet(betAmount)) return;
    
    setShowDiceModal(true);
    setGameResult(null);
    setDiceResult(null);
  };

  const handleDiceComplete = (dice: number[], total: number) => {
    const result = dice[0]; // Pega o resultado do primeiro (e único) dado
    
    setDiceResult(result);
    setShowDiceModal(false);
    
    // Verificar resultado (regras da tela 13: 2+ para vencer, 1 perde)
    if (result >= 2) {
      setGameResult('win');
      localStorage.setItem('cavaleiro:apostaBartolph', betAmount);
      // Atualizar ficha com moedas ganhas
      const fichaAtualizada = { ...ficha };
      const moedasOuro = fichaAtualizada.bolsa.find(item => item.tipo === 'ouro');
      if (moedasOuro && moedasOuro.quantidade !== undefined) {
        moedasOuro.quantidade += parseInt(betAmount);
      }
      onUpdateFicha(fichaAtualizada);
    } else {
      setGameResult('lose');
      localStorage.setItem('cavaleiro:apostaBartolph', betAmount);
      // Atualizar ficha com moedas perdidas
      const fichaAtualizada = { ...ficha };
      const moedasOuro = fichaAtualizada.bolsa.find(item => item.tipo === 'ouro');
      if (moedasOuro && moedasOuro.quantidade !== undefined) {
        moedasOuro.quantidade = Math.max(0, moedasOuro.quantidade - parseInt(betAmount));
      }
      onUpdateFicha(fichaAtualizada);
    }
    
  };
  
  const navigateToNext = () => {
    if (diceResult === 1) {
      onGoToScreen(175); // Resultado 1
    } else {
      onGoToScreen(54); // Resultado 2-6
    }
  };
  
  useEffect(() => {
    return () => {
      setShowDiceModal(false);
      setDiceResult(null);
      setGameResult(null);
    };
  }, []);

  return (
    <Container data-screen="screen-13">
      {/* Controle de Volume */}
      <VolumeControl />
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={() => {
              playClick();
              togglePlay();
            }}
            disabled={!currentGroup}
            sx={{
              color: currentGroup ? (isPlaying ? '#B31212' : '#E0DFDB') : '#666',
              background: 'rgba(15,17,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              opacity: currentGroup ? 1 : 0.5,
              '&:hover': currentGroup ? {
                background: 'rgba(179,18,18,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
              } : {},
              '&:disabled': {
                cursor: 'not-allowed'
              }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Anote a quantidade de Moedas de Ouro que deseja apostar e aposte
          </NarrativeText>
          
          {!diceResult && (
            <>
              <BetInput
                label="Digite o valor que queira apostar"
                type="number"
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(e.target.value);
                  if (error) setError('');
                }}
                onBlur={() => validateBet(betAmount)}
                error={!!error}
                helperText={error}
                inputProps={{ min: 1, max: availableGold }}
                fullWidth
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  onClick={startGame}
                  disabled={!betAmount || !!error || parseInt(betAmount) <= 0 || parseInt(betAmount) > availableGold}
                  sx={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                    color: '#F5DEB3',
                    border: '2px solid #D2B48C',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: '"Cinzel", serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    width: 'auto',
                    '&:focus-visible': {
                      outline: '2px solid #FFD700',
                      outlineOffset: '2px'
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                      borderColor: '#FFD700',
                      color: '#FFFFFF',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)'
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  Apostar e Jogar Dado
                </Button>
              </Box>
              
            </>
          )}

          {diceResult && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="h5" sx={{ 
                fontFamily: '"Cinzel", serif', 
                color: gameResult === 'win' ? '#4CAF50' : '#F44336',
                mb: 2
              }}>
                {gameResult === 'win' ? '🎉 Você Ganhou!' : '💸 Você Perdeu!'}
              </Typography>
              
              <Typography variant="h6" sx={{ 
                fontFamily: '"Spectral", serif', 
                color: '#3d2817',
                mb: 3
              }}>
                Resultado do dado: {diceResult}
                <br />
                {gameResult === 'win' 
                  ? `Você ganhou ${betAmount} moedas!` 
                  : `Você perdeu ${betAmount} moedas.`
                }
              </Typography>
              
              <Button
                onClick={navigateToNext}
                sx={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                  color: '#F5DEB3',
                  border: '2px solid #D2B48C',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                    borderColor: '#FFD700',
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                Continuar
              </Button>
            </Box>
          )}
        </CardContent>
      </CardWrap>

      {/* Modal de dados 3D */}
      <DiceRollModal3D
        open={showDiceModal}
        numDice={1}
        onComplete={handleDiceComplete}
      />
    </Container>
  );
};

export default Screen13;
