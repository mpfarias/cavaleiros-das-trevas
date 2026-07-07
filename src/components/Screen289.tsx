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
import mulherFrutasImg from '../assets/images/personagens/mulher-frutas.png';

interface Screen289Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen289: React.FC<Screen289Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(289);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(289);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleMulherHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: mulherFrutasImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleMulherLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleMulherMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleMulherClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-289">
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
            Infelizmente, a{' '}
            <LocationLink
              onMouseEnter={handleMulherHover}
              onMouseLeave={handleMulherLeave}
              onMouseMove={handleMulherMove}
              onClick={handleMulherClick}
            >
              mulher bem-vestida
            </LocationLink>
            {' '}é a oradora mais hostilizada do dia. Sua roupa já está manchada pelos frutos que a multidão atirou nela.
            <br /><br />
            Mesmo assim, ela não desiste. Ao ouvi-la, você percebe que as ideias dela são muito parecidas com as suas.
            <br /><br />
            — Ninguém gosta desses magos intrometidos, que se acham os salvadores do mundo. Eles têm poder demais. Um poder capaz de destruir toda a vida em Titã... e muito mais. Alguém realmente acredita que essa é a proteção de que precisamos? Não! É apenas uma questão de tempo até que Titã seja destruída — pela guerra ou por um acidente. Precisamos nos unir para pôr fim a essa loucura. Acabem com os Magos! Agora!
            <br /><br />
            Naquele exato instante, um zumbido corta o ar. Todos olham para cima e veem uma bola de fogo cruzando o céu em direção à mulher.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(341); }}>
              Protegê-la, colocando-se entre ela e o projétil
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(6); }}>
              Se afastar
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
          <img src={hoverImage.src} alt="Oradora" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={mulherFrutasImg}
        imageAlt="Oradora do Pátio dos Oradores"
      />
    </Container>
  );
};

export default Screen289;
