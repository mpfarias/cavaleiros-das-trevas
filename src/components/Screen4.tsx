import React, { useState, useMemo, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Modal, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import screamSound from '../assets/sounds/male-scream.wav';

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

const DeathButton = styled(ChoiceButton)({
  background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(70,0,0,0.8) 100%)',
  borderColor: '#8B0000',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,0,0,0.9) 0%, rgba(100,0,0,0.8) 100%)',
    borderColor: '#FF0000',
  }
});

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const ModalBox = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 50%, rgba(205,133,63,0.98) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  padding: '40px',
  minWidth: '400px',
  maxWidth: '600px',
  boxShadow: `
    0 20px 60px rgba(0,0,0,0.8),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.6)
  `,
  outline: 'none'
});

interface Screen4Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen4: React.FC<Screen4Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(4);
  const playClick = useClickSound(0.2);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'cauterizing' | 'completed'>('cauterizing');
  const screamAudioRef = useRef<HTMLAudioElement | null>(null);

  // Verificar se o jogador possui a Candeia e Azeite
  const hasCandeia = useMemo(() => {
    return ficha.bolsa?.some(item => 
      item.nome?.toLowerCase().includes('candeia')
    ) || false;
  }, [ficha.bolsa]);

  // Durante a transição, manter a visualização de quem tem a candeia
  const showAsHasCandeia = hasCandeia || isTransitioning;

  // Inicializar o áudio do grito
  useMemo(() => {
    if (!screamAudioRef.current) {
      screamAudioRef.current = new Audio(screamSound);
      screamAudioRef.current.volume = 0.4;
    }
  }, []);

  const handleCauterizar = () => {
    playClick();
    
    // Ativar estado de transição para evitar mudança de texto
    setIsTransitioning(true);

    // Tocar som de grito
    if (screamAudioRef.current) {
      screamAudioRef.current.currentTime = 0;
      screamAudioRef.current.play().catch(err => console.warn('Erro ao tocar som:', err));
    }

    // Aplicar perda de 6 pontos de FORÇA
    const novaForca = Math.max(0, ficha.forca.atual - 6);
    
    // Remover a Candeia e Azeite da bolsa
    const novaBolsa = ficha.bolsa.filter(item => 
      !item.nome?.toLowerCase().includes('candeia')
    );

    const fichaAtualizada: Ficha = {
      ...ficha,
      forca: {
        ...ficha.forca,
        atual: novaForca
      },
      bolsa: novaBolsa
    };
    
    onUpdateFicha(fichaAtualizada);
    
    // Abrir modal
    setShowModal(true);
    setModalStep('cauterizing');
    
    // Após 2 segundos, mudar para o passo "completed"
    setTimeout(() => {
      setModalStep('completed');
    }, 2000);
  };

  const handleModalOk = () => {
    playClick();
    setShowModal(false);
    // Redirecionar para tela 40
    onGoToScreen(40);
  };

  const handleSemCandeia = () => {
    playClick();
    // Redirecionar para Game Over
    onGoToScreen(999);
  };

  return (
    <Container data-screen="screen-4">
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
            Mesmo após a queda do inimigo, você percebe que ele conseguiu atingi-lo com um punhal mágico, cuja maldição faz as feridas se aprofundarem cada vez mais, mesmo depois da lâmina ser retirada.
            <br/><br/>
            A dor aumenta, e você sente que a morte se aproxima lentamente.
            <br/><br/>
            Você lembra-se de um antigo remédio: cauterizar a ferida. É a única forma de deter o avanço da magia.
            <br/><br/>
            {showAsHasCandeia ? (
              <>
                Você possui uma candeia e azeite, acenda-a e pressione o vidro quente sobre a ferida.
                <br/><br/>
                O processo é atrozmente doloroso, mas você sobrevive.
              </>
            ) : (
              <>
                Infelizmente, você não possui uma candeia e azeite, e a infecção mágica se espalha.
              </>
            )}
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {showAsHasCandeia ? (
              <ChoiceButton onClick={handleCauterizar}>
                🔥 Cauterizar a ferida com a Candeia e Azeite
              </ChoiceButton>
            ) : (
              <DeathButton onClick={handleSemCandeia}>
                Sua aventura termina aqui
              </DeathButton>
            )}
          </Box>
        </CardContent>
      </CardWrap>

      {/* Modal de Cauterização */}
      <Modal
        open={showModal}
        onClose={() => {}} // Não permitir fechar clicando fora
        aria-labelledby="cauterization-modal"
        aria-describedby="cauterization-description"
      >
        <ModalBox>
          {modalStep === 'cauterizing' ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#8B4513',
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  animation: `${pulse} 1.5s ease-in-out infinite`
                }}
              >
                🔥 Cauterizando ferida...
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#3d2817',
                  fontFamily: '"Spectral", serif',
                  fontSize: '18px',
                  lineHeight: 1.6
                }}
              >
                A dor é insuportável...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#4CAF50',
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 'bold',
                  marginBottom: '24px'
                }}
              >
                ✅ Ferida cauterizada!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#F44336',
                  fontFamily: '"Spectral", serif',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '32px'
                }}
              >
                ⚔️ Você perdeu 6 pontos de FORÇA
              </Typography>
              <Button
                onClick={handleModalOk}
                variant="contained"
                sx={{
                  padding: '12px 48px',
                  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                  color: '#F5DEB3',
                  border: '2px solid #8B4513',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                    color: '#FFFFFF'
                  }
                }}
              >
                OK
              </Button>
            </Box>
          )}
        </ModalBox>
      </Modal>
    </Container>
  );
};

export default Screen4;

