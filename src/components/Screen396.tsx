import React, { useMemo, useCallback, useState } from 'react';
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
import rogmondoImg from '../assets/images/personagens/rogmondo.png';

interface Screen396Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen396: React.FC<Screen396Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(396);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(396);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleRogmondoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: rogmondoImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleRogmondoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleRogmondoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleRogmondoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  const goToMarket = (screenId: 82 | 66) => {
    playClick();
    onUpdateFicha({
      ...ficha,
      flags: {
        ...ficha.flags,
        visitedMarketFromTattoo: true,
      },
    });
    onGoToScreen(screenId);
  };

  const goToGate = (screenId: 272 | 301) => {
    playClick();
    if (screenId === 301) {
      onUpdateFicha({
        ...ficha,
        flags: {
          ...ficha.flags,
          visitedMarketFromTattoo: true,
        },
      });
    } else if (ficha.flags?.visitedMarketFromTattoo) {
      onUpdateFicha({
        ...ficha,
        flags: {
          ...ficha.flags,
          visitedMarketFromTattoo: false,
        },
      });
    }
    onGoToScreen(screenId);
  };

  return (
    <Container data-screen="screen-396">
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
            <LocationLink
              onMouseEnter={handleRogmondoHover}
              onMouseLeave={handleRogmondoLeave}
              onMouseMove={handleRogmondoMove}
              onClick={handleRogmondoClick}
            >
              Rogmondo
            </LocationLink>
            {' '}hesita por um instante, mas acaba dizendo:
            <br /><br />
            — Está bem. Acredito em você. Vou escondê-lo. Mas, se estiver mentindo, você não verá o próximo ano. E, se eu não descobrir a verdade, a Liga dos Tatuadores descobrirá.
            <br /><br />
            Ele leva você até um cômodo nos fundos, onde existe uma passagem secreta para outra sala.
            <br /><br />
            Mais de uma hora depois,{' '}
            <LocationLink
              onMouseEnter={handleRogmondoHover}
              onMouseLeave={handleRogmondoLeave}
              onMouseMove={handleRogmondoMove}
              onClick={handleRogmondoClick}
            >
              Rogmondo
            </LocationLink>
            {' '}volta para buscá-lo.
            <br /><br />
            Os guardas realmente revistaram a loja, mas nem desconfiaram da sua presença.
            <br /><br />
            Você agradece a ajuda, promete retribuir o favor e sai para a rua, agora livre dos homens de Woad.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => goToMarket(82)}>
              Voltar para o lado Leste do Mercado
            </ChoiceButton>
            <ChoiceButton onClick={() => goToMarket(66)}>
              Voltar para o lado Oeste do Mercado
            </ChoiceButton>
            <ChoiceButton onClick={() => goToGate(272)}>
              Seguir para o Portão Sul
            </ChoiceButton>
            <ChoiceButton onClick={() => goToGate(301)}>
              Seguir para o Portão Leste
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="Rogmondo" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={rogmondoImg}
        imageAlt="Rogmondo"
      />
    </Container>
  );
};

export default Screen396;
