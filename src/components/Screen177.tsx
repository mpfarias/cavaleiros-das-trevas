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

interface Screen177Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const possuiCapaCamaleao = (ficha: Ficha): boolean =>
  ficha.bolsa.some(
    (item) =>
      item.nome &&
      item.nome.toLowerCase().includes('capa') &&
      item.nome.toLowerCase().includes('camaleão'),
  );

const possuiOrbeArmadilha = (ficha: Ficha): boolean =>
  ficha.bolsa.some(
    (item) =>
      item.nome &&
      item.nome.toLowerCase().includes('orbe') &&
      item.nome.toLowerCase().includes('armadilha'),
  );

const possuiMoedasOuro = (ficha: Ficha): boolean => {
  const moedas = ficha.bolsa.find((item) => item.tipo === 'ouro');
  return (moedas?.quantidade ?? 0) > 0;
};

const Screen177: React.FC<Screen177Props> = ({ onGoToScreen, ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(177);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(177);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const temCapaCamaleao = useMemo(() => possuiCapaCamaleao(ficha), [ficha]);
  const temOrbeArmadilha = useMemo(() => possuiOrbeArmadilha(ficha), [ficha]);
  const temMoedasOuro = useMemo(() => possuiMoedasOuro(ficha), [ficha]);

  const handleChoice = (screenId: number) => {
    playClick();
    onGoToScreen(screenId);
  };

  return (
    <Container data-screen="screen-177">
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
            Enquanto procura algo na mochila para entregar ao bandido, uma ideia passa pela sua cabeça: talvez você possa enganá-lo.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {temCapaCamaleao && (
              <ChoiceButton onClick={() => handleChoice(220)}>
                Entregar a Capa do Camaleão
              </ChoiceButton>
            )}

            {temOrbeArmadilha && (
              <ChoiceButton onClick={() => handleChoice(128)}>
                Entregar o Orbe Armadilha da Mente
              </ChoiceButton>
            )}

            {temMoedasOuro && (
              <ChoiceButton onClick={() => handleChoice(373)}>
                Dar a ele algumas Moedas de Ouro
              </ChoiceButton>
            )}

            <ChoiceButton onClick={() => handleChoice(92)}>
              Atacar o inimigo
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen177;
