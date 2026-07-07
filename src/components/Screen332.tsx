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
import { adicionarItem } from '../utils/inventory';
import geomagosImg from '../assets/images/personagens/geomagos.png';
import arquidruidaImg from '../assets/images/personagens/arquidruida.png';
import brocheFolhasVerdesImg from '../assets/images/broche-folhas-verdes.png';

const BROCHE_FOLHA_VERDE_ID = 'broche-folha-verde';

interface Screen332Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen332: React.FC<Screen332Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(332);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(332);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [showItemAlert, setShowItemAlert] = useState(false);
  const rewardsAppliedRef = useRef(false);

  const createHoverHandlers = useCallback((src: string) => ({
    onMouseEnter: (event: React.MouseEvent) => {
      setHoverImage({
        src,
        x: event.clientX + 20,
        y: event.clientY - 20
      });
    },
    onMouseLeave: () => setHoverImage(null),
    onMouseMove: (event: React.MouseEvent) => {
      setHoverImage(prev => prev ? {
        ...prev,
        x: event.clientX + 20,
        y: event.clientY - 20
      } : null);
    },
  }), []);

  const geomagosHandlers = createHoverHandlers(geomagosImg);
  const arquidruidaHandlers = createHoverHandlers(arquidruidaImg);
  const brocheHandlers = createHoverHandlers(brocheFolhasVerdesImg);

  const handleImageClick = useCallback((src: string, alt: string) => {
    playClick();
    setModalImage({ src, alt });
    setShowImageModal(true);
  }, [playClick]);

  useEffect(() => {
    if (rewardsAppliedRef.current) return;

    const jaTemBroche = ficha.bolsa.some(
      item =>
        item.id === BROCHE_FOLHA_VERDE_ID ||
        (item.nome.toLowerCase().includes('broche') && item.nome.toLowerCase().includes('folha verde'))
    );

    if (jaTemBroche) {
      rewardsAppliedRef.current = true;
      return;
    }

    rewardsAppliedRef.current = true;

    const fichaAtualizada = adicionarItem(ficha, {
      nome: 'Broche da Folha Verde',
      tipo: 'equipamento',
      descricao: 'Presente da Terra-Mãe, entregue pelo Arquidruida. Permite percorrer as Linhas de Força de Titã.',
      adquiridoEm: 'Tela 332 - Templo dos Geomagos',
    });

    onUpdateFicha(fichaAtualizada);
    setShowItemAlert(true);
    setTimeout(() => setShowItemAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-332">
      <GameAlert sx={{ top: '120px' }} $isVisible={showItemAlert}>
        🍃 Você ganhou: Broche da Folha Verde!
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
            Quando os{' '}
            <LocationLink
              {...geomagosHandlers}
              onClick={() => handleImageClick(geomagosImg, 'Geomagos')}
            >
              Geomagos
            </LocationLink>
            {' '}afastam as foices do seu pescoço, o{' '}
            <LocationLink
              {...arquidruidaHandlers}
              onClick={() => handleImageClick(arquidruidaImg, 'Arquidruida')}
            >
              Arquidruida
            </LocationLink>
            {' '}ergue os braços e declara:
            <br /><br />
            — De acordo com as antigas leis do Deus dos Chifres, você superou a prova e agora está livre para percorrer as Linhas de Força de Titã. Selamos nossos destinos. Nada mais podemos fazer. Tome isto.
            <br /><br />
            Ele prende em sua roupa um pequeno{' '}
            <LocationLink
              {...brocheHandlers}
              onClick={() => handleImageClick(brocheFolhasVerdesImg, 'Broche da Folha Verde')}
            >
              broche em forma de folha
            </LocationLink>
            .
            <br /><br />
            — Este é um presente da Terra-Mãe. Os tempos estão mudando, e ela está ameaçada. As profecias dizem que será você quem irá salvá-la. Agora vá! Ajude Titã, pois somente assim encontrará a força necessária para cumprir sua missão.
            <br /><br />
            Você ganhou um broche da Folha Verde.
            <br /><br />
            Os servos do Arquidruida acompanham você até o portão dos fundos, que dá para uma rua estreita.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(301); }}>
              Seguir para a esquerda
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(118); }}>
              Seguir para a direita
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
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

export default Screen332;
