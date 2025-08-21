import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { useAudioGroup } from '../hooks/useAudioGroup';
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

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
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

interface Screen115Props {
  onGoToScreen: (id: number) => void;
  ficha: Ficha;
  onAdjustSorte: (delta: number) => void;
}

const Screen115: React.FC<Screen115Props> = ({ onGoToScreen, ficha, onAdjustSorte }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'bartolph-game'
  const { currentGroup, isPlaying, togglePlay, currentTrack } = useAudioGroup(115);
  const [rolled, setRolled] = useState<[number, number] | null>(null);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const total = useMemo(() => (rolled ? rolled[0] + rolled[1] : null), [rolled]);
  const sorteAtual = ficha.sorte.atual;
  const teveSorte = useMemo(() => (total != null ? total <= sorteAtual : null), [total, sorteAtual]);

  const handleDiceComplete = (dice: number[]) => {
    setRolled([dice[0], dice[1]]);
    onAdjustSorte(-1); // sempre reduz 1 ponto de SORTE atual
    setOpen(true);
    setDiceModalOpen(false);
  };

  const testarSorte = () => {
    setDiceModalOpen(true);
  };
  return (
    <Container data-screen="screen-115">
      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentTrack ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={togglePlay}
            disabled={!currentTrack}
            sx={{
              color: currentTrack ? (isPlaying ? '#B31212' : '#E0DFDB') : '#666',
              background: 'rgba(15,17,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              opacity: currentTrack ? 1 : 0.5,
              '&:hover': currentTrack ? {
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
            Teste sua sorte e vamos ver como se sai.
          </NarrativeText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <Button variant="contained" onClick={testarSorte} sx={{
              background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
              border: '1px solid #D2B48C',
              fontFamily: '"Cinzel", serif',
              fontWeight: 700
            }}>
              Testar a Sorte (2d6)
            </Button>
            <Typography variant="caption" sx={{ color: '#CBBBA0' }}>
              A SORTE atual é {sorteAtual}. Você perderá 1 ponto ao testar.
            </Typography>
          </Box>

          {/* Modal 3D de dados */}
          <DiceRollModal3D
            open={diceModalOpen}
            numDice={2}
            onComplete={handleDiceComplete}
            bonus={0}
          />

          <Dialog open={open} onClose={undefined} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center' }}>
              {teveSorte ? 'Você teve sorte' : 'Você não teve sorte'}
            </DialogTitle>
            <DialogContent>
              <Typography align="center" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                Dados: {rolled ? `${rolled[0]} + ${rolled[1]} = ${total}` : ''}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => { setOpen(false); onGoToScreen(teveSorte ? 222 : 30); }}>
                Ir
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen115;


