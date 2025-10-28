import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const smokeAnimation = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 0.3; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.5); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a0f08 0%, #2c1810 25%, #1a0f08 50%, #0a0503 75%, #000000 100%),
    radial-gradient(circle at 50% 50%, rgba(139,69,19,0.1) 0%, transparent 70%)
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

const SmokeEffect = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '200px',
  height: '200px',
  background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, transparent 70%)',
  borderRadius: '50%',
  animation: `${smokeAnimation} 3s ease-out infinite`,
  pointerEvents: 'none',
  zIndex: 0
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

interface Screen335Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen335: React.FC<Screen335Props> = ({ onGoToScreen }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(335);
  const playClick = useClickSound(0.2);

  const handleChoice = (screenId: number) => {
    playClick();
    onGoToScreen(screenId);
  };

  return (
    <Container data-screen="screen-335">
      {/* Efeito de fumaça de fundo */}
      <SmokeEffect />
      
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
        <CardContent sx={{ padding: '40px', position: 'relative', zIndex: 1 }}>
          <NarrativeText>
            Apesar de a batalha ter sido árdua, você finalmente vence o inimigo.
            <br/><br/>
            O Cavaleiro das Trevas geme e cai de joelhos, o som metálico de sua armadura ecoando pelo campo.
            <br/>
            Mas, antes mesmo de tocar o chão, vapores negros começam a se erguer de seu corpo.
            <br/><br/>
            <Box component="span" sx={{ 
              display: 'block',
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#1a0f08',
              margin: '24px 0',
              padding: '16px',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '8px',
              borderLeft: '4px solid #8B4513'
            }}>
              Você dá um passo para trás, observando, enquanto uma nuvem sombria o envolve completamente.
              <br/>
              Quando a fumaça se dissipa... o corpo desapareceu — restou apenas um pedaço de terra queimada onde ele caiu.
            </Box>
            <br/>
            Você pode ter derrotado o Cavaleiro, mas não o destruiu.
            <br/>
            Seria preciso muito mais do que as armas dos mortais para pôr fim a uma criatura dessas.
            <br/><br/>
            <Box component="span" sx={{ 
              color: '#B31212', 
              fontWeight: 700,
              fontSize: '17px'
            }}>
              Certamente, você o encontrará novamente...
            </Box>
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            <ChoiceButton onClick={() => handleChoice(72)}>
              Por ora, siga sua jornada
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen335;

