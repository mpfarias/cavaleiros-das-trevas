import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

interface Screen392Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

type Guard = {
  id: 'guard1';
  nome: string;
  pericia: number;
  disarmed: boolean;
};

const MAX_ATTACKS = 4;

const Screen392: React.FC<Screen392Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(392);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(392);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'guardIntro' | 'battle' | 'victory' | 'defeat'>('intro');
  const [battleKey, setBattleKey] = useState(0);
  const [guard] = useState<Guard>({
    id: 'guard1',
    nome: 'Guarda',
    pericia: 8,
    disarmed: false,
  });
  const [turnCount, setTurnCount] = useState(0);
  const turnCountRef = useRef(0);
  const lastResolvedTurnRef = useRef<string | null>(null);
  const [defeatMessageShown, setDefeatMessageShown] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const remainingAttacks = MAX_ATTACKS - turnCount;

  useEffect(() => {
    if (battlePhase === 'defeat' && defeatMessageShown) {
      const timer = setTimeout(() => {
        onGoToScreen(199);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [battlePhase, defeatMessageShown, onGoToScreen]);

  const handleStartBattle = () => {
    playClick();
    setBattlePhase('guardIntro');
  };

  const handleStartGuardBattle = () => {
    playClick();
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
    if (typeof turnResult.playerPower !== 'number' || typeof turnResult.enemyPower !== 'number') {
      return;
    }

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

    if (disarm) {
      setBattlePhase('victory');
    } else if (totalTurns >= MAX_ATTACKS) {
      setDefeatMessageShown(true);
      setBattlePhase('defeat');
    }
  }, []);

  return (
    <Container data-screen="screen-392">
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
                Você desarmou o guarda. Você vai precisar montar no cavalo - BOA SORTE!
              </NarrativeText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ChoiceButton onClick={() => { playClick(); onGoToScreen(100); }}>
                  Saltar para o cavalo
                </ChoiceButton>
              </Box>
            </>
          ) : battlePhase === 'defeat' ? (
            <NarrativeText sx={{ color: '#B31212', fontWeight: 700 }}>
              Você não conseguiu derrotar o guarda em 4 ataques, você foi PRESO!
            </NarrativeText>
          ) : (
            <>
              <NarrativeText>
                Você decide enfrentar o guarda. Ele avança em sua direção com a espada em riste.
                <br/><br/>
                Você não quer matá-lo — afinal, ele só está cumprindo seu dever — então precisará usar toda a sua habilidade para desarmá-lo.
                <br/><br/>
                Se em um Combate você marcar 3 pontos ou mais acima do seu oponente, você o desarma e ele não poderá continuar lutando.
                <br/><br/>
                O guarda causa dano à sua FORÇA normalmente sempre que acertar um Ataque.
                <br/><br/>
                Você tem no máximo {MAX_ATTACKS} ataques para desarmá-lo. Se não conseguir, será preso.
                <br/><br/>
                PERÍCIA do GUARDA: {guard.pericia}
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

              {battlePhase === 'guardIntro' && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', marginTop: '8px' }}>
                    <img
                      src={guarda01Img}
                      alt={guard.nome}
                      style={{
                        maxWidth: '300px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: theme.hoverImage.border,
                        boxShadow: theme.hoverImage.boxShadow,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        playClick();
                        setShowImageModal(true);
                      }}
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <ChoiceButton onClick={handleStartGuardBattle}>
                      Iniciar combate
                    </ChoiceButton>
                  </Box>
                </>
              )}

              {battlePhase === 'battle' && (
                <BattleSystem
                  key={battleKey}
                  ref={battleSystemRef}
                  enemy={{
                    nome: guard.nome,
                    pericia: guard.pericia,
                    forca: 0,
                    attacksPerTurn: 1,
                    imagem: guarda01Img
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

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={guarda01Img}
        imageAlt={guard.nome}
      />
    </Container>
  );
};

export default Screen392;
