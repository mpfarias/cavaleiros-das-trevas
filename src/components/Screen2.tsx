import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';

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

interface Screen2Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen2: React.FC<Screen2Props> = ({ onGoToScreen, ficha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(2);
  const playClick = useClickSound(0.2);
  const [diceOpen, setDiceOpen] = useState(false);
  const [showSkillAlert, setShowSkillAlert] = useState(false);
  const [skillResult, setSkillResult] = useState('');

  const handleStartTest = () => {
    playClick();
    setDiceOpen(true);
  };

  const handleDiceComplete = (_dice: number[], total: number) => {
    setDiceOpen(false);
    const periciaAtual = ficha?.pericia?.atual || 0;
    const isSuccess = total <= periciaAtual;
    if (isSuccess) {
      setSkillResult(`Sucesso! Dados: ${total} - Você consegue realizar o salto!`);
      setShowSkillAlert(true);
      setTimeout(() => {
        setShowSkillAlert(false);
        onGoToScreen(24);
      }, 4000);
    } else {
      setSkillResult(`Você falhou no teste de Perícia! Dados: ${total}`);
      setShowSkillAlert(true);
      setTimeout(() => {
        setShowSkillAlert(false);
        onGoToScreen(131);
      }, 4000);
    }
  };

  return (
    <Container data-screen="screen-2">
      <VolumeControl />

      {currentGroup && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => { playClick(); togglePlay?.(); }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            O salto não vai ser fácil. Faça teste de Perícia
          </NarrativeText>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              onClick={handleStartTest}
              variant="contained"
              sx={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                color: '#F5DEB3',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                  borderColor: '#654321',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Fazer teste de PERÍCIA
            </Button>
          </Box>
        </CardContent>
      </CardWrap>

      <DiceRollModal3D
        open={diceOpen}
        numDice={2}
        onComplete={handleDiceComplete}
        title={'Teste de PERÍCIA'}
      />

      {showSkillAlert && (
        <GameAlert sx={{ top: '120px', zIndex: 1200 }} $isVisible={showSkillAlert}>
          {skillResult}
        </GameAlert>
      )}
    </Container>
  );
};

export default Screen2;


