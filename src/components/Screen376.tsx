import React, { useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

interface Screen376Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen376: React.FC<Screen376Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(376);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(376);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  return (
    <Container data-screen="screen-376">
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
                  cursor: 'not-allowed',
                },
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
            A vitória foi difícil. A mulher lutou como um animal, mas, ao feri-la, você percebe que seu sangue é verde. Mais uma vez, as forças do mal estão em ação.
            <br /><br />
            Quando se vira para ir embora, ouve uma risada sarcástica que o deixa paralisado. A risada vem da mulher que você acabou de matar.
            <br /><br />
            Você olha para trás e vê o corpo dela desaparecer.
            <br /><br />
            Ao ouvir a segunda gargalhada, entra em pânico e foge.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(231);
            }}>
              Fugir
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen376;
