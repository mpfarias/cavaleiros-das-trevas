import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import agitador01Img from '../assets/images/personagens/agitador01.png';
import agitador02Img from '../assets/images/personagens/agitador02.png';
import agitador03Img from '../assets/images/personagens/agitador03.png';
import agitador04Img from '../assets/images/personagens/agitador04.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
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
  },
  '&:disabled': {
    opacity: 0.3,
    cursor: 'not-allowed',
    transform: 'none',
    background: 'linear-gradient(135deg, rgba(80,80,80,0.5) 0%, rgba(60,60,60,0.5) 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(80,80,80,0.5) 0%, rgba(60,60,60,0.5) 100%)',
      transform: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
    }
  }
});

const EnemyCard = styled(Box)({
  padding: '16px',
  background: 'rgba(139,69,19,0.1)',
  border: '2px solid rgba(139,69,19,0.3)',
  borderRadius: '12px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(139,69,19,0.2)',
    borderColor: 'rgba(139,69,19,0.5)',
  }
});

const HoverImage = styled(Box)({
  position: 'fixed',
  zIndex: 1500,
  pointerEvents: 'none',
  animation: `${fadeInImage} 0.3s ease-out`,
  '& img': {
    maxWidth: '400px',
    maxHeight: '400px',
    borderRadius: '12px',
    border: '3px solid #8B4513',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backgroundColor: 'transparent'
  }
});

interface Enemy {
  id: string;
  nome: string;
  pericia: number;
  forca: number;
  defeated: boolean;
  imagem: string;
}

