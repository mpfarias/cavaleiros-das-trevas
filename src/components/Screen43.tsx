
import { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { GameAlert } from './ui/GameAlert';
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
  textShadow: '1px 1px 2px rgba(245,222,179,0.8)'
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

// Estilo para os alertas de perda


interface Screen43Props {
  onGoToScreen: (id: number) => void;
  ficha: Ficha;
}

const Screen43: React.FC<Screen43Props> = ({ onGoToScreen, ficha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'bartolph-game'
  const { isPlaying, togglePlay, currentTrack } = useAudioGroup(43);
  
  // Estado para controlar o alerta de perda
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [moedasPerdidas, setMoedasPerdidas] = useState(0);
  
  // Ref para garantir que o alerta seja mostrado apenas uma vez
  const alertShownRef = useRef(false);

  // Calcular moedas perdidas e mostrar alerta automaticamente quando a tela carrega
  useEffect(() => {
    // Calcular moedas perdidas baseado na aposta anterior
    try {
      const apostaAnterior = localStorage.getItem('cavaleiro:apostaBartolph');
      if (apostaAnterior) {
        const valorApostado = parseInt(apostaAnterior);
        setMoedasPerdidas(valorApostado);
        console.log(`💰 [Screen43] Jogador perdeu ${valorApostado} moedas na aposta`);
        
        // Marcar que veio da tela 43 para suprimir alert em Screen140
        localStorage.setItem('cavaleiro:veioDaTela43', 'true');
        
        // Mostrar alerta com delay e ocultar após 5 segundos
        setTimeout(() => {
          setShowMoneyAlert(true);
          // Ocultar após 5 segundos
          setTimeout(() => setShowMoneyAlert(false), 5000);
        }, 500);
      }
    } catch (error) {
      console.error('❌ [Screen43] Erro ao ler aposta anterior:', error);
    }
  }, []);

  return (
    <Container data-screen="screen-43">
      {/* Alerta de perda de dinheiro */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showMoneyAlert}>
        💰 {moedasPerdidas > 0 ? `${moedasPerdidas} moedas perdidas na aposta!` : 'Moedas perdidas na aposta!'}
      </GameAlert>

      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'fixed', // Mudado de 'absolute' para 'fixed' para ficar sempre visível
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentTrack ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={togglePlay}
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
            — Ha! Ha! Ha! Não é o seu dia de sorte, não é mesmo? — Bartolph esboça um sorriso condescendente,
            estendendo a mão para pegar sua aposta.
          </NarrativeText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => onGoToScreen(151)}>
              Deixar Bartolph levar o ouro
            </ChoiceButton>
            <ChoiceButton onClick={() => {
              // Marcar que veio da tela 43 para suprimir alert de moedas na tela 140
              try {
                localStorage.setItem('cavaleiro:veioDaTela43', 'true');
                console.log('🔗 [Screen43] Marcado: jogador veio da tela 43 para tela 140');
              } catch (error) {
                console.error('❌ [Screen43] Erro ao marcar origem:', error);
              }
              onGoToScreen(140);
            }}>
              Segurar o pulso dele e acusá-lo de trapaça
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen43;


