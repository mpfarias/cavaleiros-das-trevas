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

interface Screen193Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen193: React.FC<Screen193Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(193);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(193);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const penaltiesAppliedRef = useRef(false);
  const [showForcaAlert, setShowForcaAlert] = useState(false);
  const [showPericiaAlert, setShowPericiaAlert] = useState(false);

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

    if (updated.pericia && typeof updated.pericia.atual === 'number') {
      updated.pericia.atual = Math.max(0, updated.pericia.atual - 1);
      setTimeout(() => {
        setShowPericiaAlert(true);
        setTimeout(() => setShowPericiaAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);
    }

    onUpdateFicha(updated);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-193">
      <GameAlert sx={{ top: '120px' }} visible={showForcaAlert} onClose={() => setShowForcaAlert(false)}>
        ⚔️ Você perdeu 1 ponto de FORÇA!
      </GameAlert>
      <GameAlert sx={{ top: '180px' }} visible={showPericiaAlert} onClose={() => setShowPericiaAlert(false)}>
        🗡️ Você perdeu 1 ponto de PERÍCIA!
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
            O caixão é de madeira, extremamente antigo, e foi esculpido na forma de um enorme guerreiro.
            <br /><br />
            Você ergue a tampa e entra com cuidado. De repente, ela se fecha com violência, prendendo você em uma armadilha. No mesmo instante, duas lâminas ocultas saltam das laterais e o atingem.
            <br /><br />
            Mesmo ferido, você reúne forças para empurrar a tampa e conseguir abri-la. Em seguida, salta para fora do caixão.
            <br /><br />
            Parece que esse rei realmente temia ladrões de túmulos!
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(312); }}>
              Investigar a bola de cristal
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(147); }}>
              Investigar a escrivaninha de Hegmar
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(216); }}>
              Abandonar o santuário antes que outra desgraça aconteça
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen193;
