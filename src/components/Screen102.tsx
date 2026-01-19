import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import mendokanImg from '../assets/images/personagens/mendokan.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const HoverImage = styled(Box)({
  position: 'fixed',
  zIndex: 1500,
  pointerEvents: 'none',
  animation: `${fadeInImage} 0.3s ease-out`,
  '& img': {
    maxWidth: '400px',
    maxHeight: '400px',
    borderRadius: '12px',
    border: '3px solid #8B4513',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backgroundColor: 'transparent'
  }
});

const LocationLink = styled('span')({
  color: '#8B4513',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#A0522D'
  }
});

interface Screen102Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onAdjustSorte: (delta: number) => void;
}

const Screen102: React.FC<Screen102Props> = ({ onGoToScreen, ficha, onUpdateFicha: _onUpdateFicha, onAdjustSorte }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(102);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(102);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showSorteAlert, setShowSorteAlert] = useState(false);
  const sorteAppliedRef = useRef(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  // Aplicar 2 pontos de SORTE quando a tela carregar (uma única vez)
  useEffect(() => {
    if (!sorteAppliedRef.current) {
      sorteAppliedRef.current = true;
      
      // Ganhar 2 pontos de SORTE (onAdjustSorte já garante que não ultrapassa o máximo)
      onAdjustSorte(2);
      
      // Mostrar alert de sorte ganha
      setTimeout(() => {
        setShowSorteAlert(true);
        setTimeout(() => setShowSorteAlert(false), 4000);
      }, 500);
    }
  }, [onAdjustSorte]);

  const handleMendokanHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: mendokanImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleMendokanLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleMendokanMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleMendokanClick = useCallback(() => {
    playClick();
    setModalImage({ src: mendokanImg, alt: 'Mendokan' });
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-102">
      {/* Alerta de SORTE ganha */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showSorteAlert}>
        ✨ Você ganhou 2 pontos de SORTE!
      </GameAlert>

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
            A quantia das 200 Moedas de Ouro que lhe prometeram já não tem importância. <strong><LocationLink
              onMouseEnter={handleMendokanHover}
              onMouseLeave={handleMendokanLeave}
              onMouseMove={handleMendokanMove}
              onClick={handleMendokanClick}
            >Mendokan</LocationLink></strong> e seu povo estavam sob sua proteção — e você falhou. A força dos Cavaleiros das Trevas é aterrorizante e diferente de tudo o que já enfrentou; se conseguir derrotá-los, vingará todos os inocentes que eles massacraram.
            <br/><br/>
            O dia amanhece quando você alcança a saída sul do estreito de Magyaar, lugar que para sempre lembrará como o cenário da sua pior derrota.
            <br/><br/>
            Você para para descansar e refletir sobre o próximo passo. A estrada para Karnstein segue diretamente para o sul. Até chegar lá, muitos aldeões morrerão e sofrerão todas as noites.
            <br/><br/>
            A leste vive um eremita sábio; talvez ele possa te ensinar algo sobre os aparentemente indestrutíveis Cavaleiros das Trevas.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(113);
            }}>
              Você escolhe ir com ele
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(11);
            }}>
              Prefere seguir para o sul, rumo a Karnstein
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
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {modalImage && (
        <ImageModal
          open={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setModalImage(null);
          }}
          imageSrc={modalImage.src}
          imageAlt={modalImage.alt}
        />
      )}
    </Container>
  );
};

export default Screen102;

