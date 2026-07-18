import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import oradorImg from '../assets/images/personagens/orador01.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.4)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)'
});

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

interface Screen181Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen181: React.FC<Screen181Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);

  const [battleState, setBattleState] = useState<'intro' | 'battle' | 'victory'>('intro');
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const stableOnUpdateFicha = useCallback((updatedFicha: Ficha) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('🎵 [Screen181] Erro ao inicializar áudio de batalha:', error);
      }
    };

    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const enemy = {
    nome: 'Agitador',
    pericia: 8,
    forca: 7,
    imagem: oradorImg
  };

  const handleVictory = () => {
    setBattleState('victory');
    setTimeout(() => {
      onGoToScreen(370);
    }, 2500);
  };

  const handleStartBattle = () => {
    playClick();
    setBattleState('battle');

    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        setBattleState('intro');
      }
    };

    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleDefeat = () => {
    onGoToScreen(999);
  };

  return (
    <>
      <VolumeControl />

      {currentGroup && (
        <Box sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}>
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
                  }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <Container data-screen="screen-181">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {battleState === 'intro' && (
              <>
                <NarrativeText>
                  Você sabe que o melhor a fazer é enfrentar o mais perigoso dos agitadores. O brutamontes deixou um rastro de sangue entre guardas e espectadores, e precisa ser detido.
                  <br /><br />
                  <strong>AGITADOR — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
                </NarrativeText>

                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <img
                    src={enemy.imagem}
                    alt={enemy.nome}
                    style={{
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: '2px solid #8B4513',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      playClick();
                      setShowImageModal(true);
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
                      border: '2px solid #8B4513',
                      color: '#8B4513',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 600,
                      marginBottom: '16px',
                      '&:hover': {
                        background: 'rgba(139,69,19,0.1)',
                        borderColor: '#654321',
                        transform: 'translateY(-2px)'
                      }
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

            {battleState === 'battle' && (
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

            {battleState === 'victory' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: `${fadeIn} 0.5s ease-out` }}>
                <Typography variant="h5" sx={{
                  color: '#4CAF50',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  marginBottom: '24px'
                }}>
                  VITÓRIA!
                </Typography>

                <Typography variant="body1" sx={{
                  textAlign: 'center',
                  color: '#3d2817',
                  fontFamily: '"Spectral", serif',
                  marginBottom: '32px'
                }}>
                  Você deteve o agitador e ajudou a restabelecer a ordem no Pátio dos Oradores.
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardWrap>
      </Container>

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
              background: `
                linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 50%, rgba(205,133,63,0.98) 100%)
              `,
              border: '3px solid #8B4513',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 1000,
            }}
          >
            <Typography variant="h5" sx={{
              textAlign: 'center',
              marginBottom: '24px',
              color: '#8B4513',
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold'
            }}>
              Sistema de Batalha
            </Typography>

            <Typography variant="body1" sx={{
              fontFamily: '"Spectral", serif',
              fontSize: '16px',
              lineHeight: 1.8,
              color: '#3d2817',
              marginBottom: '16px'
            }}>
              A cada turno, você e o inimigo rolam 2 dados. O total é somado à PERÍCIA de cada um. Quem tiver o maior valor causa 2 pontos de dano na FORÇA do oponente. Em empate, ninguém sofre dano.
            </Typography>

            <Typography variant="body1" sx={{
              fontFamily: '"Spectral", serif',
              fontSize: '16px',
              lineHeight: 1.8,
              color: '#3d2817',
              marginBottom: '24px'
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
                  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                  color: '#F5DEB3',
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

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={oradorImg}
        imageAlt="Agitador"
      />
    </>
  );
};

export default Screen181;
