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

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #0d3d0d 25%, #1a3d1a 50%, #0d1a0d 75%, #000000 100%),
    radial-gradient(circle at 30% 30%, rgba(0,100,0,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,50,0.3) 0%, transparent 50%)
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
    linear-gradient(135deg, rgba(240,255,240,0.98) 0%, rgba(230,250,230,0.95) 25%, rgba(240,255,240,0.98) 50%, rgba(235,252,235,0.95) 75%, rgba(240,255,240,0.98) 100%)
  `,
  border: '3px solid #228B22',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.5),
    0 0 0 1px rgba(34,139,34,0.4),
    0 0 20px rgba(34,139,34,0.1)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#1a3d1a',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(255,255,255,0.7)'
});

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(34,139,34,0.85) 0%, rgba(0,100,0,0.75) 50%, rgba(34,139,34,0.85) 100%)',
  color: '#F0FFF0',
  border: '2px solid #228B22',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(144,238,144,0.3)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 10px rgba(34,139,34,0.3)',
  width: '100%',
  '&:focus-visible': {
    outline: '2px solid #32CD32',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(50,205,50,0.95) 0%, rgba(144,238,144,0.85) 50%, rgba(50,205,50,0.95) 100%)',
    borderColor: '#32CD32',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(34,139,34,0.5), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 20px rgba(144,238,144,0.4)',
    textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 12px rgba(144,238,144,0.5)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

interface Screen180Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen180: React.FC<Screen180Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(180);
  const playClick = useClickSound(0.2);

  return (
    <Container data-screen="screen-180">
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
            Quando você se afasta do Slygore, ele cospe em você um líquido preto e purulento. Você consegue se desviar a tempo, e o muco borbulhante passa por cima da sua cabeça e vai se espatifar na parede do esgoto, derretendo os tijolos. Sem perder tempo, você sai correndo.
            <br/><br/>
            A criatura se joga na água suja e começa a persegui-lo. De repente, você chega a um local sem saída. Felizmente, há uma escada que leva até a superfície. Lá em cima, você ouve as vozes dos guardas que estão procurando por você; atrás de você está o Slygore, cuja silhueta monstruosa se aproxima perigosamente…
            <br/><br/>
            E agora?
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(18); }}>
              Você sobe e sai do esgoto?
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(365); }}>
              Decide lutar com o monstro?
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen180;
