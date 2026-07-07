import React, { useCallback, useMemo, useState } from 'react';
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
import joaoVerduraImg from '../assets/images/personagens/joao-verdura.png';

interface Screen382Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen382: React.FC<Screen382Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(382);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(382);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleJoaoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: joaoVerduraImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleJoaoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleJoaoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleJoaoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-382">
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
            — O caos e a confusão dominam o mundo — diz{' '}
            <LocationLink
              onMouseEnter={handleJoaoHover}
              onMouseLeave={handleJoaoLeave}
              onMouseMove={handleJoaoMove}
              onClick={handleJoaoClick}
            >
              João Verdesfolhas
            </LocationLink>
            . — Hoje em dia, a ira surge com facilidade. E onde há ira, há morte. Sua missão é curar antigas feridas e levar a paz a Narbury. Mas lembre-se: a violência nunca pode ser a última resposta. O mal deve destruir a si mesmo.
            <br /><br />
            Ele faz uma pausa antes de continuar:
            <br /><br />
            — Prometa que vai ajudar as pessoas e não espalhar mais ódio. Quando sentir que cumpriu esse compromisso, diga em voz alta a palavra &quot;Cerunnos&quot;... e verá o que acontecerá.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(398); }}>
              Seguir o caminho
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
          <img src={hoverImage.src} alt="João Verdesfolhas" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={joaoVerduraImg}
        imageAlt="João Verdesfolhas"
      />
    </Container>
  );
};

export default Screen382;
