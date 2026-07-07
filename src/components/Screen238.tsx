import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { playDamageScream } from '../hooks/useDamageScreamSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';

interface Screen238Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen238: React.FC<Screen238Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(238);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(238);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const penaltiesAppliedRef = useRef(false);
  const [showForcaAlert, setShowForcaAlert] = useState(false);

  useEffect(() => {
    if (penaltiesAppliedRef.current) return;
    penaltiesAppliedRef.current = true;

    const updated: Ficha = { ...ficha };

    if (updated.forca && typeof updated.forca.atual === 'number') {
      updated.forca.atual = Math.max(0, updated.forca.atual - 1);
      playDamageScream();
      setShowForcaAlert(true);
      setTimeout(() => setShowForcaAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }

    onUpdateFicha(updated);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-238">
      <GameAlert sx={{ top: '120px' }} $isVisible={showForcaAlert}>
        ⚔️ Você perdeu 1 ponto de FORÇA!
      </GameAlert>

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
          <NarrativeText>
            Para sua surpresa, você cai exatamente sobre o cavalo.
            <br /><br />
            O impacto é forte, e você perde 1 ponto de FORÇA.
            <br /><br />
            Lá do alto do telhado, os guardas observam a cena, completamente atônitos, enquanto você dispara pelas ruas montado. Sem parar, atravessa ruas e praças até chegar ao Portão Norte.
            <br /><br />
            Ali, você desmonta e afugenta o cavalo. Com um sorriso no rosto, atravessa o portão diante dos guardas que, ainda perplexos, deixam você passar sem fazer perguntas.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(145); }}>
              Seguir o caminho
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen238;
