import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { GameAlert } from './ui/GameAlert';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DiceRollModal3D from './ui/DiceRollModal3D';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #3d2817 25%, #2c1810 50%, #1a0f0a 75%, #0d0503 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,50,0.2) 0%, transparent 50%)
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

interface Screen57Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen57: React.FC<Screen57Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(57);
  const playClick = useClickSound(0.2);
  
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [moedasPerdidas, setMoedasPerdidas] = useState(0);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceComplete, setDiceComplete] = useState(false);
  const [forceLost, setForceLost] = useState(0);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [survived, setSurvived] = useState(false);
  const appliedRef = useRef(false);

  // Mostrar alerta de moedas perdidas ao carregar a tela
  useEffect(() => {
    try {
      const moedasUsadas = localStorage.getItem('cavaleiro:moedasUsadas225');
      if (moedasUsadas) {
        const valor = parseInt(moedasUsadas);
        setMoedasPerdidas(valor);
        setTimeout(() => {
          setShowMoneyAlert(true);
          setTimeout(() => setShowMoneyAlert(false), 5000);
        }, 500);
        // Limpar após mostrar
        localStorage.removeItem('cavaleiro:moedasUsadas225');
      }
    } catch (error) {
      console.error('❌ [Screen57] Erro ao ler moedas usadas:', error);
    }
  }, []);

  const handleCallGuards = () => {
    playClick();
    onGoToScreen(199);
  };

  const handleTryEscape = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceComplete = (dice: number[], _total: number) => {
    const diceResult = dice[0]; // Resultado do dado (1 a 6)
    setShowDiceModal(false);
    setDiceComplete(true);

    if (!ficha || appliedRef.current) return;
    appliedRef.current = true;

    // Ler ficha atualizada do localStorage
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

    // Subtrair resultado do dado da FORÇA atual
    const forcaAnterior = fichaAtualizada.forca.atual;
    const novaForca = Math.max(0, forcaAnterior - diceResult);
    
    fichaAtualizada.forca.atual = novaForca;
    setForceLost(diceResult);
    
    // Atualizar ficha
    onUpdateFicha(fichaAtualizada);

    // Mostrar alerta de perda de FORÇA
    setTimeout(() => {
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), 4000);
    }, 500);

    // Verificar se sobreviveu
    if (novaForca > 0) {
      setSurvived(true);
    } else {
      // FORÇA zerou, Game Over
      setTimeout(() => {
        onGoToScreen(999);
      }, 2000);
    }
  };

  return (
    <Container data-screen="screen-57">
      <VolumeControl />

      {/* Alerta de perda de moedas */}
      {showMoneyAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showMoneyAlert}>
          💰 Você perdeu {moedasPerdidas} moeda{moedasPerdidas !== 1 ? 's' : ''} de ouro!
        </GameAlert>
      )}

      {/* Alerta de perda de FORÇA */}
      {showForceAlert && (
        <GameAlert sx={{ top: diceComplete ? '180px' : '120px' }} $isVisible={showForceAlert}>
          Você perdeu {forceLost} ponto{forceLost !== 1 ? 's' : ''} de FORÇA!
        </GameAlert>
      )}

      {currentGroup && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => { playClick(); togglePlay?.(); }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <DiceRollModal3D
        open={showDiceModal}
        numDice={1}
        onComplete={handleDiceComplete}
        bonus={0}
      />

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            A multidão reage bem ao seu truque. Tão bem que você acaba sendo espremido no meio daquela gente gananciosa. Os guardas correm para tentar conter o tumulto que se forma.
            <br/><br/>
            Se quiser, você pode chamá-los e se entregar. Caso contrário, terá de tentar escapar por entre as mãos que tentam agarrá-lo (essa opção te faz perder pontos de FORÇA).
          </NarrativeText>

          {!diceComplete && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ChoiceButton onClick={handleCallGuards}>
                Chamar os guardas
              </ChoiceButton>
              <ChoiceButton onClick={handleTryEscape}>
                Tentar escapar
              </ChoiceButton>
            </Box>
          )}

          {diceComplete && survived && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(164);
              }}>
                Fugir pelo gramado de um pequeno templo, cercado por um muro baixo
              </ChoiceButton>

              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(118);
              }}>
                Se enfiar por uma rua estreita
              </ChoiceButton>
            </Box>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen57;
