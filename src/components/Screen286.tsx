import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import BattleSystem from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import bartolphImg from '../assets/images/personagens/bartolph.png';
import capanga1Img from '../assets/images/personagens/capanga01.png';
import capanga2Img from '../assets/images/personagens/capanga02.png';

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
  imagem?: string;
}

interface Screen286Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen286: React.FC<Screen286Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const playClick = useClickSound(0.2);
  
  const [battlePhase, setBattlePhase] = useState<'intro' | 'enemySelection' | 'battle' | 'victory'>('intro');
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const battleSystemRef = useRef<any>(null);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);

  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 'bartolph', nome: 'Bartolph', pericia: 6, forca: 7, defeated: false, imagem: bartolphImg },
    { id: 'capanga1', nome: 'Primeiro Capanga', pericia: 7, forca: 6, defeated: false, imagem: capanga1Img },
    { id: 'capanga2', nome: 'Segundo Capanga', pericia: 5, forca: 7, defeated: false, imagem: capanga2Img }
  ]);

  const stableOnUpdateFicha = useCallback((updatedFicha: any) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  // ========================================
  // HOVER PARA FASE INTRO (Cards dos inimigos)
  // ========================================
  const handleEnemyHoverIntro = useCallback((event: React.MouseEvent, enemy: Enemy) => {
    if (enemy.imagem) {
      setHoverImage({
        src: enemy.imagem,
        x: event.clientX - 1,    // 🎯 AJUSTE AQUI para fase INTRO
        y: event.clientY - 20    // 🎯 AJUSTE AQUI para fase INTRO
      });
    }
  }, []);

  const handleEnemyMoveIntro = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX - 280,    // 🎯 AJUSTE AQUI para fase INTRO
      y: event.clientY - 380     // 🎯 AJUSTE AQUI para fase INTRO
    } : null);
  }, []);

  // ========================================
  // HOVER PARA FASE SELEÇÃO (Botões de escolha)
  // ========================================
  const handleEnemyHoverSelection = useCallback((event: React.MouseEvent, enemy: Enemy) => {
    if (enemy.imagem) {
      setHoverImage({
        src: enemy.imagem,
        x: event.clientX - 1,    // 🎯 AJUSTE AQUI para fase SELEÇÃO
        y: event.clientY - 20    // 🎯 AJUSTE AQUI para fase SELEÇÃO
      });
    }
  }, []);

  const handleEnemyMoveSelection = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 10,    // 🎯 AJUSTE AQUI para fase SELEÇÃO
      y: event.clientY + 10     // 🎯 AJUSTE AQUI para fase SELEÇÃO
    } : null);
  }, []);

  // Função comum para sair do hover
  const handleEnemyLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  // Inicializar áudio de batalha
  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('Erro ao inicializar áudio de batalha:', error);
      }
    };
    
    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const handleStartFighting = () => {
    setBattlePhase('enemySelection');
  };

  const handleSelectEnemy = (enemy: Enemy) => {
    setCurrentEnemy(enemy);
    setBattlePhase('battle');
    
    // Esperar o BattleSystem carregar
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

    // Marcar inimigo como derrotado
    setEnemies(prev => prev.map(e => 
      e.id === currentEnemy.id ? { ...e, defeated: true } : e
    ));

    // Verificar se todos foram derrotados
    const remainingEnemies = enemies.filter(e => e.id !== currentEnemy.id && !e.defeated);
    
    if (remainingEnemies.length === 0) {
      // Todos derrotados - vitória final
      setBattlePhase('victory');
    } else {
      // Ainda há inimigos - voltar para seleção
      setBattlePhase('enemySelection');
      setCurrentEnemy(null);
    }
  };

  const handleDefeat = () => {
    // Jogador morreu - navegar para Game Over
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

      <Container data-screen="screen-286">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            {battlePhase === 'intro' && (
              <>
                <NarrativeText>
                  De repente, uma mão cruel agarra você e o puxa para dentro de um beco estreito e sombrio.
                  <br/><br/>
                  À sua frente está Bartolph, o jogador, acompanhado por dois capangas. Um deles bloqueia a saída, impedindo qualquer fuga.
                  <br/><br/>
                  Bartolph exibe hematomas e cortes evidentes — marcas deixadas, sem dúvida, pelo dono do Primeiro Passo.
                  <br/><br/>
                  Ele sorri com desdém e diz:
                  <br/><br/>
                  "Vamos ver se é bom mesmo, herói!"
                  <br/><br/>
                  Você se prepara para o confronto. Terá de enfrentá-los todos ao mesmo tempo.
                </NarrativeText>

                <Box sx={{ marginTop: '24px' }}>
                  {enemies.map((enemy) => (
                    <EnemyCard 
                      key={enemy.id}
                      onMouseEnter={(e) => handleEnemyHoverIntro(e, enemy)}
                      onMouseLeave={handleEnemyLeave}
                      onMouseMove={handleEnemyMoveIntro}
                    >
                      <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {enemy.imagem && (
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
                        )}
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
                  <ChoiceButton onClick={() => {
                    playClick();
                    handleStartFighting();
                  }}>
                    Enfrentar os bandidos
                  </ChoiceButton>
                </Box>
              </>
            )}

            {battlePhase === 'enemySelection' && (
              <>
                <NarrativeText>
                  Escolha qual inimigo você deseja enfrentar agora:
                </NarrativeText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {enemies.map((enemy) => (
                    <ChoiceButton 
                      key={enemy.id}
                      disabled={enemy.defeated}
                      onMouseEnter={(e) => handleEnemyHoverSelection(e, enemy)}
                      onMouseLeave={handleEnemyLeave}
                      onMouseMove={handleEnemyMoveSelection}
                      onClick={() => {
                        playClick();
                        handleSelectEnemy(enemy);
                      }}
                    >
                      {enemy.defeated ? `✓ ${enemy.nome} (Derrotado)` : `Enfrentar ${enemy.nome} (PERÍCIA ${enemy.pericia} | FORÇA ${enemy.forca})`}
                    </ChoiceButton>
                  ))}
                </Box>
              </>
            )}

            {battlePhase === 'battle' && currentEnemy && (
              <BattleSystem
                enemy={{
                  nome: currentEnemy.nome,
                  pericia: currentEnemy.pericia,
                  forca: currentEnemy.forca,
                  imagem: currentEnemy.imagem || undefined
                } as any}
                ficha={ficha}
                onUpdateFicha={stableOnUpdateFicha}
                onVictory={handleEnemyDefeated}
                onDefeat={handleDefeat}
                onGoToScreen={onGoToScreen}
                ref={battleSystemRef}
              />
            )}

            {battlePhase === 'victory' && (
              <>
                <NarrativeText>
                  Você derrotou todos os três bandidos! Os corpos de Bartolph e seus capangas jazem no chão do beco. 
                  <br/><br/>
                  O que você deseja fazer agora?
                </NarrativeText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <ChoiceButton onClick={() => {
                    playClick();
                    onGoToScreen(243);
                  }}>
                    Revistar os corpos
                  </ChoiceButton>

                  <ChoiceButton onClick={() => {
                    playClick();
                    onGoToScreen(360);
                  }}>
                    Sair do beco e fugir pela rua
                  </ChoiceButton>

                  <ChoiceButton onClick={() => {
                    playClick();
                    onGoToScreen(262);
                  }}>
                    Procurar um esconderijo no beco
                  </ChoiceButton>
                </Box>
              </>
            )}
          </CardContent>
        </CardWrap>

        {/* Imagem de hover */}
        {hoverImage && (
          <HoverImage
            sx={{
              left: hoverImage.x,
              top: hoverImage.y
            }}
          >
            <img src={hoverImage.src} alt="Inimigo" />
          </HoverImage>
        )}
      </Container>
    </>
  );
};

export default Screen286;

