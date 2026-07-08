import React, { useMemo, useState, useCallback } from 'react';
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
import orbeArmadilhaImg from '../assets/images/armadilha-da-mente.png';

const ORBE_NOME = 'Orbe Armadilha da Mente';

const possuiOrbe = (ficha: Ficha): boolean =>
  ficha.bolsa.some(
    item =>
      item.nome.toLowerCase().includes('orbe') &&
      item.nome.toLowerCase().includes('armadilha')
  );

interface Screen10Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen10: React.FC<Screen10Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(10);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(10);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [faseOrbe, setFaseOrbe] = useState<'escolha' | 'acoes'>(() =>
    possuiOrbe(ficha) ? 'acoes' : 'escolha'
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showItemAlert, setShowItemAlert] = useState(false);

  const handleOrbeHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: orbeArmadilhaImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleOrbeLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleOrbeMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleOrbeClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  const handleLevarOrbe = (levar: boolean) => {
    playClick();

    if (levar && !possuiOrbe(ficha)) {
      const fichaAtualizada = adicionarItem(ficha, {
        nome: ORBE_NOME,
        tipo: 'equipamento',
        descricao: 'Artefato hipnótico encontrado no Santuário de Hegmar. Perigoso de transportar, mas pode ser útil.',
        adquiridoEm: 'Tela 10 - Santuário de Hegmar',
      });
      onUpdateFicha(fichaAtualizada);
      setShowItemAlert(true);
      setTimeout(() => setShowItemAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }

    setFaseOrbe('acoes');
  };

  return (
    <Container data-screen="screen-10">
      <GameAlert sx={{ top: '120px' }} visible={showItemAlert} onClose={() => setShowItemAlert(false)}>
        🔮 Você ganhou: {ORBE_NOME}!
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
            O suor escorre pelo seu rosto e, ao conseguir se livrar do terrível artefato conhecido como{' '}
            <LocationLink
              onMouseEnter={handleOrbeHover}
              onMouseLeave={handleOrbeLeave}
              onMouseMove={handleOrbeMove}
              onClick={handleOrbeClick}
            >
              Orbe Armadilha da Mente
            </LocationLink>
            , você cai de costas no chão.
            <br /><br />
            Embora seja perigoso transportá-lo, talvez ele possa ser útil no futuro. Você pode decidir se quer levá-lo ou não.
          </NarrativeText>

          {faseOrbe === 'escolha' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <ChoiceButton onClick={() => handleLevarOrbe(true)}>
                Sim, levar o Orbe Armadilha da Mente
              </ChoiceButton>
              <ChoiceButton onClick={() => handleLevarOrbe(false)}>
                Não levar o Orbe
              </ChoiceButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(193); }}>
                Investigar o sarcófago
              </ChoiceButton>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(147); }}>
                Examinar a escrivaninha de Hegmar
              </ChoiceButton>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(216); }}>
                Deixar tudo para trás e ir embora
              </ChoiceButton>
            </Box>
          )}
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt={ORBE_NOME} />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={orbeArmadilhaImg}
        imageAlt={ORBE_NOME}
      />
    </Container>
  );
};

export default Screen10;
