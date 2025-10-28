import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import DiceRollModal3D from './ui/DiceRollModal3D';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
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

interface Screen243Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen243: React.FC<Screen243Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(243);
  const playClick = useClickSound(0.2);
  const [showGoldAlert, setShowGoldAlert] = useState(false);
  const [goldAdded, setGoldAdded] = useState(false);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testPassed, setTestPassed] = useState(false);

  const periciaAtual = ficha.pericia.atual;

  // Adicionar 1 moeda de ouro quando a tela carregar
  useEffect(() => {
    if (!goldAdded) {
      const fichaAtualizada: Ficha = {
        ...ficha,
        bolsa: [
          ...ficha.bolsa,
          {
            id: `ouro_bartolph_${Date.now()}`,
            nome: 'Moedas de Ouro',
            tipo: 'ouro',
            quantidade: 1,
            descricao: 'Moeda encontrada no corpo de Bartolph',
            adquiridoEm: 'Revistar corpo de Bartolph'
          }
        ]
      };
      
      onUpdateFicha(fichaAtualizada);
      setGoldAdded(true);
      
      // Mostrar alert de ouro
      setShowGoldAlert(true);
      setTimeout(() => setShowGoldAlert(false), 3000);
    }
  }, [goldAdded, ficha, onUpdateFicha]);

  const testarPericia = () => {
    playClick();
    setDiceModalOpen(true);
  };

  const handleDiceComplete = (_dice: number[], total: number) => {
    setDiceModalOpen(false);
    
    const passou = total <= periciaAtual;
    setTestPassed(passou);
    setTestComplete(true);

    // Se não passou, redireciona para tela 199
    if (!passou) {
      setTimeout(() => {
        onGoToScreen(199);
      }, 4000);
    }
  };

  return (
    <Container data-screen="screen-243">
      {/* Alert de ouro ganho */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showGoldAlert}>
        💰 Você ganhou 1 Moeda de Ouro!
      </GameAlert>

      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de Música */}
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
          <NarrativeText>
            O fruto da sua busca no corpo do patife é 1 Moeda de Ouro — a magra quantia que Bartolph provavelmente pagou para que o matassem.
            <br/><br/>
            Você guarda a moeda, mas não há tempo a perder: os guardas já estão se aproximando e logo atiram uma rede pesada em sua direção.
            <br/><br/>
            Você precisa desviar!
            {!testComplete && (
              <>
                <br/><br/>
                <strong>Teste sua Perícia.</strong>
              </>
            )}
          </NarrativeText>

          {!testComplete && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
              <Button variant="contained" onClick={testarPericia} sx={{
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                border: '1px solid #D2B48C',
                fontFamily: '"Cinzel", serif',
                fontWeight: 700
              }}>
                Testar a Perícia (2d6)
              </Button>
              <Typography variant="caption" sx={{ color: '#3d2817' }}>
                A PERÍCIA atual é {periciaAtual}. Você não perderá pontos ao testar.
              </Typography>
            </Box>
          )}

          {testComplete && testPassed && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <Typography sx={{ 
                color: '#2E7D32', 
                fontWeight: 700, 
                textAlign: 'center',
                fontFamily: '"Cinzel", serif',
                fontSize: '18px',
                marginBottom: '16px'
              }}>
                ✅ Você conseguiu desviar da rede!
              </Typography>

              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(360);
              }}>
                Fugir pela rua
              </ChoiceButton>

              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(262);
              }}>
                Se enfiar em um beco estreito
              </ChoiceButton>
            </Box>
          )}

          {testComplete && !testPassed && (
            <Typography sx={{ 
              color: '#D32F2F', 
              fontWeight: 700, 
              textAlign: 'center',
              fontFamily: '"Cinzel", serif',
              fontSize: '18px',
              marginTop: '16px'
            }}>
              ❌ Você falhou no teste, você foi preso!
            </Typography>
          )}

          <DiceRollModal3D
            open={diceModalOpen}
            onClose={() => setDiceModalOpen(false)}
            numDice={2}
            onComplete={handleDiceComplete}
            bonus={0}
          />
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen243;

