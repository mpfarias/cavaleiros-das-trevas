import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';
import hammicusImg from '../assets/images/personagens/hammicus.png';

interface Screen314Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen314: React.FC<Screen314Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(314);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(314);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSorteAlert, setShowSorteAlert] = useState(false);
  const lossAppliedRef = useRef(false);

  const handleHammicusHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: hammicusImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleHammicusLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleHammicusMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleHammicusClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  useEffect(() => {
    if (lossAppliedRef.current) return;
    lossAppliedRef.current = true;

    onUpdateFicha({
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: Math.max(0, ficha.sorte.atual - 1),
      },
    });

    setShowSorteAlert(true);
    setTimeout(() => setShowSorteAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, [ficha, onUpdateFicha]);

  const hammicusLink = (children: React.ReactNode) => (
    <LocationLink
      onMouseEnter={handleHammicusHover}
      onMouseLeave={handleHammicusLeave}
      onMouseMove={handleHammicusMove}
      onClick={handleHammicusClick}
    >
      {children}
    </LocationLink>
  );

  return (
    <Container data-screen="screen-314">
      <GameAlert sx={{ top: '120px' }} visible={showSorteAlert} onClose={() => setShowSorteAlert(false)}>
        🍀 Você perdeu 1 ponto de SORTE!
      </GameAlert>

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
            Assim que {hammicusLink('Hammicus')} destranca a porta, ela se abre de repente e o cadáver reanimado de seu filho invade a cabana.
            <br /><br />
            A criatura salta sobre ele e o agarra pelo pescoço.
            <br /><br />
            Sem conseguir se defender, o velho cai de joelhos, sufocando enquanto tenta respirar.
            <br /><br />
            Você corre para ajudá-lo, mas o morto-vivo está tão determinado a matar o próprio pai que seus golpes não fazem qualquer efeito.
            <br /><br />
            Com o coração pesado, você enterra pai e filho em um bosque próximo.
            <br /><br />
            Agora, siga para o sul.
            <br /><br />
            Você perdeu 1 ponto de SORTE, pois essa tragédia continuará pesando em sua consciência.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(44); }}>
              Seguir para o sul
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="Hammicus" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={hammicusImg}
        imageAlt="Hammicus"
      />
    </Container>
  );
};

export default Screen314;
