import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { GameAlert } from './ui/GameAlert';
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

interface Screen199Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen199: React.FC<Screen199Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(199);
  const playClick = useClickSound(0.2);
  
  // Estado para controlar o alerta de perda de arma
  const [showWeaponAlert, setShowWeaponAlert] = useState(false);
  const [weaponLost, setWeaponLost] = useState('');
  
  // Ref para garantir que a arma seja removida apenas uma vez
  const weaponRemovedRef = useRef(false);

  // Função para verificar se o jogador tem poção corrosiva
  const hasPocaoCorrosiva = () => {
    if (!ficha || !ficha.bolsa) return false;
    
    // Procura por poção corrosiva na bolsa
    const pocaoCorrosiva = ficha.bolsa.find((item: any) => 
      item.id === 'almotolia-pocao-corrosiva' || 
      item.nome?.toLowerCase().includes('poção corrosiva') ||
      item.nome?.toLowerCase().includes('pocao corrosiva')
    );
    
    console.log('🔍 [Screen199] Verificando poção corrosiva:', pocaoCorrosiva);
    return !!pocaoCorrosiva;
  };

  // Função para remover a arma da bolsa
  const removeWeapon = () => {
    console.log('🔍 [Screen199] removeWeapon chamada');
    console.log('🔍 [Screen199] ficha:', ficha);
    console.log('🔍 [Screen199] ficha.bolsa:', ficha?.bolsa);
    
    if (weaponRemovedRef.current) {
      console.log('🔍 [Screen199] Arma já foi removida anteriormente');
      return;
    }
    
    if (!ficha) {
      console.log('🔍 [Screen199] Ficha não existe');
      return;
    }
    
    if (!ficha.bolsa) {
      console.log('🔍 [Screen199] Bolsa não existe na ficha');
      return;
    }

    const updatedFicha = { ...ficha };
    console.log('🔍 [Screen199] Bolsa atual:', updatedFicha.bolsa);
    
    // Procura por armas na bolsa (tipo "arma")
    const weaponIndex = updatedFicha.bolsa.findIndex((item: any) => {
      console.log('🔍 [Screen199] Verificando item:', item);
      return item.tipo === "arma";
    });
    
    console.log('🔍 [Screen199] Índice da arma encontrada:', weaponIndex);
    
    if (weaponIndex !== -1) {
      const removedWeapon = updatedFicha.bolsa[weaponIndex];
      console.log('🔍 [Screen199] Arma encontrada:', removedWeapon);
      
      updatedFicha.bolsa.splice(weaponIndex, 1);
      console.log('🔍 [Screen199] Bolsa após remoção:', updatedFicha.bolsa);
      
      // Atualiza a ficha
      console.log('🔍 [Screen199] Chamando onUpdateFicha');
      onUpdateFicha(updatedFicha);
      
      // Configura o alerta
      setWeaponLost(removedWeapon.nome);
      setShowWeaponAlert(true);
      
      // Marca que a arma foi removida
      weaponRemovedRef.current = true;
      
      // Ocultar alerta após 5 segundos
      setTimeout(() => setShowWeaponAlert(false), 5000);
      
      console.log(`⚔️ [Screen199] Arma removida com sucesso: ${removedWeapon.nome}`);
    } else {
      console.log('⚔️ [Screen199] Nenhuma arma encontrada na bolsa');
    }
  };

  // Remove a arma quando a tela carrega
  useEffect(() => {
    console.log('🔍 [Screen199] useEffect executado');
    console.log('🔍 [Screen199] ficha no useEffect:', ficha);
    
    // Pequeno delay para garantir que a ficha esteja carregada
    const timer = setTimeout(() => {
      removeWeapon();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [ficha]); // Adiciona ficha como dependência

  return (
    <Container data-screen="screen-199">
      {/* Alerta de perda de arma */}
      {showWeaponAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showWeaponAlert}>
          ⚔️ {weaponLost ? `Você perdeu ${weaponLost}!` : 'Arma perdida!'}
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
            Os guardas da cidade o conduzem até a prisão, onde você deverá permanecer até a madrugada seguinte. Nessa hora, um carro blindado virá buscá-lo para levá-lo às masmorras — um lugar sombrio de onde poucos retornam.
            <br/><br/>
            Os guardas tomam sua arma e o trancam em uma cela imunda. Você fica sob a vigilância do carcereiro: um brutamontes que, sentado a uma mesa, bebe e lê um livro intitulado Confissões de um Caçador de Ratazanas.
            <br/><br/>
            Como não há outros prisioneiros e o homem é o único de guarda, você começa a pensar em um plano de fuga. Felizmente, não revistaram todos os seus pertences.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Opção de Poção Corrosiva - só aparece se o jogador tiver */}
            {hasPocaoCorrosiva() && (
              <ChoiceButton onClick={() => {
                playClick();
                onGoToScreen(7);
              }}>
                Você tem uma Poção Corrosiva, pode usá-la se quiser
              </ChoiceButton>
            )}

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(26);
            }}>
              Você pode gritar e insultar o carcereiro, tentando atraí-lo para a cela e assim poder atacá-lo
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(38);
            }}>
              Se quiser, pode tentar enganá-lo e convencê-lo a libertá-lo
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(208);
            }}>
              Ou, se achar melhor, pode esperar pela chegada do carro das masmorras
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen199;
