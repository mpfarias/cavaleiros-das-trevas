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
import zekarehImg from '../assets/images/personagens/zekareh.png';

interface Screen219Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen219: React.FC<Screen219Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(219);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(219);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleZekarehHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: zekarehImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleZekarehLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleZekarehMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleZekarehClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-219">
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
            Gesticulando com os braços,{' '}
            <LocationLink
              onMouseEnter={handleZekarehHover}
              onMouseLeave={handleZekarehLeave}
              onMouseMove={handleZekarehMove}
              onClick={handleZekarehClick}
            >
              Zekareh
            </LocationLink>
            , o mendigo profeta, anuncia a destruição de Titã:
            <br /><br />
            — Anuncio a desgraça! O fim do mundo está próximo. A própria terra está morrendo, apodrecendo em suas entranhas. Quando os Cinco libertarem o Um, respiraremos o ar da decadência, e os mortos voltarão a caminhar. Somente a Espada e o Defensor dos Humildes poderão nos salvar!
            <br /><br />
            Sem entender muito bem essa profecia, você decide se afastar. Nesse momento,{' '}
            <LocationLink
              onMouseEnter={handleZekarehHover}
              onMouseLeave={handleZekarehLeave}
              onMouseMove={handleZekarehMove}
              onClick={handleZekarehClick}
            >
              Zekareh
            </LocationLink>
            {' '}fixa os olhos em você.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(289); }}>
              Vai ouvir a jovem
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(137); }}>
              Vai ouvir o homem de preto
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="Zekareh" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={zekarehImg}
        imageAlt="Zekareh, o mendigo profeta"
      />
    </Container>
  );
};

export default Screen219;
