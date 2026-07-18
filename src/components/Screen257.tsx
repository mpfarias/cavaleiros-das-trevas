import React, { useMemo, useState, useCallback } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import orbeArmadilhaImg from '../assets/images/armadilha-da-mente.png';

const ORBE_NOME = 'Orbe Armadilha da Mente';

interface Screen257Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen257: React.FC<Screen257Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(257);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(257);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const DeathButton = useMemo(
    () => styled(ChoiceButton)({
      background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(70,0,0,0.8) 100%)',
      borderColor: '#8B0000',
      textAlign: 'center',
      '&:hover': {
        background: 'linear-gradient(135deg, rgba(179,0,0,0.9) 0%, rgba(100,0,0,0.8) 100%)',
        borderColor: '#FF0000',
      },
    }),
    [ChoiceButton],
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleOrbeHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: orbeArmadilhaImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleOrbeLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleOrbeMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleOrbeClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  const handleGameOver = () => {
    playClick();
    onGoToScreen(999);
  };

  return (
    <Container data-screen="screen-257">
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
            Só um tolo teria coragem de encarar um{' '}
            <LocationLink
              onMouseEnter={handleOrbeHover}
              onMouseLeave={handleOrbeLeave}
              onMouseMove={handleOrbeMove}
              onClick={handleOrbeClick}
            >
              Orbe Armadilha da Mente
            </LocationLink>
            .
            <br /><br />
            Sua mente passa a pertencer ao artefato, e somente Hegmar seria capaz de libertá-lo.
            <br /><br />
            Infelizmente, ele está morto.
            <br /><br />
            Você permanecerá prisioneiro desse estado para sempre.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <DeathButton onClick={handleGameOver}>
              Fim da aventura
            </DeathButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt={ORBE_NOME} />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={orbeArmadilhaImg}
        imageAlt={ORBE_NOME}
      />
    </Container>
  );
};

export default Screen257;
