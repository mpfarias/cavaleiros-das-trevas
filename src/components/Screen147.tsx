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
import type { Ficha, Item } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';
import pergaminhoHegmarImg from '../assets/images/pergaminho-hengmar.png';

interface Screen147Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen147: React.FC<Screen147Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(147);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(147);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showItemAlert, setShowItemAlert] = useState(false);
  const itemAddedRef = useRef(false);

  const handleDocumentoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: pergaminhoHegmarImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleDocumentoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleDocumentoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleDocumentoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  useEffect(() => {
    if (itemAddedRef.current) return;
    const jaTemItem = ficha.bolsa.some(
      (i: Item) => i.id === 'aviso-hegmar' || i.nome?.toLowerCase().includes('aviso de hegmar')
    );
    if (jaTemItem) {
      itemAddedRef.current = true;
      return;
    }

    itemAddedRef.current = true;
    const avisoHegmar: Item = {
      id: 'aviso-hegmar',
      nome: 'O aviso de Hegmar',
      tipo: 'equipamento',
      descricao: 'Documento encontrado na escrivaninha do mago Hegmar. Fala do Circo dos Sonhos e dos Mandrakes.',
      adquiridoEm: 'Santuário de Hegmar'
    };
    const fichaAtualizada: Ficha = {
      ...ficha,
      bolsa: [...ficha.bolsa, avisoHegmar]
    };
    onUpdateFicha(fichaAtualizada);
    setShowItemAlert(true);
    setTimeout(() => setShowItemAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-147">
      <GameAlert sx={{ top: '120px' }} visible={showItemAlert} onClose={() => setShowItemAlert(false)}>
        📜 Você ganhou: O aviso de Hegmar!
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
            Sobre a escrivaninha você encontra um{' '}
            <LocationLink
              onMouseEnter={handleDocumentoHover}
              onMouseLeave={handleDocumentoLeave}
              onMouseMove={handleDocumentoMove}
              onClick={handleDocumentoClick}
            >
              documento recém-escrito
            </LocationLink>
            {' '}— a tinta ainda está fresca. Você lê o texto, escrito com caligrafia elaborada e carregada de tensão:
            <br/><br/>
            O Circo dos Sonhos chegou a Royal Lendle. Esse grupo, aparentemente inofensivo, passou o último ano espalhando o mal de aldeia em aldeia por toda Gallantaria — sem perceber que venho observando cada passo, aguardando o momento certo para agir. O plano deles é bem elaborado. Tenho esperança de desmascará-los em breve. Espere! A porta se abriu e entra—
            <br/><br/>
            O texto termina abruptamente.
            <br/><br/>
            O mistério começa a se esclarecer. Esses Mandrakes, quem quer que sejam, devem ter levado ou eliminado o mago. Isso significa que são extremamente poderosos.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(193); }}>
              Investigar o sarcófago
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(312); }}>
              Investigar a bola de cristal
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(216); }}>
              Ir embora
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="O aviso de Hegmar" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={pergaminhoHegmarImg}
        imageAlt="O aviso de Hegmar"
      />
    </Container>
  );
};

export default Screen147;
