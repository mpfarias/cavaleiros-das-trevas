import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import mapMusic from '../assets/sounds/nature-sound-map.mp3';
import bgmBattle from '../assets/sounds/bgm-battle.mp3';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';
import bandidoArcoImg from '../assets/images/personagens/bandido-arco.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SCREEN_STATE_KEY = 'cavaleiro:screen-92-state';

type ScreenPhase = 'sorte' | 'prep' | 'battle' | 'victory';

/** Remove estado legado que travava a tela após F5 */
const clearLegacyScreenState = () => {
  try {
    sessionStorage.removeItem(SCREEN_STATE_KEY);
  } catch {
    // ignore
  }
};

interface Screen92Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const enemy = {
  nome: 'Bandido',
  pericia: 7,
  forca: 6,
  imagem: bandidoArcoImg,
};

const Screen92: React.FC<Screen92Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic, currentTrack } = useAudio();
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(92);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [phase, setPhase] = useState<ScreenPhase>('sorte');
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [arrowHit, setArrowHit] = useState(false);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  const [luckResultOpen, setLuckResultOpen] = useState(false);
  const [rolled, setRolled] = useState<[number, number] | null>(null);
  const [luckTotal, setLuckTotal] = useState<number | null>(null);
  const [hadLuck, setHadLuck] = useState<boolean | null>(null);
  const [pendingDeath, setPendingDeath] = useState(false);
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const arrowHitRef = useRef(false);

  const isBattlePhase = phase === 'prep' || phase === 'battle' || phase === 'victory';

  useEffect(() => {
    clearLegacyScreenState();
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const track = isBattlePhase ? bgmBattle : mapMusic;
        await changeTrack(track);
        tryStartMusic();
      } catch (error) {
        console.warn('🎵 [Screen92] Erro ao inicializar áudio:', error);
      }
    };

    initAudio();
  }, [isBattlePhase, changeTrack, tryStartMusic]);

  useEffect(() => {
    arrowHitRef.current = arrowHit;
  }, [arrowHit]);

  const stableOnUpdateFicha = useCallback((updatedFicha: Ficha) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  const goToPhase = useCallback((nextPhase: ScreenPhase, hit?: boolean) => {
    if (hit !== undefined) {
      setArrowHit(hit);
      arrowHitRef.current = hit;
    }
    setPhase(nextPhase);
  }, []);

  const handleBandidoHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: bandidoArcoImg,
      x: event.clientX + 20,
      y: event.clientY - 20,
    });
  }, []);

  const handleBandidoLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleBandidoMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20,
    } : null);
  }, []);

  const handleBandidoClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  const handleTestLuck = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = useCallback((dice: number[], total: number) => {
    setShowDiceModal(false);
    setRolled([dice[0], dice[1]]);
    setLuckTotal(total);

    const sorteAtual = ficha.sorte?.atual ?? 0;
    const luckSuccess = total <= sorteAtual;
    setHadLuck(luckSuccess);

    let fichaAtualizada: Ficha = {
      ...ficha,
      sorte: {
        ...ficha.sorte,
        atual: Math.max(0, sorteAtual - 1),
      },
    };

    let hitByArrow = false;

    if (!luckSuccess) {
      const novaForca = Math.max(0, fichaAtualizada.forca.atual - 3);
      fichaAtualizada = {
        ...fichaAtualizada,
        forca: {
          ...fichaAtualizada.forca,
          atual: novaForca,
        },
      };
      hitByArrow = true;
      setArrowHit(true);
      arrowHitRef.current = true;

      if (novaForca <= 0) {
        onUpdateFicha(fichaAtualizada);
        setPendingDeath(true);
        setLuckResultOpen(true);
        return;
      }
    }

    onUpdateFicha(fichaAtualizada);
    setPendingDeath(false);
    setLuckResultOpen(true);

    if (hitByArrow) {
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }
  }, [ficha, onUpdateFicha]);

  const handleLuckResultContinue = () => {
    playClick();
    setLuckResultOpen(false);

    if (pendingDeath) {
      onGoToScreen(999);
      return;
    }

    goToPhase('prep', hadLuck === false);
  };

  const handleStartBattle = () => {
    playClick();
    goToPhase('battle');

    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        goToPhase('prep');
      }
    };

    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleVictory = () => {
    goToPhase('victory');
    setTimeout(() => {
      onGoToScreen(274);
    }, 2500);
  };

  const handleDefeat = () => {
    onGoToScreen(999);
  };

  const accentColor = theme.locationLink.color;

  return (
    <>
      <VolumeControl />

      <GameAlert sx={{ top: '120px' }} visible={showForceAlert} onClose={() => setShowForceAlert(false)}>
        ⚔️ A flecha atingiu você! Você perdeu 3 pontos de FORÇA!
      </GameAlert>

      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentTrack ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <span>
            <IconButton
              onClick={() => {
                playClick();
                togglePlay?.();
              }}
              disabled={!currentTrack}
              sx={{
                color: currentTrack ? (isPlaying ? '#B31212' : '#E0DFDB') : '#666',
                background: 'rgba(15,17,20,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                opacity: currentTrack ? 1 : 0.5,
                '&:hover': currentTrack ? {
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

      <Container data-screen="screen-92">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {phase === 'sorte' && (
              <>
                <NarrativeText>
                  Você ouve o estalo da corda do arco — o{' '}
                  <LocationLink
                    onMouseEnter={handleBandidoHover}
                    onMouseLeave={handleBandidoLeave}
                    onMouseMove={handleBandidoMove}
                    onClick={handleBandidoClick}
                  >
                    bandido
                  </LocationLink>
                  {' '}acabou de disparar uma flecha.
                  <br /><br />
                  Por sorte, ele não é um bom arqueiro.
                  <br /><br />
                  Mesmo que sobreviva, você terá de enfrentá-lo em combate, pois ele saca a espada da bainha.
                </NarrativeText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleTestLuck}
                    sx={{
                      background: theme.choiceButton.background,
                      color: theme.choiceButton.color,
                      border: theme.choiceButton.border,
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      textShadow: theme.choiceButton.textShadow,
                      boxShadow: theme.choiceButton.boxShadow,
                      padding: '16px 24px',
                      '&:hover': {
                        background: theme.choiceButton.hoverBackground,
                        borderColor: theme.choiceButton.hoverBorderColor,
                        boxShadow: theme.choiceButton.hoverBoxShadow,
                      },
                    }}
                  >
                    Testar a Sorte (2d6)
                  </Button>
                  <Typography variant="caption" sx={{ color: theme.narrativeText.color }}>
                    A SORTE atual é {ficha.sorte.atual}. Você perderá 1 ponto ao testar.
                  </Typography>
                </Box>
              </>
            )}

            {phase === 'prep' && (
              <>
                <NarrativeText>
                  O{' '}
                  <LocationLink
                    onMouseEnter={handleBandidoHover}
                    onMouseLeave={handleBandidoLeave}
                    onMouseMove={handleBandidoMove}
                    onClick={handleBandidoClick}
                  >
                    bandido
                  </LocationLink>
                  {' '}avança com a espada em punho, pronto para o combate.
                  {arrowHit && (
                    <>
                      <br /><br />
                      A flecha o atingiu antes — você ainda sente a dor do ferimento.
                    </>
                  )}
                  <br /><br />
                  <strong>BANDIDO — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
                </NarrativeText>

                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <img
                    src={enemy.imagem}
                    alt={enemy.nome}
                    style={{
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: theme.hoverImage.border,
                      boxShadow: theme.hoverImage.boxShadow,
                    }}
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
                  marginBottom: '24px',
                }}>
                  VITÓRIA!
                </Typography>

                <Typography variant="body1" sx={{
                  textAlign: 'center',
                  color: theme.narrativeText.color,
                  fontFamily: '"Spectral", serif',
                }}>
                  Você derrotou o bandido mascarado e segue sua jornada rumo ao eremita.
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardWrap>
      </Container>

      {hoverImage && (
        <HoverImage sx={{ left: hoverImage.x, top: hoverImage.y }}>
          <img src={hoverImage.src} alt={enemy.nome} />
        </HoverImage>
      )}

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={bandidoArcoImg}
        imageAlt="Bandido mascarado"
      />

      <DiceRollModal3D
        open={showDiceModal}
        onComplete={handleDiceRoll}
        numDice={2}
        bonus={0}
      />

      <Dialog open={luckResultOpen} onClose={undefined} maxWidth="xs" fullWidth>
        <DialogTitle sx={{
          textAlign: 'center',
          fontFamily: '"Cinzel", serif',
          color: hadLuck ? '#2e7d32' : '#B31212',
        }}>
          {pendingDeath
            ? 'A flecha foi fatal!'
            : hadLuck
              ? 'Você teve sorte!'
              : 'Você não teve sorte!'}
        </DialogTitle>
        <DialogContent>
          <Typography align="center" sx={{ fontSize: '18px', fontWeight: 'bold', mb: 2 }}>
            Dados: {rolled ? `${rolled[0]} + ${rolled[1]} = ${luckTotal}` : ''}
          </Typography>
          <Typography align="center" sx={{ fontFamily: '"Spectral", serif', lineHeight: 1.7 }}>
            {pendingDeath
              ? 'A flecha atingiu você em cheio. Você perdeu 3 pontos de FORÇA e não resiste ao ferimento.'
              : hadLuck
                ? 'A flecha passa rente a você e se perde entre as árvores. O bandido saca a espada e avança.'
                : 'A flecha atinge você! Você perde 3 pontos de FORÇA. O bandido saca a espada e avança.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleLuckResultContinue}
            sx={{
              background: theme.choiceButton.background,
              color: theme.choiceButton.color,
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              padding: '10px 28px',
            }}
          >
            {pendingDeath ? 'Continuar' : 'Enfrentar o bandido'}
          </Button>
        </DialogActions>
      </Dialog>

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
              textAlign: 'center',
              marginBottom: '24px',
              color: accentColor,
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold',
            }}>
              Sistema de Batalha
            </Typography>

            <Typography variant="body1" sx={{
              fontFamily: '"Spectral", serif',
              fontSize: '16px',
              lineHeight: 1.8,
              color: theme.narrativeText.color,
              marginBottom: '16px',
            }}>
              A cada turno, você e o inimigo rolam 2 dados. O total é somado à PERÍCIA de cada um. Quem tiver o maior valor causa 2 pontos de dano na FORÇA do oponente. Em empate, ninguém sofre dano.
            </Typography>

            <Typography variant="body1" sx={{
              fontFamily: '"Spectral", serif',
              fontSize: '16px',
              lineHeight: 1.8,
              color: theme.narrativeText.color,
              marginBottom: '24px',
            }}>
              Após cada turno, você pode testar a Sorte (gastando 1 ponto) para aumentar ou reduzir o dano. A batalha termina quando a FORÇA de alguém chegar a zero.
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={() => {
                  playClick();
                  setShowBattleInfoModal(false);
                }}
                variant="contained"
                sx={{
                  background: theme.choiceButton.background,
                  color: theme.choiceButton.color,
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  padding: '12px 32px',
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

export default Screen92;
