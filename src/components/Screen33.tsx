import React, { useMemo, useState, useCallback } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import rogmondoImg from '../assets/images/personagens/rogmondo.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen33Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen33: React.FC<Screen33Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(33);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(33);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleRogmondoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: rogmondoImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleRogmondoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleRogmondoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleRogmondoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-33">
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
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
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Você olha por cima do ombro, gira a maçaneta e entra na sala de tatuagens. Ao mesmo tempo, umas campainhas tocam e despertam o dono da loja de seu torpor.
            <br/><br/>
            Ele se chama{' '}
            <LocationLink
              onMouseEnter={handleRogmondoHover}
              onMouseLeave={handleRogmondoLeave}
              onMouseMove={handleRogmondoMove}
              onClick={handleRogmondoClick}
            >
              Rogmondo
            </LocationLink>
            {' '}e, com uma expressão entediada, pergunta:
            <br/><br/>
            "Vai querer uma tatuagem, amigo?"
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(143);
            }}>
              Fazer tatuagem
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(270);
            }}>
              Não fazer e ir embora
            </ChoiceButton>
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
          <img src={hoverImage.src} alt="Rogmondo" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={rogmondoImg}
        imageAlt="Rogmondo"
      />
    </Container>
  );
};

export default Screen33;
