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

interface Screen11Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen11: React.FC<Screen11Props> = ({ onGoToScreen, ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(11);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(11);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const hasBrocheFolhaVerde = useMemo(() => {
    return ficha.bolsa.some((item) => (
      item.tipo === 'equipamento' &&
      item.nome.toLowerCase().includes('broche') &&
      item.nome.toLowerCase().includes('folha verde')
    ));
  }, [ficha.bolsa]);

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
    <Container data-screen="screen-11">
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
            Embora ainda esteja longe de Gornt, você continua avançando a bom ritmo para o sul. De repente, para ao ver um rosto estranho e sorridente olhando para você do meio da grama à beira da estrada.
            <br/><br/>
            Só então percebe que é um rosto feito de folhas — parte viva da própria relva! Ele se move de um lado para o outro, como se fosse levado pelo vento, e sua voz é rápida e misteriosa:
            <br/><br/>
            “Aqui está <strong><LocationLink
              onMouseEnter={handleJoaoHover}
              onMouseLeave={handleJoaoLeave}
              onMouseMove={handleJoaoMove}
              onClick={handleJoaoClick}
            >João Verdesfolhas</LocationLink></strong>, um velho rei, para guiá-lo. O mundo está moribundo; o solo está corrompido e as árvores tremem diante da violência. Cinco guerreiros procuram seu senhor, que não será libertado. A Terra-Mãe pode curá-lo, mas você deve provar seu valor.”
            <br/><br/>
            João Verdesfolhas lhe dá uma chance de provar do que é capaz.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {hasBrocheFolhaVerde && (
              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(398);
              }}>
                Mostrar broche de Folha Verde
              </ChoiceButton>
            )}

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(382);
            }}>
              Aceitar o desafio
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(398);
            }}>
              Recusar o desafio
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
        imageSrc={joaoVerduraImg}
        imageAlt="João Verdesfolhas"
      />
    </Container>
  );
};

export default Screen11;
