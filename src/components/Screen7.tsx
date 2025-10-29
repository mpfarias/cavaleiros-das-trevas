import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { GameAlert } from './ui/GameAlert';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #0d0d0d 75%, #000000 100%),
    radial-gradient(circle at 30% 30%, rgba(70,70,80,0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,60,0.2) 0%, transparent 50%)
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

interface Screen7Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen7: React.FC<Screen7Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(7);
  const playClick = useClickSound(0.2);
  
  // Estado para controlar o alerta de uso da poção
  const [showPotionAlert, setShowPotionAlert] = useState(false);
  const [potionUsed, setPotionUsed] = useState<string | null>(null);
  
  // Ref para garantir que a poção seja removida apenas uma vez
  const potionRemovedRef = useRef(false);

  // Função para remover a Poção Corrosiva da bolsa
  const removePotionCorrosiva = () => {
    if (potionRemovedRef.current) {
      return;
    }
    
    if (!ficha || !ficha.bolsa) {
      return;
    }

    const updatedFicha = { ...ficha };
    
    // Procura por poção corrosiva na bolsa
    const potionIndex = updatedFicha.bolsa.findIndex((item: any) => 
      item.id === 'almotolia-pocao-corrosiva' || 
      item.nome?.toLowerCase().includes('poção corrosiva') ||
      item.nome?.toLowerCase().includes('pocao corrosiva')
    );
    
    if (potionIndex !== -1) {
      const removedPotion = updatedFicha.bolsa[potionIndex];
      
      // Verifica se tem mais de uma poção
      if (removedPotion.quantidade && removedPotion.quantidade > 1) {
        // Remove apenas uma unidade
        updatedFicha.bolsa[potionIndex].quantidade -= 1;
      } else {
        // Remove o item completamente se só tinha uma
        updatedFicha.bolsa.splice(potionIndex, 1);
      }
      
      // Atualiza a ficha
      onUpdateFicha(updatedFicha);
      
      // Configura o alerta
      setPotionUsed(removedPotion.nome);
      setShowPotionAlert(true);
      
      // Marca que a poção foi removida
      potionRemovedRef.current = true;
      
      // Ocultar alerta após 5 segundos
      setTimeout(() => setShowPotionAlert(false), 5000);
    }
  };

  // Remove a poção quando a tela carrega
  useEffect(() => {
    const timer = setTimeout(() => {
      removePotionCorrosiva();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [ficha]);

  return (
    <Container data-screen="screen-7">
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Alerta de uso da poção */}
      {showPotionAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showPotionAlert}>
          🧪 {potionUsed ? `Você usou ${potionUsed}!` : 'Poção Corrosiva usada!'}
        </GameAlert>
      )}

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
            Você abre o pequeno frasco de Poção Corrosiva e despeja o líquido espesso na fechadura da cela. O efeito é imediato: em segundos, o metal range e se dissolve até desaparecer.
            <br/><br/>
            Sem perceber nada, o carcereiro continua distraído. É a sua chance. Você se aproxima silenciosamente e desfere um golpe certeiro, deixando-o desacordado. Pulando por cima de seu corpo volumoso, escapa rapidamente da prisão.
            <br/><br/>
            Do lado de fora, você abandona Royal Lendle pela Porta Sul, que leva até a Estrada do Comércio Principal, ou pela Porta Leste, mais próxima dali.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(272);
            }}>
              Seguir pela Porta Sul
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(60);
            }}>
              Seguir pela Porta Leste
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen7;
