import React, { useState, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DiceRollModal3D from './ui/DiceRollModal3D';
import type { Ficha } from '../types';

interface Screen312Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen312: React.FC<Screen312Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(312);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(312);
  const { Container, CardWrap, NarrativeText } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showDiceModal, setShowDiceModal] = useState(false);

  const handleTestLuck = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (_dice: number[], total: number) => {
    setShowDiceModal(false);

    const sorteAtual = ficha.sorte.atual;
    const hasLuck = total <= sorteAtual;

    const fichaAtualizada: Ficha = {
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: Math.max(0, ficha.sorte.atual - 1),
      },
    };
    onUpdateFicha(fichaAtualizada);

    setTimeout(() => {
      onGoToScreen(hasLuck ? 10 : 257);
    }, 500);
  };

  return (
    <Container data-screen="screen-312">
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
            Você se aproxima da bola de cristal e observa atentamente seu interior. Mal faz isso, ela começa a brilhar, como se faíscas estivessem surgindo lá dentro.
            <br /><br />
            A luminosidade da esfera hipnotiza você. Nada mais parece importar.
            <br /><br />
            Felizmente, uma pequena parte da sua consciência ainda resiste e percebe o que está acontecendo. Num esforço sobre-humano, você tenta se libertar do fascínio da bola de cristal.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleTestLuck}
              sx={{
                background: theme.choiceButton.background,
                color: theme.choiceButton.color,
                border: theme.choiceButton.border,
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                textShadow: theme.choiceButton.textShadow,
                boxShadow: theme.choiceButton.boxShadow,
                padding: '16px 24px',
                '&:hover': {
                  background: theme.choiceButton.hoverBackground,
                  borderColor: theme.choiceButton.hoverBorderColor,
                  boxShadow: theme.choiceButton.hoverBoxShadow,
                },
              }}
            >
              Testar a Sorte (2d6)
            </Button>
            <Typography variant="caption" sx={{ color: theme.narrativeText.color }}>
              A SORTE atual é {ficha.sorte.atual}. Você perderá 1 ponto ao testar.
            </Typography>
          </Box>
        </CardContent>
      </CardWrap>

      <DiceRollModal3D
        open={showDiceModal}
        onComplete={handleDiceRoll}
        numDice={2}
        bonus={0}
      />
    </Container>
  );
};

export default Screen312;
