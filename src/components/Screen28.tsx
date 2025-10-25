import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
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

const ActionButton = styled('button')({
  padding: '16px 32px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '18px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
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
  }
});

interface Screen28Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen28: React.FC<Screen28Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(28);
  const playClick = useClickSound(0.2);
  const [showDiceModal, setShowDiceModal] = useState(false);

  const handleRolarDado = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (dice: number[], total: number) => {
    setShowDiceModal(false);
    
    const resultado = dice[0]; // Pegar apenas o primeiro dado
    
    // Mapear resultado para tela de destino
    const destinoMap: Record<number, number> = {
      1: 8,
      2: 394,
      3: 259,
      4: 183,
      5: 245
    };
    
    // Se for 6, rolar novamente (não fazer nada, o modal já fechou)
    if (resultado === 6) {
      // Reabrir o modal para rolar novamente
      setTimeout(() => setShowDiceModal(true), 500);
      return;
    }
    
    // Navegar para a tela correspondente
    const telaDestino = destinoMap[resultado];
    if (telaDestino) {
      setTimeout(() => onGoToScreen(telaDestino), 1000);
    }
  };

  return (
    <Container data-screen="screen-28">
      {/* Modal de Dados */}
      <DiceRollModal3D
        open={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        onComplete={handleDiceRoll}
        numDice={1}
      />

      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de Música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <span>
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
          </span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Sabendo que não tem condições de enfrentar os cinco Cavaleiros das Trevas ao mesmo tempo, você dá meia-volta e corre para o norte. Felizmente, adiante o caminho se estreita, forçando os Cavaleiros a avançarem em fila. Apenas um deles consegue se aproximar o bastante para tentar capturá-lo.
            <br/><br/>
            Você terá que enfrentá-lo e derrotá-lo antes que os demais alcancem você.
            <br/><br/>
            Role 1 dado para descobrir qual dos cinco Cavaleiros você enfrentará.
          </NarrativeText>

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <ActionButton onClick={handleRolarDado}>
              🎲 Rolar Dado
            </ActionButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen28;

