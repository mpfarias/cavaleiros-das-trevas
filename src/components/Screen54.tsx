
import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useEffect, useState, useRef, useCallback } from 'react';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import type { Ficha } from '../types';
import bartolphImg from '../assets/images/personagens/bartolph.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

const LocationLink = styled('span')({
  color: '#8B4513',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#A0522D'
  }
});

interface Screen54Props {
  onGoToScreen: (id: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen54: React.FC<Screen54Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'bartolph-game'
  const { isPlaying, togglePlay, currentTrack } = useAudioGroup(54);
  const playClick = useClickSound(0.2);
  
  // Estado para controlar se as moedas já foram perdidas
  const [moedasPerdidas, setMoedasPerdidas] = useState(false);
  
  // Estado para controlar o modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState(false);

  // Estado para controlar o alert de moedas ganhas
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [moedasGanhas, setMoedasGanhas] = useState(0);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Ref para garantir que o alerta seja mostrado apenas uma vez
  const alertShownRef = useRef(false);

  // Handlers para Bartolph
  const handleBartolphHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: bartolphImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleBartolphLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleBartolphMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleBartolphClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);
  
  // Calcular moedas atuais
  const currentGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);
  
  useEffect(() => {
    // Verificar se o jogador veio da tela 86 (Bartolph) e ganhou
    try {
      const apostaAnterior = localStorage.getItem('cavaleiro:apostaBartolph');
      if (apostaAnterior && !alertShownRef.current) {
        const valorApostado = parseInt(apostaAnterior);
        setMoedasGanhas(valorApostado);
        
        // Mostrar alerta com delay e ocultar após 5 segundos
        setTimeout(() => {
          setShowMoneyAlert(true);
          // Ocultar após 5 segundos
          setTimeout(() => setShowMoneyAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
        }, 500);
        
        // Marcar que o alerta já foi mostrado
        alertShownRef.current = true;
      }
    } catch (error) {
      console.error('❌ [Screen54] Erro ao ler aposta anterior:', error);
    }
  }, []);

  const perderMoedas = () => {
    if (moedasPerdidas) return; // Evita perder moedas múltiplas vezes
    
    // Encontrar o item de ouro na bolsa
    const ouroIndex = ficha.bolsa.findIndex(item => item.tipo === 'ouro');
    
    if (ouroIndex !== -1) {
      const novaFicha = { ...ficha };
      
      // Tentar recuperar o valor da aposta do localStorage
      const apostaAnterior = localStorage.getItem('cavaleiro:apostaBartolph');
      const valorApostado = apostaAnterior ? parseInt(apostaAnterior) : 0;
      
      // Se não conseguir recuperar a aposta, estimar baseado no ouro atual
      let moedasParaPerder = 0;
      if (valorApostado > 0) {
        // Perde as moedas que ganhou (valorApostado) + as que eram suas (valorApostado)
        moedasParaPerder = valorApostado * 2;
      } else {
        // Estimativa: perde metade do ouro atual
        moedasParaPerder = Math.floor(currentGold / 2);
      }
      
      // Garantir que não perca mais do que tem
      moedasParaPerder = Math.min(moedasParaPerder, currentGold);
      
      novaFicha.bolsa[ouroIndex].quantidade = Math.max(0, currentGold - moedasParaPerder);
      
      onUpdateFicha(novaFicha);
      setMoedasPerdidas(true);
      
      // Limpar a aposta do localStorage
      localStorage.removeItem('cavaleiro:apostaBartolph');
      
    }
  };
  
  // Função para ir embora (mostra modal de confirmação)
  const handleIrEmbora = () => {
    setModalConfirmacao(true);
  };
  
  // Função para confirmar ir embora (perde moedas)
  const confirmarIrEmbora = () => {
    perderMoedas();
    setModalConfirmacao(false);
    onGoToScreen(30);
  };
  
  // Função para cancelar ir embora
  const cancelarIrEmbora = () => {
    setModalConfirmacao(false);
  };
  
  // Função para acusar Bartolph (mantém moedas)
  const handleAcusar = () => {
    onGoToScreen(115);
  };

  return (
    <Container data-screen="screen-54">
      {/* Controle de Volume */}
      <VolumeControl />
      {/* Alerta de moedas ganhas na aposta */}
      <GameAlert sx={{ top: '120px' }} visible={showMoneyAlert} onClose={() => setShowMoneyAlert(false)}>
        💰 {moedasGanhas} moedas ganhas na aposta!
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
          <span>
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
          </span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Seu sorriso se transforma em um olhar surpreso ao ver o dado girar inesperadamente e marcar 1.
            <br /><br />
            — Lamento — diz <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink>, agarrando seu ouro. É óbvio que o dado está viciado e que ele é um trapaceiro!
          </NarrativeText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={handleAcusar}>Acusar <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink> de trapaça</ChoiceButton>
            <ChoiceButton onClick={handleIrEmbora}>Evitar confusão e ir embora</ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Modal de confirmação */}
      <Dialog 
        open={modalConfirmacao} 
        onClose={cancelarIrEmbora} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: `
              linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 50%, rgba(205,133,63,0.98) 100%)
            `,
            border: '3px solid #8B4513',
            borderRadius: '16px',
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.7),
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 0 0 1px rgba(139,69,19,0.4)
            `,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          color: '#B31212',
          fontFamily: '"Cinzel", serif',
          fontWeight: '700',
          fontSize: '20px',
          padding: '24px 24px 16px 24px',
          textShadow: '0 1px 2px rgba(245,222,179,0.8)',
          borderBottom: '2px solid rgba(139,69,19,0.3)'
        }}>
          ⚠️ ATENÇÃO: Perda de Moedas
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Typography sx={{ 
            fontSize: '16px', 
            lineHeight: 1.6, 
            textAlign: 'center',
            fontFamily: '"Spectral", serif',
            color: '#3d2817',
            textShadow: '0 1px 2px rgba(245,222,179,0.8)'
          }}>
            {(() => {
              const apostaAnterior = localStorage.getItem('cavaleiro:apostaBartolph');
              const valorApostado = apostaAnterior ? parseInt(apostaAnterior) : 0;
              
              if (valorApostado > 0) {
                return (
                  <>
                    <strong>Você tem certeza que deseja ir embora?</strong>
                    <br /><br />
                    Na aposta anterior, você apostou <strong>{valorApostado} moedas</strong> e ganhou.
                    <br /><br />
                    Se escolher ir embora, Bartolph ficará com <strong>{valorApostado * 2} moedas</strong>:
                    <br />
                    • {valorApostado} moedas que você ganhou
                    <br />
                    • {valorApostado} moedas que eram suas
                    <br /><br />
                    <strong style={{ color: '#B31212' }}>
                      Você perderá {valorApostado * 2} moedas no total!
                    </strong>
                  </>
                );
              } else {
                return (
                  <>
                    <strong>Você tem certeza que deseja ir embora?</strong>
                    <br /><br />
                    Se escolher ir embora, Bartolph ficará com suas moedas.
                    <br /><br />
                    <strong style={{ color: '#B31212' }}>
                      Você perderá todas as suas moedas!
                    </strong>
                  </>
                );
              }
            })()}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          padding: '20px 24px 24px 24px',
          gap: '16px'
        }}>
          <Button 
            onClick={cancelarIrEmbora} 
            variant="outlined"
            sx={{
              padding: '12px 24px',
              border: '2px solid #8B4513',
              borderRadius: '12px',
              color: '#8B4513',
              fontSize: '16px',
              fontFamily: '"Cinzel", serif',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#654321',
                backgroundColor: 'rgba(139,69,19,0.1)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmarIrEmbora} 
            variant="contained"
            sx={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
              border: '2px solid #8B0000',
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: '"Cinzel", serif',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(105,0,0,0.8) 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }
            }}
          >
            Ir Embora (Perder Moedas)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={bartolphImg}
        imageAlt="Bartolph"
      />
    </Container>
  );
};

export default Screen54;

