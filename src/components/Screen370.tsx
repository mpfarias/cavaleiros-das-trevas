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
import mendokanImg from '../assets/images/personagens/mendokan.png';
import marcaCaosImg from '../assets/images/marcacaos.png';
import perdaoCivicoImg from '../assets/images/perdao-civico.png';

const DOCUMENTO_PERDAO_ID = 'documento-perdao-civico';

interface Screen370Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen370: React.FC<Screen370Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(370);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(370);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [showItemAlert, setShowItemAlert] = useState(false);
  const [showSorteAlert, setShowSorteAlert] = useState(false);
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

  const handleImageClick = useCallback((src: string, alt: string) => {
    playClick();
    setModalImage({ src, alt });
  }, [playClick]);

  const marcaHandlers = createHoverHandlers(marcaCaosImg);
  const mendokanHandlers = createHoverHandlers(mendokanImg);
  const perdaoHandlers = createHoverHandlers(perdaoCivicoImg);

  useEffect(() => {
    if (rewardsAppliedRef.current) return;

    const jaTemDocumento = ficha.bolsa.some(
      (item: Item) =>
        item.id === DOCUMENTO_PERDAO_ID ||
        (item.nome.toLowerCase().includes('documento') && item.nome.toLowerCase().includes('perdão'))
    );

    if (jaTemDocumento) {
      rewardsAppliedRef.current = true;
      return;
    }

    rewardsAppliedRef.current = true;

    const documentoPerdao: Item = {
      id: DOCUMENTO_PERDAO_ID,
      nome: 'Documento de Perdão Cívico',
      tipo: 'equipamento',
      descricao: 'Perdão oficial da Cidade de Royal Lendle. Você não deve mais nada à Cidade.',
      adquiridoEm: 'Tela 370 - Pátio dos Oradores'
    };

    const novaSorteAtual = Math.min(ficha.sorte.inicial, ficha.sorte.atual + 1);
    const sorteAumentou = novaSorteAtual > ficha.sorte.atual;

    const fichaAtualizada: Ficha = {
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: novaSorteAtual
      },
      bolsa: [...ficha.bolsa, documentoPerdao]
    };

    onUpdateFicha(fichaAtualizada);

    setShowItemAlert(true);
    setTimeout(() => setShowItemAlert(false), NOTIFICATION_CONFIG.autoHideDuration);

    if (sorteAumentou) {
      setTimeout(() => {
        setShowSorteAlert(true);
        setTimeout(() => setShowSorteAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 800);
    }
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-370">
      <GameAlert sx={{ top: '120px' }} visible={showItemAlert} onClose={() => setShowItemAlert(false)}>
        📜 Você recebeu: Documento de Perdão Cívico!
      </GameAlert>

      <GameAlert sx={{ top: showItemAlert ? '180px' : '120px' }} visible={showSorteAlert} onClose={() => setShowSorteAlert(false)}>
        🍀 +1 SORTE atual!
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
            O combate é duro e demorado, mas, no fim, os guardas conseguem retomar o controle da situação. Muitos ficaram feridos e alguns morreram — entre eles, os agitadores.
            <br /><br />
            O comandante rasga a túnica negra do líder e revela a{' '}
            <LocationLink
              {...marcaHandlers}
              onClick={() => handleImageClick(marcaCaosImg, 'Marca do Caos')}
            >
              Marca do Caos
            </LocationLink>
            . Além disso, o homem carregava um pingente mágico capaz de hipnotizar até os mais resistentes.
            <br /><br />
            Trata-se de mais um servo do Mal, enviado para desestabilizar a aliança entre os Quatro Reinos.
            <br /><br />
            Satisfeito, o comandante se volta para você.
            <br /><br />
            — Foi uma sorte encontrá-lo aqui, mercenário. Sem a sua ajuda, este confronto teria terminado de forma bem diferente. Sei que você tem uma grande dívida a pagar. Como recompensa, ofereço este{' '}
            <LocationLink
              {...perdaoHandlers}
              onClick={() => handleImageClick(perdaoCivicoImg, 'Documento de Perdão Cívico')}
            >
              Documento de Perdão Cívico
            </LocationLink>
            . A partir de agora, você não deve mais nada à Cidade.
            <br /><br />
            Depois de toda essa confusão, você decide que o melhor é reencontrar{' '}
            <LocationLink
              {...mendokanHandlers}
              onClick={() => handleImageClick(mendokanImg, 'Mendokan')}
            >
              Mendokan
            </LocationLink>
            .
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(272); }}>
              Deixar a cidade pelo Portão Sul
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(60); }}>
              Seguir para o Portão Leste
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

      {modalImage && (
        <ImageModal
          open={Boolean(modalImage)}
          onClose={() => setModalImage(null)}
          imageSrc={modalImage.src}
          imageAlt={modalImage.alt}
        />
      )}
    </Container>
  );
};

export default Screen370;
