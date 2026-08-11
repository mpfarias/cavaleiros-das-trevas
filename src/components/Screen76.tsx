import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import type { Ficha } from '../types';
import hammicusImg from '../assets/images/personagens/hammicus.png';

interface Screen76Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen76: React.FC<Screen76Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(76);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(76);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [showSorteAlert, setShowSorteAlert] = useState(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const rewardAppliedRef = useRef(false);

  useEffect(() => {
    if (rewardAppliedRef.current || ficha.flags?.hammicusTeachingReceived) return;
    rewardAppliedRef.current = true;

    onUpdateFicha({
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: Math.min(ficha.sorte.inicial, ficha.sorte.atual + 1),
      },
      flags: {
        ...ficha.flags,
        hammicusTeachingReceived: true,
      },
    });

    setShowSorteAlert(true);
    const timer = setTimeout(
      () => setShowSorteAlert(false),
      NOTIFICATION_CONFIG.autoHideDuration,
    );

    return () => clearTimeout(timer);
  }, [ficha, onUpdateFicha]);

  const handleHammicusHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: hammicusImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleHammicusMove = useCallback((event: React.MouseEvent) => {
    setHoverImage((current) => current ? {
      ...current,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const hammicusLink = (children: React.ReactNode) => (
    <LocationLink
      onMouseEnter={handleHammicusHover}
      onMouseMove={handleHammicusMove}
      onMouseLeave={() => setHoverImage(null)}
      onClick={() => {
        playClick();
        setShowImageModal(true);
      }}
    >
      {children}
    </LocationLink>
  );

  return (
    <Container data-screen="screen-76">
      <GameAlert
        sx={{ top: '120px' }}
        visible={showSorteAlert}
        onClose={() => setShowSorteAlert(false)}
      >
        ✨ Você ganhou 1 ponto de SORTE!
      </GameAlert>

      <VolumeControl />

      <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
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
                '&:disabled': { cursor: 'not-allowed' },
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
            Quando parece que o eremita está prestes a ser tomado pela fúria, ele cai de joelhos e começa a soluçar.
            <br /><br />
            Lá fora, a voz insiste cada vez mais.
            <br /><br />
            {hammicusLink('Hammicus')} tapa os ouvidos e grita:
            <br /><br />
            — Deixe-me em paz! Você não pode ser meu filho! Meu filho morreu!
            <br /><br />
            Ao ouvir isso, a voz solta um grito e desaparece.
            <br /><br />
            O silêncio volta a reinar.
            <br /><br />
            Ainda emocionado, {hammicusLink('Hammicus')} sorri entre as lágrimas e diz:
            <br /><br />
            — Você salvou minha vida. Em troca, compartilharei um conhecimento precioso. Os Cavaleiros das Trevas são frutos da vontade de seu Mestre. A destruição deles depende da destruição dele. Porém, eles podem ser libertados. Sempre que derrotar um Cavaleiro, arranque sua máscara. Separado de seu talismã, ele será amaldiçoado e passará cem anos no limbo.
            <br /><br />
            Você passa a noite na cabana e, logo ao amanhecer, inicia a viagem de volta para o sul.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(44);
            }}>
              Ir para o sul
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

export default Screen76;
