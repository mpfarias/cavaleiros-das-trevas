import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import geomagosImg from '../assets/images/personagens/geomagos.png';
import arquidruidaImg from '../assets/images/personagens/arquidruida.png';

interface Screen254Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen254: React.FC<Screen254Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'temple' (bgm-temple.mp3)
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(254);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(254);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  
  const [showForceAlert, setShowForceAlert] = useState(false);
  const appliedRef = useRef(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const handleGeomagosHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: geomagosImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleGeomagosLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleGeomagosMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleGeomagosClick = useCallback(() => {
    playClick();
    setModalImage({ src: geomagosImg, alt: 'Geomagos' });
    setShowImageModal(true);
  }, [playClick]);

  const handleArquidruidaHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: arquidruidaImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleArquidruidaLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleArquidruidaMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleArquidruidaClick = useCallback(() => {
    playClick();
    setModalImage({ src: arquidruidaImg, alt: 'Arquidruida' });
    setShowImageModal(true);
  }, [playClick]);

  // Aplicar perda de FORÇA ao carregar a tela
  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (!ficha) return;

    const updated = { ...ficha };

    // Perder 2 pontos de FORÇA
    if (updated.forca && typeof updated.forca.atual === 'number') {
      const novaForca = Math.max(0, updated.forca.atual - 2);
      updated.forca.atual = novaForca;
      
      // Atualizar ficha
      onUpdateFicha(updated);

      // Mostrar alerta de perda de FORÇA
      setTimeout(() => {
        setShowForceAlert(true);
        setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);

      // Verificar se FORÇA zerou (Game Over)
      if (novaForca <= 0) {
        setTimeout(() => {
          onGoToScreen(999);
        }, 2000);
      }
    }
  }, [ficha, onUpdateFicha, onGoToScreen]);

  return (
    <Container data-screen="screen-254">
      {/* Controle de Volume */}
      <VolumeControl />

      {/* Alerta de perda de FORÇA */}
      {showForceAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
          ⚔️ Você perdeu 2 pontos de FORÇA!
        </GameAlert>
      )}

      {/* Controle de música do grupo */}
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
            Você fez a escolha errada. Uma força transcendente atinge seu braço, causando dor e atordoando você.
            <br/><br/>
            A mesma força alerta os habitantes do templo. Surgem então três{' '}
            <LocationLink
              onMouseEnter={handleGeomagosHover}
              onMouseLeave={handleGeomagosLeave}
              onMouseMove={handleGeomagosMove}
              onClick={handleGeomagosClick}
            >
              Geomagos
            </LocationLink>
            {' '}empunhando foices, que o arrastam para a antecâmara do templo — além da qual nenhum estrangeiro pode avançar.
            <br/><br/>
            Eles o mantêm ali até a chegada de seu mestre, o{' '}
            <LocationLink
              onMouseEnter={handleArquidruidaHover}
              onMouseLeave={handleArquidruidaLeave}
              onMouseMove={handleArquidruidaMove}
              onClick={handleArquidruidaClick}
            >
              Arquidruida
            </LocationLink>
            . Assim como os outros, ele veste roupas brancas e brilhantes, mas aparenta ser mais velho e ter grande autoridade.
            <br/><br/>
            "Previmos sua visita", diz uma voz por trás da imensa barba prateada.
            <br/>
            "Mas você pisou em terras proibidas. Agora terá de aceitar o desafio da sempre sábia Mãe-Terra. O prêmio será a liberdade — o castigo, a morte."
            <br/><br/>
            Num instante, os três{' '}
            <LocationLink
              onMouseEnter={handleGeomagosHover}
              onMouseLeave={handleGeomagosLeave}
              onMouseMove={handleGeomagosMove}
              onClick={handleGeomagosClick}
            >
              Geomagos
            </LocationLink>
            {' '}o forçam a se ajoelhar e posicionam as foices afiadas ao redor de seu pescoço, formando um triângulo.
            <br/><br/>
            "Invoco o Desafio da Terra-Mãe", continua o velho.
            <br/>
            "Que o discernimento o ilumine. Igualmente distantes, contudo desiguais na distância. O que somos? O equinócio ou o solstício?"
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(380);
            }}>
              Equinócio
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(332);
            }}>
              Solstício
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {/* Image Modal */}
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

export default Screen254;

