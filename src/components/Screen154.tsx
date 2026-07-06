import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, CardContent, IconButton, Tooltip, Button } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { playDamageScream } from '../hooks/useDamageScreamSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import ImageModal from './ui/ImageModal';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import slygoreImg from '../assets/images/personagens/slygore.png';

interface Screen154Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen154: React.FC<Screen154Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(154);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(154);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const appliedRef = useRef(false);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Aplicar perda de 3 FORÇA ao carregar a tela
  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (!ficha) return;

    const updated = { ...ficha };

    if (updated.forca && typeof updated.forca.atual === 'number') {
      const novaForca = Math.max(0, updated.forca.atual - 3);
      updated.forca = { ...updated.forca, atual: novaForca };
      playDamageScream();
      onUpdateFicha(updated);

      setTimeout(() => {
        setShowForceAlert(true);
        setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);

      if (novaForca <= 0) {
        setTimeout(() => onGoToScreen(999), 2000);
      }
    }
  }, [ficha, onUpdateFicha, onGoToScreen]);

  const handleSlygoreHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: slygoreImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleSlygoreLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleSlygoreMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev =>
      prev ? { ...prev, x: event.clientX + 20, y: event.clientY - 20 } : null
    );
  }, []);

  const handleSlygoreClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  const handleStartTest = useCallback(() => {
    playClick();
    setShowDiceModal(true);
  }, [playClick]);

  const handleDiceComplete = useCallback(
    (_dice: number[], total: number) => {
      setShowDiceModal(false);
      const periciaAtual = ficha.pericia.atual;
      const success = total <= periciaAtual;
      setResult(success ? 'success' : 'fail');
    },
    [ficha.pericia.atual]
  );

  return (
    <Container data-screen="screen-154">
      <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
        ⚔️ Você perdeu 3 pontos de FORÇA!
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
                '&:hover': currentGroup
                  ? { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                  : {},
                '&:disabled': { cursor: 'not-allowed' },
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
                Alguns metros adiante, você dá de cara com o{' '}
                <LocationLink
                  onMouseEnter={handleSlygoreHover}
                  onMouseLeave={handleSlygoreLeave}
                  onMouseMove={handleSlygoreMove}
                  onClick={handleSlygoreClick}
                >
                  Slygore
                </LocationLink>
                , que cospe uma substância preta em suas costas, queimando sua pele. Aos gritos, você cai de joelhos.
                <br /><br />
                O monstro avança sobre você. Ignorando a dor, você tenta se esquivar antes que ele o despedace.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleStartTest}
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
                  Testar a Perícia (2d6)
                </Button>
                <Box component="span" sx={{ fontSize: '14px', color: theme.narrativeText.color }}>
                  Sua PERÍCIA atual é {ficha.pericia.atual}. Resultado menor ou igual = sucesso.
                </Box>
              </Box>
            </>
          )}

          {result === 'success' && (
            <>
              <NarrativeText>
                Você foi bem sucedido no teste de Perícia! Conseguiu se esquivar a tempo e o Slygore não o alcançou.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => { playClick(); onGoToScreen(250); }}>
                  Continuar
                </ChoiceButton>
              </Box>
            </>
          )}

          {result === 'fail' && (
            <>
              <NarrativeText>
                Você falhou no teste de Perícia. O Slygore o alcançou antes que você pudesse se esquivar.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => { playClick(); onGoToScreen(365); }}>
                  Continuar
                </ChoiceButton>
              </Box>
            </>
          )}
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="Slygore" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={slygoreImg}
        imageAlt="Slygore"
      />

      <DiceRollModal3D
        open={showDiceModal}
        numDice={2}
        onComplete={handleDiceComplete}
        title="Teste de Perícia"
      />
    </Container>
  );
};

export default Screen154;
