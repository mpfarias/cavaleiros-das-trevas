import React, { useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip, styled, keyframes } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
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

interface Screen335Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen335: React.FC<Screen335Props> = ({ onGoToScreen }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(335);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(335);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

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
              color: theme.narrativeText.color,
              margin: '24px 0',
              padding: '16px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              borderLeft: `4px solid ${theme.cardWrap.border.split(' ')[2]}`
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
              color: '#D32F2F', 
              fontWeight: 700,
              fontSize: '17px',
              textShadow: '0 0 10px rgba(211,47,47,0.8)'
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

