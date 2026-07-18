import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip, Typography, Button } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import guarda01Img from '../assets/images/personagens/guarda01.png';
import guarda02Img from '../assets/images/personagens/guarda02.png';

interface Screen20Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

type Guard = {
  id: 'guard1' | 'guard2';
  nome: string;
  pericia: number;
  disarmed: boolean;
};

const Screen20: React.FC<Screen20Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay, forceGroupChange } = useAudioGroup(20);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(20);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'enemySelection' | 'guardIntro' | 'battle' | 'victory'>('intro');
  const [battleKey, setBattleKey] = useState(0);
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null);
  const [guards, setGuards] = useState<Guard[]>([
    { id: 'guard1', nome: 'Primeiro Guarda', pericia: 7, disarmed: false },
    { id: 'guard2', nome: 'Segundo Guarda', pericia: 6, disarmed: false },
  ]);
  const [turnCount, setTurnCount] = useState(0);
  const turnCountRef = useRef(0);
  const lastResolvedTurnRef = useRef<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const remainingAttacks = 6 - turnCount;

  const openGuardImage = useCallback((src: string, alt: string) => {
    playClick();
    setModalImage({ src, alt });
    setShowImageModal(true);
  }, [playClick]);

  const handleStartBattle = () => {
    playClick();
    setBattlePhase('enemySelection');
  };

  const handleSelectGuard = (guard: Guard) => {
    playClick();
    setCurrentGuard(guard);
    setBattlePhase('guardIntro');
  };

  const handleStartGuardBattle = () => {
    playClick();
    forceGroupChange('battle');
    setBattlePhase('battle');

    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        setBattlePhase('guardIntro');
      }
    };

    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleTurnResolved = useCallback((turnResult: { playerPower: number; enemyPower: number; luckTestApplied?: boolean; luckTestSuccess?: boolean }) => {
    if (!currentGuard) return;
    if (typeof turnResult.playerPower !== 'number' || typeof turnResult.enemyPower !== 'number') {
      return;
    }

    // Evitar resolver duas vezes o mesmo turno (ex.: antes/depois do teste de sorte)
    const turnKey = `${turnResult.playerPower}-${turnResult.enemyPower}-${turnResult.luckTestApplied ? 1 : 0}-${turnResult.luckTestSuccess ? 1 : 0}`;
    if (turnKey === lastResolvedTurnRef.current) {
      return;
    }
    lastResolvedTurnRef.current = turnKey;

    const totalTurns = turnCountRef.current + 1;
    turnCountRef.current = totalTurns;
    setTurnCount(totalTurns);

    const bonus = turnResult.luckTestApplied && turnResult.luckTestSuccess ? 2 : 0;
    const disarm = (turnResult.playerPower + bonus) >= (turnResult.enemyPower + 3);
    setGuards(prev => {
      const next = disarm
        ? prev.map(guard => guard.id === currentGuard.id ? { ...guard, disarmed: true } : guard)
        : prev;

      const allDisarmed = next.every(guard => guard.disarmed);
      if (allDisarmed && totalTurns <= 6) {
        setBattlePhase('victory');
      } else if (totalTurns >= 6 && !allDisarmed) {
        // Tempo esgotado → prisão (não é morte por FORÇA)
        onGoToScreen(199);
      } else if (disarm) {
        setBattlePhase('enemySelection');
        setCurrentGuard(null);
        setBattleKey(prevKey => prevKey + 1);
      }

      return next;
    });
  }, [currentGuard, onGoToScreen]);

  return (
    <Container data-screen="screen-20">
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
          {battlePhase === 'victory' ? (
            <>
              <NarrativeText>
                Você desarmou os guardas e fugiu.
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => onGoToScreen(164)}>
                  Ir para o templo que você avistou
                </ChoiceButton>
              </Box>
            </>
          ) : (
            <>
              <NarrativeText>
                À sua frente estão dois guardas, e mais se aproximam. Você não quer matá-los — afinal, eles só estão cumprindo seu dever — então precisará usar toda a sua habilidade para desarmá-los.
                <br/><br/>
                Sem espadas, eles acabarão desistindo e deixando você passar. Você terá de lutar contra os dois ao mesmo tempo, mas se vencer um ataque contra o guarda que escolher, não causará dano letal (essa é a razão pela qual os guardas não têm pontos de FORÇA).
                <br/><br/>
                No entanto, se em um Combate você marcar 3 pontos ou mais acima do seu oponente, você o desarma e ele não poderá continuar lutando.
                <br/><br/>
                Os guardas causam dano à sua FORÇA normalmente sempre que acertarem um Ataque.
                <br/><br/>
                PERÍCIA
                <br/>
                • Primeiro GUARDA: 7
                <br/>
                • Segundo GUARDA: 6
              </NarrativeText>

              <Typography sx={{ marginBottom: '16px', color: theme.narrativeText.color }}>
                Ataques restantes: {remainingAttacks}
              </Typography>

              {battlePhase === 'intro' && (
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={handleStartBattle}
                    variant="contained"
                    sx={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                      color: '#FFFFFF',
                      border: '2px solid #8B4513',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      '&:focus-visible': {
                        outline: '2px solid #8B4513',
                        outlineOffset: '2px'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(179,18,18,0.8) 100%)',
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 12px 32px rgba(179,18,18,0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(0) scale(0.98)'
                      }
                    }}
                  >
                    Iniciar combate
                  </Button>
                </Box>
              )}

              {battlePhase === 'enemySelection' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  <Typography sx={{ color: theme.narrativeText.color, fontWeight: 600 }}>
                    Escolha qual guarda você tenta desarmar
                  </Typography>
                  {guards.map(guard => (
                    <ChoiceButton
                      key={guard.id}
                      onClick={() => handleSelectGuard(guard)}
                      disabled={guard.disarmed}
                    >
                      {guard.disarmed ? `${guard.nome} desarmado` : guard.nome}
                    </ChoiceButton>
                  ))}
                </Box>
              )}

              {battlePhase === 'guardIntro' && currentGuard && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', marginTop: '8px' }}>
                    <img 
                      src={currentGuard.id === 'guard1' ? guarda01Img : guarda02Img}
                      alt={currentGuard.nome}
                      style={{
                        maxWidth: '300px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: theme.hoverImage.border,
                        boxShadow: theme.hoverImage.boxShadow,
                        cursor: 'pointer',
                      }}
                      onClick={() => openGuardImage(
                        currentGuard.id === 'guard1' ? guarda01Img : guarda02Img,
                        currentGuard.nome,
                      )}
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <ChoiceButton onClick={handleStartGuardBattle}>
                      Iniciar combate
                    </ChoiceButton>
                  </Box>
                </>
              )}

              {battlePhase === 'battle' && currentGuard && (
                <BattleSystem
                  key={battleKey}
                  ref={battleSystemRef}
                  enemy={{
                    nome: currentGuard.nome,
                    pericia: currentGuard.pericia,
                    forca: 0,
                    attacksPerTurn: 1,
                    imagem: currentGuard.id === 'guard1' ? guarda01Img : guarda02Img
                  }}
                  ignoreEnemyForcaVictory
                  getTurnResultTextOverride={(turn) => {
                    if (turn.result === 'enemy_hit') {
                      return `O guarda acertou! Você perde ${turn.finalDamage ?? turn.damage} ponto${(turn.finalDamage ?? turn.damage) === 1 ? '' : 's'} de FORÇA.`;
                    }
                    if (turn.result === 'dodge') {
                      return 'Ambos desviaram!';
                    }
                    const bonus = turn.luckTestApplied && turn.luckTestSuccess ? 2 : 0;
                    const disarm = (turn.playerPower + bonus) >= (turn.enemyPower + 3);
                    return disarm
                      ? 'Você desarmou o guarda.'
                      : 'Você não conseguiu desarmar o guarda, tente novamente.';
                  }}
                  getTurnResultColorOverride={(turn) => {
                    if (turn.result === 'enemy_hit') return '#B31212';
                    if (turn.result === 'dodge') return '#FF9800';
                    const bonus = turn.luckTestApplied && turn.luckTestSuccess ? 2 : 0;
                    const disarm = (turn.playerPower + bonus) >= (turn.enemyPower + 3);
                    return disarm ? '#4CAF50' : '#B31212';
                  }}
                  luckHelpTextOverride="Teste sua sorte: se você acertou, some +2 ao ataque para desarmar; se foi atingido, reduza o dano recebido."
                  luckEffectOverride={({ success, total, type }) => {
                    if (type === 'reduction') {
                      return success
                        ? `Sorte! Dados: ${total} — Dano recebido reduzido.`
                        : `Você falhou no teste de Sorte! Dados: ${total} — Dano recebido aumentado.`;
                    }
                    return success
                      ? `Sorte! Dados: ${total} - +2 pontos no seu ataque para desarmar.`
                      : `Você falhou no teste de Sorte! Dados: ${total} - Sem bônus no desarme.`;
                  }}
                  onTurnResolved={handleTurnResolved}
                  ficha={ficha}
                  onUpdateFicha={onUpdateFicha}
                  onVictory={() => {}}
                  onDefeat={() => {}}
                  onGoToScreen={onGoToScreen}
                />
              )}
            </>
          )}
        </CardContent>
      </CardWrap>

      {modalImage && (
        <ImageModal
          open={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setModalImage(null);
          }}
          imageSrc={modalImage.src}
          imageAlt={modalImage.alt}
        />
      )}
    </Container>
  );
};

export default Screen20;
