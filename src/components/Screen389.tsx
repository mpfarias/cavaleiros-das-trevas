import React, { useMemo, useState, useCallback } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import quinsberryImg from '../assets/images/personagens/quinsberry.png';

interface Screen389Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen389: React.FC<Screen389Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(389);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(389);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Handlers para Quinsberry
  const handleQuinsberryHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: quinsberryImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleQuinsberryLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleQuinsberryMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleQuinsberryClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-389">
      <VolumeControl />
      {currentGroup && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <IconButton
              onClick={() => {
                playClick();
                togglePlay();
              }}
              sx={{
                color: isPlaying ? '#B31212' : '#E0DFDB',
                background: 'rgba(15,17,20,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': {
                  background: 'rgba(179,18,18,0.2)',
                  borderColor: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Seu truque funciona melhor do que esperava — uma confusão se instala quando as pessoas ao redor disputam as poucas moedas que você jogou no chão.
            <br/><br/>
            Os guardas de <LocationLink
              onMouseEnter={handleQuinsberryHover}
              onMouseLeave={handleQuinsberryLeave}
              onMouseMove={handleQuinsberryMove}
              onClick={handleQuinsberryClick}
            >Quinsberry</LocationLink> abandonam seus postos para tentar restabelecer a ordem. Você aproveita a brecha.
          </NarrativeText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(164); }}>
              Um jardim verdejante e convidativo, pertencente a um templo
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(118); }}>
              Se esgueirar por uma rua estreita
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
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={quinsberryImg}
        imageAlt="Quinsberry Woad"
      />
    </Container>
  );
};

export default Screen389;
