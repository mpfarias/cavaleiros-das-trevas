import React, { useCallback, useMemo, useState } from 'react';
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
import gorntImg from '../assets/images/locais/gornt.png';
import ennianImg from '../assets/images/personagens/ennian.png';

interface Screen31Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen31: React.FC<Screen31Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(31);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(31);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

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

  const createHoverHandlers = useCallback((src: string) => ({
    onMouseEnter: (event: React.MouseEvent) => {
      setHoverImage({
        src,
        x: event.clientX + 20,
        y: event.clientY - 20
      });
    },
    onMouseLeave: () => setHoverImage(null),
    onMouseMove: (event: React.MouseEvent) => {
      setHoverImage(prev => prev ? {
        ...prev,
        x: event.clientX + 20,
        y: event.clientY - 20
      } : null);
    },
  }), []);

  const handleImageClick = useCallback((src: string, alt: string) => {
    playClick();
    setModalImage({ src, alt });
  }, [playClick]);

  const ennianHandlers = createHoverHandlers(ennianImg);
  const gorntHandlers = createHoverHandlers(gorntImg);

  const handleGameOver = () => {
    playClick();
    onGoToScreen(999);
  };

  return (
    <Container data-screen="screen-31">
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
            Mãos poderosas agarram você e o lançam ao chão.
            <br /><br />
            Caído de costas, olha para cima e vê{' '}
            <LocationLink
              {...ennianHandlers}
              onClick={() => handleImageClick(ennianImg, 'Ennian')}
            >
              Ennian
            </LocationLink>
            , o Prefeito de{' '}
            <LocationLink
              {...gorntHandlers}
              onClick={() => handleImageClick(gorntImg, 'Gornt')}
            >
              Gornt
            </LocationLink>
            .
            <br /><br />
            Ele sorri.
            <br /><br />
            — Não se preocupe. Você não vai sentir nada... e, em breve, será um de nós.
            <br /><br />
            Ao dizer isso, sua mão se transforma em uma massa viscosa, semelhante a uma ventosa.
            <br /><br />
            Ela envolve seu rosto.
            <br /><br />
            A escuridão toma conta da sua mente.
            <br /><br />
            Você jamais despertará desse sono.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <DeathButton onClick={handleGameOver}>
              Fim da aventura
            </DeathButton>
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
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      <ImageModal
        open={Boolean(modalImage)}
        onClose={() => setModalImage(null)}
        imageSrc={modalImage?.src || ''}
        imageAlt={modalImage?.alt || ''}
      />
    </Container>
  );
};

export default Screen31;