interface Screen205Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen205: React.FC<Screen205Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const playClick = useClickSound(0.2);

  const [battlePhase, setBattlePhase] = useState<'intro' | 'enemySelection' | 'battle' | 'victory'>('intro');
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 'agitador1', nome: 'Primeiro Agitador', pericia: 7, forca: 4, defeated: false, imagem: agitador01Img },
    { id: 'agitador2', nome: 'Segundo Agitador', pericia: 8, forca: 7, defeated: false, imagem: agitador02Img },
    { id: 'agitador3', nome: 'Terceiro Agitador', pericia: 6, forca: 6, defeated: false, imagem: agitador03Img },
    { id: 'agitador4', nome: 'Quarto Agitador', pericia: 5, forca: 5, defeated: false, imagem: agitador04Img },
  ]);

  const stableOnUpdateFicha = useCallback((updatedFicha: Ficha) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  const handleEnemyHoverIntro = useCallback((event: React.MouseEvent, enemy: Enemy) => {
    setHoverImage({
      src: enemy.imagem,
      x: event.clientX - 1,
      y: event.clientY - 20
    });
  }, []);

  const handleEnemyMoveIntro = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX - 280,
      y: event.clientY - 380
    } : null);
  }, []);

  const handleEnemyHoverSelection = useCallback((event: React.MouseEvent, enemy: Enemy) => {
    setHoverImage({
      src: enemy.imagem,
      x: event.clientX - 1,
      y: event.clientY - 20
    });
  }, []);

  const handleEnemyMoveSelection = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 10,
      y: event.clientY + 10
    } : null);
  }, []);

  const handleEnemyLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleEnemyCardClick = useCallback((enemy: Enemy) => {
    playClick();
    setModalImage({ src: enemy.imagem, alt: enemy.nome });
    setShowImageModal(true);
  }, [playClick]);

  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('🎵 [Screen205] Erro ao inicializar áudio de batalha:', error);
      }
    };

    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const handleStartFighting = () => {
    playClick();
    setBattlePhase('enemySelection');
  };

  const handleSelectEnemy = (enemy: Enemy) => {
    playClick();
    setCurrentEnemy(enemy);
    setBattlePhase('battle');

    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado');
        setBattlePhase('enemySelection');
      }
    };

    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleEnemyDefeated = () => {
    if (!currentEnemy) return;

    setEnemies(prev => {
      const updated = prev.map(e =>
        e.id === currentEnemy.id ? { ...e, defeated: true } : e
      );
      const remaining = updated.filter(e => !e.defeated);

      if (remaining.length === 0) {
        setBattlePhase('victory');
        setTimeout(() => onGoToScreen(370), 2500);
      } else {
        setBattlePhase('enemySelection');
        setCurrentEnemy(null);
      }

      return updated;
    });
  };

  const handleDefeat = () => {
    onGoToScreen(999);
  };

  return (
    <>
      <VolumeControl />

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

      <Container data-screen="screen-205">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {battlePhase === 'intro' && (
              <>
                <NarrativeText>
                  Você dá um passo à frente e declara:
                  <br /><br />
                  — Vivemos em paz com as outras nações do Velho Mundo. As relações são boas, o comércio prospera e todos aprendem uns com os outros. Não há lugar para esse tipo de discurso. Ninguém ganha com a guerra. Mas você parece não se importar com o derramamento de sangue, desde que seus planos malignos sejam realizados.
                  <br /><br />
                  A expressão de surpresa do orador logo se transforma em desprezo.
                  <br /><br />
                  — Então você defende Brice...? Ou talvez seja um deles! Não precisamos de estrangeiros dizendo como devemos viver, não é mesmo, pessoal?
                  <br /><br />
                  Você percebe quatro homens de aparência ameaçadora se aproximando. Apesar das roupas esfarrapadas, é evidente que são agitadores infiltrados. Eles sacam as espadas e avançam contra você, enquanto inflamam a multidão com discursos de ódio, dando início a uma grande confusão.
                  <br /><br />
                  Você terá de enfrentá-los um de cada vez.
                </NarrativeText>

                <Box sx={{ marginTop: '24px' }}>
                  {enemies.map((enemy) => (
                    <EnemyCard
                      key={enemy.id}
                      onMouseEnter={(e) => handleEnemyHoverIntro(e, enemy)}
                      onMouseLeave={handleEnemyLeave}
                      onMouseMove={handleEnemyMoveIntro}
                      onClick={() => handleEnemyCardClick(enemy)}
                    >
                      <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={enemy.imagem}
                          alt={enemy.nome}
                          sx={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #8B4513',
                            flexShrink: 0
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{
                            color: '#8B4513',
                            fontFamily: '"Cinzel", serif',
                            fontWeight: 700,
                            marginBottom: '8px'
                          }}>
                            {enemy.nome}
                          </Typography>
                          <Typography sx={{ color: '#3d2817' }}>
                            <strong>PERÍCIA:</strong> {enemy.pericia} | <strong>FORÇA:</strong> {enemy.forca}
                          </Typography>
                        </Box>
                      </Box>
                    </EnemyCard>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  <ChoiceButton onClick={handleStartFighting}>
                    Enfrentar os agitadores
                  </ChoiceButton>
                </Box>
              </>
            )}

            {battlePhase === 'enemySelection' && (
              <>
                <NarrativeText>
                  Escolha qual agitador você deseja enfrentar agora:
                </NarrativeText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {enemies.map((enemy) => (
                    <ChoiceButton
                      key={enemy.id}
                      disabled={enemy.defeated}
                      onMouseEnter={(e) => handleEnemyHoverSelection(e, enemy)}
                      onMouseLeave={handleEnemyLeave}
                      onMouseMove={handleEnemyMoveSelection}
                      onClick={() => handleSelectEnemy(enemy)}
                    >
                      {enemy.defeated
                        ? `✓ ${enemy.nome} (Derrotado)`
                        : `Enfrentar ${enemy.nome} (PERÍCIA ${enemy.pericia} | FORÇA ${enemy.forca})`}
                    </ChoiceButton>
                  ))}
                </Box>
              </>
            )}

            {battlePhase === 'battle' && currentEnemy && (
              <BattleSystem
                key={currentEnemy.id}
                ref={battleSystemRef}
                enemy={{
                  nome: currentEnemy.nome,
                  pericia: currentEnemy.pericia,
                  forca: currentEnemy.forca,
                  imagem: currentEnemy.imagem,
                }}
                ficha={ficha}
                onUpdateFicha={stableOnUpdateFicha}
                onVictory={handleEnemyDefeated}
                onDefeat={handleDefeat}
                onGoToScreen={onGoToScreen}
              />
            )}

            {battlePhase === 'victory' && (
              <>
                <NarrativeText>
                  Você derrotou os quatro agitadores infiltrados! A confusão no Pátio dos Oradores começa a ser contida.
                  <br /><br />
                  Os guardas retomam o controle da situação...
                </NarrativeText>

                <Typography variant="h5" sx={{
                  color: '#4CAF50',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontFamily: '"Cinzel", serif',
                  marginTop: '16px',
                  animation: `${fadeIn} 0.5s ease-out`,
                }}>
                  VITÓRIA!
                </Typography>
              </>
            )}
          </CardContent>
        </CardWrap>

        {hoverImage && (
          <HoverImage
            sx={{
              left: hoverImage.x,
              top: hoverImage.y
            }}
          >
            <img src={hoverImage.src} alt="Agitador" />
          </HoverImage>
        )}

        {modalImage && (
          <ImageModal
            open={showImageModal}
            onClose={() => setShowImageModal(false)}
            imageSrc={modalImage.src}
            imageAlt={modalImage.alt}
          />
        )}
      </Container>
    </>
  );
};

export default Screen205;
