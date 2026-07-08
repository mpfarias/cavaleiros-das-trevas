import React, { useMemo, useState, useCallback } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen211Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onAdjustSorte: (delta: number) => void;
}

type ScreenState = 'luck-test' | 'success' | 'damage-count' | 'damage-rolling' | 'game-over';

const Screen211: React.FC<Screen211Props> = ({ onGoToScreen, ficha, onUpdateFicha, onAdjustSorte }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(211);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(211);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [screenState, setScreenState] = useState<ScreenState>('luck-test');
  const [showLuckDiceModal, setShowLuckDiceModal] = useState(false);
  const [showDamageCountModal, setShowDamageCountModal] = useState(false);
  const [showDamageRollModal, setShowDamageRollModal] = useState(false);
  const [luckResult, setLuckResult] = useState<number | null>(null);
  const [damageCount, setDamageCount] = useState(0);
  const [currentDamageIndex, setCurrentDamageIndex] = useState(0);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [forceLost, setForceLost] = useState(0);

  const handleLuckTest = () => {
    playClick();
    setShowLuckDiceModal(true);
  };

  const handleLuckDiceComplete = useCallback((dice: number[], total: number) => {
    setShowLuckDiceModal(false);
    setLuckResult(total);
    
    const sorteAtual = ficha.sorte.atual;
    const hasLuck = total <= sorteAtual;
    
    // Reduzir 1 ponto de sorte
    onAdjustSorte(-1);

    if (hasLuck) {
      // Teve sorte - mostrar opções
      setScreenState('success');
    } else {
      // Não teve sorte - precisa rolar para quantidade de ferimentos
      setScreenState('damage-count');
      setShowDamageCountModal(true);
    }
  }, [ficha.sorte.atual, onAdjustSorte]);

  const handleDamageCountComplete = useCallback((dice: number[], total: number) => {
    setShowDamageCountModal(false);
    const count = dice[0]; // Resultado de 1 dado (1 a 6)
    setDamageCount(count);
    setCurrentDamageIndex(0);
    
    if (count === 0) {
      // Nenhum ferimento, pode continuar
      setScreenState('success');
    } else {
      // Começar a processar ferimentos
      setScreenState('damage-rolling');
      setShowDamageRollModal(true);
    }
  }, []);

  const handleDamageRollComplete = useCallback((dice: number[], total: number) => {
    setShowDamageRollModal(false);
    
    const damage = dice[0]; // Resultado de 1 dado (1 a 6)
    
    // Ler ficha atualizada do localStorage para ter a FORÇA mais recente
    let fichaAtualizada: Ficha;
    try {
      const saved = localStorage.getItem('cavaleiro:ficha');
      if (saved) {
        fichaAtualizada = JSON.parse(saved);
      } else {
        fichaAtualizada = { ...ficha };
      }
    } catch (e) {
      fichaAtualizada = { ...ficha };
    }

    const forcaAnterior = fichaAtualizada.forca.atual;
    const novaForca = Math.max(0, forcaAnterior - damage);
    
    fichaAtualizada.forca.atual = novaForca;
    setForceLost(damage);
    
    // Atualizar ficha
    onUpdateFicha(fichaAtualizada);

    // Mostrar alerta de perda de FORÇA
    setTimeout(() => {
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }, 500);

    // Verificar se sobreviveu
    if (novaForca <= 0) {
      // FORÇA zerou, Game Over
      setTimeout(() => {
        onGoToScreen(999);
      }, 2000);
      return;
    }

    // Verificar se há mais ferimentos para processar
    const nextIndex = currentDamageIndex + 1;
    if (nextIndex < damageCount) {
      // Ainda há mais ferimentos
      setCurrentDamageIndex(nextIndex);
      setTimeout(() => {
        setShowDamageRollModal(true);
      }, 1500);
    } else {
      // Todos os ferimentos processados, mostrar opções
      setScreenState('success');
    }
  }, [currentDamageIndex, damageCount, ficha, onUpdateFicha, onGoToScreen]);

  const renderContent = () => {
    if (screenState === 'luck-test') {
      return (
        <>
          <NarrativeText>
            Mal você pega no objeto, ele se abre com um estalo e, dos lados, saltam lâminas, facas e espigões. Teste a sua SORTE.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <Button variant="contained" onClick={handleLuckTest} sx={{
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
                boxShadow: theme.choiceButton.hoverBoxShadow
              }
            }}>
              Testar a Sorte (2d6)
            </Button>
            <Typography variant="caption" sx={{ color: theme.narrativeText.color }}>
              A SORTE atual é {ficha.sorte.atual}. Você perderá 1 ponto ao testar.
            </Typography>
          </Box>
        </>
      );
    }

    if (screenState === 'success') {
      return (
        <>
          <NarrativeText>
            Você consegue largar a esfera antes de se machucar.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(375);
            }}>
              Mergulhe no buraco de esgoto
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(22);
            }}>
              Continue pela rua
            </ChoiceButton>
          </Box>
        </>
      );
    }

    // Estados de dano não mostram conteúdo (já estão processando)
    return null;
  };

  return (
    <Container data-screen="screen-211">
      {/* Alerta de perda de FORÇA */}
      <GameAlert sx={{ top: '120px' }} visible={showForceAlert} onClose={() => setShowForceAlert(false)}>
        ⚔️ Você perdeu {forceLost} ponto(s) de FORÇA!
      </GameAlert>

      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <span><IconButton
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
          </IconButton></span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {renderContent()}
        </CardContent>
      </CardWrap>

      {/* Modal de teste de sorte */}
      <DiceRollModal3D
        open={showLuckDiceModal}
        onComplete={handleLuckDiceComplete}
        numDice={2}
        bonus={0}
      />

      {/* Modal para quantidade de ferimentos */}
      <DiceRollModal3D
        open={showDamageCountModal}
        onComplete={handleDamageCountComplete}
        numDice={1}
        bonus={0}
      />

      {/* Modal para cada ferimento */}
      <DiceRollModal3D
        open={showDamageRollModal}
        onComplete={handleDamageRollComplete}
        numDice={1}
        bonus={0}
      />
    </Container>
  );
};

export default Screen211;

