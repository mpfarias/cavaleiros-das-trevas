import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
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

interface Screen126Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen126: React.FC<Screen126Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(126);
  const playClick = useClickSound(0.2);
  const provisionsLostRef = useRef(false);
  const [showProvisionsAlert, setShowProvisionsAlert] = useState(false);

  // Perder 2 Provisões quando a tela carrega (apenas uma vez)
  useEffect(() => {
    if (provisionsLostRef.current) return;
    
    provisionsLostRef.current = true;
    
    const fichaAtualizada = { ...ficha };
    const provisoesExistentes = fichaAtualizada.bolsa.find(item => 
      item.tipo === 'provisao' || item.nome?.toLowerCase().includes('provisão')
    );
    
    if (provisoesExistentes && provisoesExistentes.quantidade > 0) {
      const quantidadeAnterior = provisoesExistentes.quantidade;
      provisoesExistentes.quantidade = Math.max(0, provisoesExistentes.quantidade - 2);
      
      console.log(`🍞 [Screen126] Provisões perdidas: ${quantidadeAnterior} → ${provisoesExistentes.quantidade}`);
      
      onUpdateFicha(fichaAtualizada);
      
      // Mostrar alerta após um pequeno delay
      setTimeout(() => {
        setShowProvisionsAlert(true);
        setTimeout(() => setShowProvisionsAlert(false), 5000);
      }, 500);
    }
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-126">
      {/* Alerta de Provisões Perdidas */}
      {showProvisionsAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showProvisionsAlert}>
          🍞 -2 Provisões perdidas na viagem!
        </GameAlert>
      )}
      
      {/* Controle de Volume */}
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
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Esta com certeza não é a melhor maneira de viajar.
            <br/><br/>
            O lixo ao seu redor exala um cheiro pestilento. Pior ainda é uma substância azul-turquesa e pegajosa, que invade seus pertences e estraga duas das suas refeições — risque-as do seu Quadro de Marcações.
            <br/><br/>
            Por fim, você alcança a Porta Leste, após uma viagem atribulada e cheia de obstáculos.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { 
              playClick(); 
              // Marcar que o jogador está vindo do carrinho de lixo
              localStorage.setItem('cavaleiro:noCarrinhoLixo', 'true');
              onGoToScreen(301); 
            }}>
              Seguir para Porta Leste
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen126;
