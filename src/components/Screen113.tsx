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
import pocoDoFeiticeiroImg from '../assets/images/locais/poco-do-feiticeiro.png';

interface Screen113Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen113: React.FC<Screen113Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(113);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(113);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handlePocoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: pocoDoFeiticeiroImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handlePocoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handlePocoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handlePocoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-113">
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
            Você segue diretamente para o leste até alcançar uma grande ponte, que atravessa, chegando à estrada de Weirtown.
            <br/><br/>
            Não demora para que você entre numa região de montanhas baixas e arborizadas onde, segundo dizem, mora o eremita — uma área também conhecida pelos seus salteadores!
            <br/><br/>
            Com o pôr do sol, você entra num caminho tortuoso que segue ao norte, rumo à zona alta. Ali encontra um monumento famoso: o{' '}
            <strong><LocationLink
              onMouseEnter={handlePocoHover}
              onMouseLeave={handlePocoLeave}
              onMouseMove={handlePocoMove}
              onClick={handlePocoClick}
            >Poço do Feiticeiro</LocationLink></strong> — o rosto de um feiticeiro esculpido na rocha, agora coberto de musgo, do qual brota uma nascente de água dotada de poderes mágicos.
            <br/><br/>
            Beber dessa água só pode lhe fazer bem.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(194);
            }}>
              Beber da água do Poço
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(349);
            }}>
              Seguir viagem
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

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={pocoDoFeiticeiroImg}
        imageAlt="Poço do Feiticeiro"
      />
    </Container>
  );
};

export default Screen113;
