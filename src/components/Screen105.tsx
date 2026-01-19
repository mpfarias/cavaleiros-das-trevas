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
import salaHegmarImg from '../assets/images/locais/sala-hegmar.png';

interface Screen105Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen105: React.FC<Screen105Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(105);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(105);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleHegmarHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: salaHegmarImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleHegmarLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleHegmarMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleHegmarClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-105">
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
          <span><IconButton
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
          </IconButton></span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Não demora para que você chegue à porta de madeira e vidro do Santuário de Hegmar. Lá dentro, tudo está escuro e silencioso. O mago não está à vista.
            <br/><br/>
            Como a porta está aberta, você decide entrar e se esconder na sombra, deixando que os seus perseguidores sigam adiante. Você espera até não ouvir mais passos e então inspeciona a{' '}
            <LocationLink
              onMouseEnter={handleHegmarHover}
              onMouseLeave={handleHegmarLeave}
              onMouseMove={handleHegmarMove}
              onClick={handleHegmarClick}
            >
              sala de Hegmar
            </LocationLink>
            : é um local pequeno, repleto dos mais variados objetos — alguns até valiosos — espalhados ao acaso.
            <br/><br/>
            Você acaba encontrando três coisas que podem ter valor para você.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(147);
            }}>
              Aproxima-se da escrivaninha do mago
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(193);
            }}>
              Esconde-se em um sarcófago antigo
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(312);
            }}>
              Examina uma bola de cristal sobre um pedestal de marfim
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
          <img src={hoverImage.src} alt="Sala de Hegmar" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={salaHegmarImg}
        imageAlt="Sala de Hegmar"
      />
    </Container>
  );
};

export default Screen105;

