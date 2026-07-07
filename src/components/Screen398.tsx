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

interface Screen398Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen398: React.FC<Screen398Props> = ({ onGoToScreen, ficha: _ficha, onUpdateFicha: _onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(398);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(398);
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

  const joaoLink = (children: React.ReactNode) => (
    <LocationLink
      onMouseEnter={handleJoaoHover}
      onMouseLeave={handleJoaoLeave}
      onMouseMove={handleJoaoMove}
      onClick={handleJoaoClick}
    >
      {children}
    </LocationLink>
  );

  return (
    <Container data-screen="screen-398">
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
            — Tempos difíceis esperam por você — continua a figura enigmática. — Mas, por bondade, o Deus dos Chifres lhe concede a chance de encontrar o Homem dos Números... ou o livro dele. Sem um dos dois, você está perdido.
            <br /><br />
            Dito isso, o rosto de {joaoLink('João Verdesfolhas')} desaparece.
            <br /><br />
            Você decide seguir o caminho dos elementos, representados por {joaoLink('João Verdesfolhas')}, tornando-se um paladino da Terra-Mãe na luta contra os malignos Cavaleiros das Trevas.
            <br /><br />
            Gornt fica muito mais ao sul do que o mapa faz parecer, e já é noite quando você alcança as muralhas da cidade.
            <br /><br />
            Ao atravessar o Portão Norte, você ouve uma grande confusão e sente um forte cheiro de fumaça. Não há ninguém vigiando a entrada: nem guardas, nem qualquer outra autoridade.
            <br /><br />
            Enquanto pensa no que fazer, vê um homem sair correndo de uma casa, gritando:
            <br /><br />
            — Vá embora! Você não é minha mulher!
            <br /><br />
            Logo atrás dele surge uma jovem, que o agarra pelos pulsos e sorri.
            <br /><br />
            — Claro que sou sua mulher, seu tolo. Quem mais eu poderia ser? Agora pare de resistir e volte para casa.
            <br /><br />
            O homem tenta se desvencilhar, e os dois começam a lutar.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(284); }}>
              Decidir ajudá-lo
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(231); }}>
              Não se envolver e seguir para o centro da cidade
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

export default Screen398;
