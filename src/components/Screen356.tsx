import React, { useState, useMemo, useCallback } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DiceRollModal3D from './ui/DiceRollModal3D';
import ImageModal from './ui/ImageModal';
import type { Ficha } from '../types';
import slygoreImg from '../assets/images/personagens/slygore.png';

interface Screen356Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen356: React.FC<Screen356Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(356);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(356);
  const { Container, CardWrap, NarrativeText, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleTestLuck = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (dice: number[], total: number) => {
    setShowDiceModal(false);

    const sorteAtual = ficha.sorte.atual;
    const hasLuck = total <= sorteAtual;

    // Reduz 1 ponto de sorte após o teste
    const fichaAtualizada: Ficha = {
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: Math.max(0, ficha.sorte.atual - 1)
      }
    };
    onUpdateFicha(fichaAtualizada);

    // Navega para próxima tela
    setTimeout(() => {
      if (hasLuck) {
        onGoToScreen(180);
      } else {
        onGoToScreen(154);
      }
    }, 500);
  };

  // Handlers para Slygore
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
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleSlygoreClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-356">
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de Música */}
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
            Ciente de que não terá sucesso lutando contra o <LocationLink
              onMouseEnter={handleSlygoreHover}
              onMouseLeave={handleSlygoreLeave}
              onMouseMove={handleSlygoreMove}
              onClick={handleSlygoreClick}
            >Slygore</LocationLink>, você recua numa tentativa de fuga. Teste sua SORTE.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <Button variant="contained" onClick={handleTestLuck} sx={{
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
                boxShadow: theme.choiceButton.hoverBoxShadow
              }
            }}>
              Testar a Sorte (2d6)
            </Button>
            <Typography variant="caption" sx={{ color: theme.narrativeText.color }}>
              A SORTE atual é {ficha.sorte.atual}. Você perderá 1 ponto ao testar.
            </Typography>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={slygoreImg}
        imageAlt="Slygore"
      />

      <DiceRollModal3D
        open={showDiceModal}
        onComplete={handleDiceRoll}
        numDice={2}
        bonus={0}
      />
    </Container>
  );
};

export default Screen356;
