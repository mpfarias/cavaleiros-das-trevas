import React, { useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

interface Screen341Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen341: React.FC<Screen341Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(341);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(341);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const DeathButton = useMemo(
    () => styled(ChoiceButton)({
      background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(70,0,0,0.8) 100%)',
      borderColor: '#8B0000',
      textAlign: 'center',
      '&:hover': {
        background: 'linear-gradient(135deg, rgba(179,0,0,0.9) 0%, rgba(100,0,0,0.8) 100%)',
        borderColor: '#FF0000',
      },
    }),
    [ChoiceButton],
  );

  const handleGameOver = () => {
    playClick();
    onGoToScreen(999);
  };

  return (
    <Container data-screen="screen-341">
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
            Embora o feitiço tivesse como alvo a mulher, foi você quem acabou atingido.
            <br /><br />
            Um mago, que a observava de longe e se irritou com seu discurso, decidiu silenciá-la. Infelizmente, você entrou na frente do feitiço e foi transformado em um sapo.
            <br /><br />
            Karnstein, os Cavaleiros das Trevas e toda a sua missão deixam de ter qualquer importância.
            <br /><br />
            Agora, sua única preocupação é encontrar algumas moscas bem apetitosas.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <DeathButton onClick={handleGameOver}>
              Fim da aventura
            </DeathButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen341;
