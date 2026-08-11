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

interface Screen128Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen128: React.FC<Screen128Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(128);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(128);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const handleChoice = (screenId: number) => {
    playClick();
    onGoToScreen(screenId);
  };

  return (
    <Container data-screen="screen-128">
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
            Desviando o olhar, você tira a esfera da mochila e a entrega ao bandido, que sorri satisfeito.
            <br /><br />
            Mas, à medida que o cristal começa a brilhar, o sorriso desaparece e dá lugar a uma expressão completamente vazia.
            <br /><br />
            A esfera roubou seus pensamentos.
            <br /><br />
            Com cuidado, você recupera a esfera e a guarda novamente.
            <br /><br />
            Depois sacode o bandido, ainda atordoado.
            <br /><br />
            Pensa em revistá-lo, mas não consegue.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => handleChoice(58)}>
              Beber da água do Poço do Feiticeiro
            </ChoiceButton>

            <ChoiceButton onClick={() => handleChoice(349)}>
              Seguir para o norte em busca do eremita, que o bandido afirmou estar morto
            </ChoiceButton>

            <ChoiceButton onClick={() => handleChoice(44)}>
              Abandonar a região e seguir para o sul
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen128;
