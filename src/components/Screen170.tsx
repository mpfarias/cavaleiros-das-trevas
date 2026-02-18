import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import slygoreRoar from '../assets/sounds/slygore-roar.mp3';

interface Screen170Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen170: React.FC<Screen170Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(170);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(170);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const appliedRef = useRef(false);
  const [showForceAlert, setShowForceAlert] = useState(false);

  // Remover candeia da bolsa e reduzir 3 pontos de FORÇA ATUAL
  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (!ficha) return;

    const updated = { ...ficha };

    // Remover a Candeia e Azeite da bolsa
    const novaBolsa = updated.bolsa.filter(item => 
      !(item.id === 'candeia-azeite' || item.nome?.toLowerCase().includes('candeia'))
    );

    updated.bolsa = novaBolsa;

    // Reduzir 3 pontos de FORÇA ATUAL (não inicial)
    if (updated.forca && typeof updated.forca.atual === 'number') {
      updated.forca.atual = Math.max(0, updated.forca.atual - 3);
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }

    onUpdateFicha(updated);
  }, [ficha, onUpdateFicha]);

  // Efeito sonoro do rugido do Slygore (antes de fugir)
  useEffect(() => {
    const audio = new Audio(slygoreRoar);
    audio.volume = 0.7;
    audio.play().catch(() => {});
    return () => {
      try { audio.pause(); } catch {}
    };
  }, []);

  return (
    <Container data-screen="screen-170">
      <VolumeControl />

      {currentGroup && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => { playClick(); togglePlay?.(); }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Você revira a mochila e pega uma dose de azeite. Você está acendendo a lamparina quando o Slygore cospe um líquido preto nojento em você. É pegajoso e borbulhante, atingindo seu lado.
            <br/><br/>
            Ainda assim, você consegue arremessar a lamparina, agora acesa, contra ele. Não o machuca muito, mas é o bastante para fazê-lo parar — oportunidade que você aproveita para virar de costas e fugir.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(180); }}>
              Fugir
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Alerta de perda de força */}
      {showForceAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
          Você perdeu 3 pontos de FORÇA!
        </GameAlert>
      )}
    </Container>
  );
};

export default Screen170;
