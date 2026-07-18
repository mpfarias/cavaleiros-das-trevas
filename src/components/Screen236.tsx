import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import { GameAlert } from './ui/GameAlert';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';
import bransellImg from '../assets/images/personagens/bransell.png';
import rogmondoImg from '../assets/images/personagens/rogmondo.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

type ScreenPhase = 'intro' | 'battle' | 'victory';

const enemy = {
  nome: 'Bransell',
  pericia: 6,
  forca: 9,
  imagem: bransellImg,
};

const applyGoldReward = (ficha: Ficha): Ficha => {
  const fichaAtualizada = { ...ficha, bolsa: [...ficha.bolsa] };
  const moedasOuro = fichaAtualizada.bolsa.find((item) => item.tipo === 'ouro');

  if (moedasOuro) {
    moedasOuro.quantidade = (moedasOuro.quantidade || 0) + 4;
  } else {
    fichaAtualizada.bolsa.push({
      id: `ouro_rogmondo_${Date.now()}`,
      nome: 'Moedas de Ouro',
      tipo: 'ouro',
      quantidade: 4,
      descricao: 'Moedas arrancadas de Rogmondo',
      adquiridoEm: 'Vitória sobre Bransell - Loja de Rogmondo',
    });
  }

  return fichaAtualizada;
};

interface Screen236Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen236: React.FC<Screen236Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(236);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [phase, setPhase] = useState<ScreenPhase>('intro');
  const [showGoldAlert, setShowGoldAlert] = useState(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const rewardsAppliedRef = useRef(false);
  const fichaRef = useRef(ficha);

  useEffect(() => {
    fichaRef.current = ficha;
  }, [ficha]);

  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('🎵 [Screen236] Erro ao inicializar áudio de batalha:', error);
      }
    };

    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const stableOnUpdateFicha = useCallback((updatedFicha: Ficha) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  const handleCharacterHover = useCallback((src: string) => (event: React.MouseEvent) => {
    setHoverImage({
      src,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleCharacterLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleCharacterMove = useCallback((event: React.MouseEvent) => {
    setHoverImage((prev) => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleImageClick = useCallback((src: string, alt: string) => {
    playClick();
    setModalImage({ src, alt });
    setShowImageModal(true);
  }, [playClick]);

  const handleStartBattle = () => {
    playClick();
    setPhase('battle');

    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        setPhase('intro');
      }
    };

    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleVictory = () => {
    if (!rewardsAppliedRef.current) {
      rewardsAppliedRef.current = true;
      const fichaAtualizada = applyGoldReward(fichaRef.current);
      onUpdateFicha(fichaAtualizada);

      setTimeout(() => {
        setShowGoldAlert(true);
        setTimeout(() => setShowGoldAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);
    }

    setPhase('victory');
  };

  const handleDefeat = () => {
    onGoToScreen(999);
  };

  const accentColor = theme.locationLink.color;

  return (
    <>
      <VolumeControl />

      <GameAlert sx={{ top: '120px' }} visible={showGoldAlert} onClose={() => setShowGoldAlert(false)}>
        💰 +4 Moedas de Ouro de Rogmondo!
      </GameAlert>

      {currentGroup && (
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
          <span>
            <IconButton
              onClick={() => {
                playClick();
                togglePlay?.();
              }}
              sx={{
                color: isPlaying ? '#B31212' : '#E0DFDB',
                background: 'rgba(15,17,20,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': {
                  background: 'rgba(179,18,18,0.2)',
                  borderColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      )}

      <Container data-screen="screen-236">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {phase === 'intro' && (
              <>
                <NarrativeText>
                  — O quê? —{' '}
                  <LocationLink
                    onMouseEnter={handleCharacterHover(rogmondoImg)}
                    onMouseLeave={handleCharacterLeave}
                    onMouseMove={handleCharacterMove}
                    onClick={() => handleImageClick(rogmondoImg, 'Rogmondo')}
                  >
                    Rogmondo
                  </LocationLink>
                  {' '}arregala os olhos. — Inspetor sanitário? Em Royal Lendle? Isso não existe!
                  <br /><br />
                  Ele afasta a cortina que separa a sala dos fundos e grita:
                  <br /><br />
                  — Bransell!
                  <br /><br />
                  No mesmo instante, seu animal de estimação aparece: um rato monstruoso do tamanho de um lobo!
                  <br /><br />
                  Num salto, a criatura avança contra você com as garras afiadas.
                  <br /><br />
                  <strong>BRANSELL — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
                </NarrativeText>

                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <img
                    src={bransellImg}
                    alt="Bransell"
                    style={{
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: theme.hoverImage.border,
                      boxShadow: theme.hoverImage.boxShadow,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(bransellImg, 'Bransell')}
                  />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => {
                      playClick();
                      setShowBattleInfoModal(true);
                    }}
                    variant="outlined"
                    sx={{
                      padding: '12px 24px',
                      border: `2px solid ${accentColor}`,
                      color: accentColor,
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 600,
                      marginBottom: '16px',
                      '&:hover': {
                        background: 'rgba(0,0,0,0.05)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Conhecer Sistema de Batalhas
                  </Button>

                  <ChoiceButton onClick={handleStartBattle}>
                    Iniciar Batalha
                  </ChoiceButton>
                </Box>
              </>
            )}

            {phase === 'battle' && (
              <BattleSystem
                enemy={enemy}
                ficha={ficha}
                onUpdateFicha={stableOnUpdateFicha}
                onVictory={handleVictory}
                onDefeat={handleDefeat}
                onGoToScreen={onGoToScreen}
                ref={battleSystemRef}
              />
            )}

            {phase === 'victory' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: `${fadeIn} 0.5s ease-out` }}>
                <Typography variant="h5" sx={{
                  color: '#4CAF50',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  marginBottom: '16px',
                }}>
                  VITÓRIA!
                </Typography>

                <NarrativeText sx={{ marginBottom: '16px' }}>
                  Você abandona a loja. Ao sair para a rua, encontra uma multidão agitada, seguida por uma patrulha de guardas abrindo caminho entre as pessoas.
                </NarrativeText>

                <ChoiceButton onClick={() => { playClick(); onGoToScreen(118); }}>
                  Seguir o caminho
                </ChoiceButton>
              </Box>
            )}
          </CardContent>
        </CardWrap>
      </Container>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={modalImage?.src ?? bransellImg}
        imageAlt={modalImage?.alt ?? 'Bransell'}
      />

      {showBattleInfoModal && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 999,
            }}
            onClick={() => setShowBattleInfoModal(false)}
          />
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme.cardWrap.background,
              border: theme.cardWrap.border,
              borderRadius: theme.cardWrap.borderRadius,
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: theme.cardWrap.boxShadow,
            }}
          >
            <Typography variant="h5" sx={{
              fontFamily: '"Cinzel", serif',
              color: theme.narrativeText.color,
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              Sistema de Batalhas
            </Typography>
            <Typography sx={{ fontFamily: '"Spectral", serif', color: theme.narrativeText.color, lineHeight: 1.8 }}>
              Em cada turno, você e o inimigo rolam dados. Some o resultado aos seus atributos de PERÍCIA (ataque) e FORÇA (vida).
              Quem tiver o total maior causa dano ao oponente. Você pode testar a Sorte para dobrar o dano causado ou reduzir o dano recebido.
            </Typography>
            <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                onClick={() => setShowBattleInfoModal(false)}
                variant="contained"
                sx={{
                  background: theme.choiceButton.background,
                  color: theme.choiceButton.color,
                  fontFamily: '"Cinzel", serif',
                }}
              >
                Entendi
              </Button>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default Screen236;
