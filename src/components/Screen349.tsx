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

interface Screen349Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen349: React.FC<Screen349Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(349);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(349);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const rewardsAppliedRef = useRef(false);

  const handleHammicusHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: hammicusImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleHammicusLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleHammicusMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleHammicusClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  useEffect(() => {
    if (rewardsAppliedRef.current) return;
    rewardsAppliedRef.current = true;

    const novaForcaAtual = Math.min(ficha.forca.inicial, ficha.forca.atual + 2);
    const forcaGanhou = novaForcaAtual - ficha.forca.atual;

    if (forcaGanhou > 0) {
      onUpdateFicha({
        ...ficha,
        forca: {
          ...ficha.forca,
          atual: novaForcaAtual,
        },
      });

      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }
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
    <Container data-screen="screen-349">
      <GameAlert sx={{ top: '120px' }} visible={showForceAlert} onClose={() => setShowForceAlert(false)}>
        ⚔️ Você ganhou 2 pontos de FORÇA!
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
            Quando você chega à cabana do eremita, já é noite.
            <br /><br />
            {hammicusLink('Hammicus')}, o eremita, é um velho simpático que logo lhe oferece uma refeição quente.
            <br /><br />
            Enquanto vocês comem, você conta tudo sobre sua missão.
            <br /><br />
            Com a expressão séria, {hammicusLink('Hammicus')} abre um velho livro e começa a falar:
            <br /><br />
            — Há muitos anos existiu um ser chamado Voivod. Seu nome significava &quot;Crueldade&quot;. Seu poder ameaçava a própria vida, mas o mundo, por meio da Terra-Mãe e do Deus dos Chifres, ergueu-se contra ele e conseguiu derrotá-lo. Como era impossível matar a própria Morte, eles o aprisionaram com correntes em um lugar secreto.
            <br /><br />
            — Os cinco servos de Voivod desapareceram e nunca mais foram vistos... pelo menos é o que parece. Existe uma antiga cantiga que diz que os Cavaleiros das Trevas procuram a prisão de Voivod para libertar seu senhor e instaurar um reino de terror.
            <br /><br />
            — Também se fala de um livro chamado Astrakkaans Numeris, capaz de prever o retorno de Voivod e revelar como derrotá-lo. Não sei se esse livro realmente existe. Mas de uma coisa tenho certeza: Voivod voltará a Titã!
            <br /><br />
            De repente...
            <br /><br />
            TOC! TOC! TOC!
            <br /><br />
            Três batidas violentas fazem a cabana inteira estremecer.
            <br /><br />
            Logo em seguida, uma voz chorosa ecoa do lado de fora:
            <br /><br />
            — Pai! Sou eu... seu filho. Por favor, deixe-me entrar. Está muito frio aqui fora...
            <br /><br />
            Ao ouvir aquilo, {hammicusLink('Hammicus')} empalidece e recua, tomado pelo horror.
            <br /><br />
            — Não pode ser... Meu filho morreu há sete anos!
            <br /><br />
            Mesmo aterrorizado, ele reúne coragem e começa a caminhar em direção à porta.
            <br /><br />
            Se você não o impedir, o eremita abrirá a porta para alguém que morreu há muito tempo.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(330); }}>
              Impedir Hammicus de abrir a porta
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(314); }}>
              Deixar que ele destranque a porta
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
        imageAlt="Hammicus, o eremita"
      />
    </Container>
  );
};

export default Screen349;
