import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import hammicusImg from '../assets/images/personagens/hammicus.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

type ScreenPhase = 'intro' | 'battle' | 'victory';

const enemy = {
  nome: 'Hammicus',
  pericia: 5,
  forca: 7,
  imagem: hammicusImg,
};

interface Screen330Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen330: React.FC<Screen330Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(330);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [phase, setPhase] = useState<ScreenPhase>('intro');
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);

  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('🎵 [Screen330] Erro ao inicializar áudio de batalha:', error);
      }
    };

    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const stableOnUpdateFicha = useCallback((updatedFicha: Ficha) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  const handleHammicusHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: hammicusImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleHammicusLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleHammicusMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleHammicusClick = useCallback(() => {
    playClick();
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
    setPhase('victory');
  };

  const handleDefeat = () => {
    onGoToScreen(999);
  };

  const handleLetHimOpen = () => {
    playClick();
    onGoToScreen(314);
  };

  const accentColor = theme.locationLink.color;

  return (
    <>
      <VolumeControl />

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

      <Container data-screen="screen-330">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {phase === 'intro' && (
              <>
                <NarrativeText>
                  Você corre até{' '}
                  <LocationLink
                    onMouseEnter={handleHammicusHover}
                    onMouseLeave={handleHammicusLeave}
                    onMouseMove={handleHammicusMove}
                    onClick={handleHammicusClick}
                  >
                    Hammicus
                  </LocationLink>
                  {' '}e o segura antes que ele abra a porta.
                  <br /><br />
                  Lá de fora, a voz implora:
                  <br /><br />
                  — Pai... por favor... deixe-me entrar. Se não abrir, eu vou morrer!
                  <br /><br />
                  Tomado pelo desespero,{' '}
                  <LocationLink
                    onMouseEnter={handleHammicusHover}
                    onMouseLeave={handleHammicusLeave}
                    onMouseMove={handleHammicusMove}
                    onClick={handleHammicusClick}
                  >
                    Hammicus
                  </LocationLink>
                  {' '}encontra forças que nem sabia que tinha e tenta se soltar.
                  <br /><br />
                  Só a força bruta será capaz de detê-lo.
                  <br /><br />
                  <strong>HAMMICUS — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
                </NarrativeText>

                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <img
                    src={hammicusImg}
                    alt={enemy.nome}
                    style={{
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: theme.hoverImage.border,
                      boxShadow: theme.hoverImage.boxShadow,
                      cursor: 'pointer',
                    }}
                    onClick={handleHammicusClick}
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
                abandonBattleLabel="Deixar que ele abra a porta"
                onAbandonBattle={handleLetHimOpen}
              />
            )}

            {phase === 'victory' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: `${fadeIn} 0.5s ease-out` }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#4CAF50',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    marginBottom: '16px',
                  }}
                >
                  VITÓRIA!
                </Typography>

                <ChoiceButton onClick={() => { playClick(); onGoToScreen(76); }}>
                  Continuar
                </ChoiceButton>
              </Box>
            )}
          </CardContent>
        </CardWrap>
      </Container>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt="Hammicus" />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={hammicusImg}
        imageAlt="Hammicus"
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
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Cinzel", serif',
                color: theme.narrativeText.color,
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              Sistema de Batalhas
            </Typography>
            <Typography sx={{ fontFamily: '"Spectral", serif', color: theme.narrativeText.color, lineHeight: 1.8 }}>
              Em cada turno, você e o inimigo rolam dados. Some o resultado aos seus atributos de PERÍCIA (ataque) e FORÇA (vida).
              Quem tiver o total maior causa dano ao oponente. Você pode testar a Sorte para dobrar o dano causado ou reduzir o dano recebido.
              <br /><br />
              Nesta luta, ao final de qualquer turno você também pode desistir e deixar Hammicus abrir a porta.
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

export default Screen330;
