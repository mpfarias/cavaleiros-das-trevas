import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { playDamageScream } from '../hooks/useDamageScreamSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #3d2817 25%, #2c1810 50%, #1a0f0a 75%, #0d0503 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,50,0.2) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.4)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)'
});

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

interface Screen18Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen18: React.FC<Screen18Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(18);
  const playClick = useClickSound(0.2);
  const appliedRef = useRef(false);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [showSorteAlert, setShowSorteAlert] = useState(false);

  // Reduzir 1 ponto de FORÇA ATUAL e aumentar 1 ponto de SORTE ATUAL
  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (!ficha) return;

    const updated = { ...ficha };

    // Reduzir 1 ponto de FORÇA ATUAL
    if (updated.forca && typeof updated.forca.atual === 'number') {
      updated.forca.atual = Math.max(0, updated.forca.atual - 1);
      playDamageScream();
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }

    // Aumentar 1 ponto de SORTE ATUAL (não pode ultrapassar o valor inicial)
    if (updated.sorte && typeof updated.sorte.atual === 'number' && typeof updated.sorte.inicial === 'number') {
      updated.sorte.atual = Math.min(updated.sorte.inicial, updated.sorte.atual + 1);
      // Mostrar alerta de sorte após um pequeno delay para não sobrepor com o de força
      setTimeout(() => {
        setShowSorteAlert(true);
        setTimeout(() => setShowSorteAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);
    }

    onUpdateFicha(updated);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-18">
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

      {/* Alerta de perda de força */}
      {showForceAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
          Você perdeu 1 ponto de FORÇA!
        </GameAlert>
      )}

      {/* Alerta de ganho de sorte */}
      {showSorteAlert && (
        <GameAlert sx={{ top: '180px' }} $isVisible={showSorteAlert}>
          Você ganhou 1 ponto de SORTE!
        </GameAlert>
      )}

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Você agradece a Osmani, deus dos Mercenários, pela oportunidade de fuga. Sobe a escada, empurra a tampa com a cabeça e se ergue até chegar à rua. Você rola para o lado e recoloca a tampa no lugar.
            <br/><br/>
            Depois de descansar por alguns momentos, percebe que está em uma rua pequena que desemboca numa praça movimentada. Uma pobre comediante te observa, perplexa. Ela veste um traje andrajosos — verde e vermelho — e sorri enquanto você se levanta.
            <br/><br/>
            "Já conhece aquela do porco nervoso…?", começa ela a dizer. Mas você tapa a boca dela e a empurra. Não está com paciência para ouvir piadas.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(225); }}>
              Seguir o caminho
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen18;
