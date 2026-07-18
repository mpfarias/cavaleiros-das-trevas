import React, { useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

interface Screen72Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen72: React.FC<Screen72Props> = ({ onGoToScreen, ficha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(72);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(72);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const temCapaCamaleao = useMemo(() => {
    return ficha.bolsa.some(item =>
      item.nome && item.nome.toLowerCase().includes('capa') && item.nome.toLowerCase().includes('camaleão')
    );
  }, [ficha.bolsa]);

  const handleChoice = (screenId: number) => {
    playClick();
    onGoToScreen(screenId);
  };

  const accentColor = theme.locationLink.color;

  return (
    <Container data-screen="screen-72">
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
            Desanimados com a sua vitória, os outros Cavaleiros das Trevas detêm seus cavalos.
            <br /><br />
            Em uníssono, eles soltam um uivo terrível, uma mistura de ódio e medo, que você mal ouve — pois já está fugindo dali o mais rápido possível.
            <br /><br />
            <Box
              component="span"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: accentColor,
                fontWeight: 700,
                margin: '24px 0',
                padding: '16px',
                background: 'rgba(179,18,18,0.12)',
                borderRadius: '8px',
                border: `2px solid ${accentColor}`,
              }}
            >
              Mas não demora até que o som dos cascos volte a ecoar atrás de você.
              <br />
              Eles reiniciaram a perseguição, e desta vez, a sorte talvez não esteja ao seu lado.
            </Box>
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            <ChoiceButton onClick={() => handleChoice(346)}>
              Esconder-se sob uma saliência na rocha
            </ChoiceButton>

            {temCapaCamaleao && (
              <ChoiceButton onClick={() => handleChoice(324)}>
                Vestir a Capa de Camaleão
              </ChoiceButton>
            )}

            <ChoiceButton onClick={() => handleChoice(2)}>
              Saltar por cima de uma ravina, tentando alcançar o outro lado da passagem
            </ChoiceButton>
          </Box>

          {temCapaCamaleao && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                marginTop: '16px',
                textAlign: 'center',
                color: '#4CAF50',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              ✓ Você possui a Capa de Camaleão
            </Typography>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen72;
