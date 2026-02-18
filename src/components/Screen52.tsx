import React, { useMemo, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

interface Screen52Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen52: React.FC<Screen52Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(52);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(52);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showDiceModal, setShowDiceModal] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [showDamageAlert, setShowDamageAlert] = useState(false);

  const handleStartTest = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceComplete = (_dice: number[], total: number) => {
    setShowDiceModal(false);

    const periciaAtual = ficha.pericia.atual;
    const success = total <= periciaAtual;
    if (success) {
      setResult('success');
      return;
    }

    const updatedFicha = { ...ficha };
    updatedFicha.forca.atual = Math.max(0, ficha.forca.atual - 2);
    onUpdateFicha(updatedFicha);

    setShowDamageAlert(true);
    setTimeout(() => setShowDamageAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    setResult('fail');
  };

  return (
    <Container data-screen="screen-52">
      <DiceRollModal3D
        open={showDiceModal}
        numDice={2}
        onComplete={handleDiceComplete}
      />

      {showDamageAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showDamageAlert}>
          Você perdeu 2 pontos de FORÇA!
        </GameAlert>
      )}

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
        <CardContent sx={{ padding: '40px' }}>
          {result === null && (
            <>
              <NarrativeText>
                Você respira fundo e dispara em direção ao portão. Teste sua Perícia.
              </NarrativeText>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <ChoiceButton onClick={handleStartTest}>
                  Testar a Perícia
                </ChoiceButton>
              </Box>
            </>
          )}

          {result === 'success' && (
            <>
              <NarrativeText>
                Você consegue saltar o portão e segue para o Portão Leste.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => onGoToScreen(301)}>
                  Seguir para o Portão Leste
                </ChoiceButton>
              </Box>
            </>
          )}

          {result === 'fail' && (
            <>
              <NarrativeText>
                Você falhou. O portão era alto demais para você escalar. Terá que enfrentar os guardas.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => onGoToScreen(20)}>
                  Enfrentar os guardas
                </ChoiceButton>
              </Box>
            </>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen52;
