import React, { useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import BattleSystem from './BattleSystem';
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

interface Screen26Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen26: React.FC<Screen26Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(26);
  const playClick = useClickSound(0.2);
  
  const [battleState, setBattleState] = useState<'intro' | 'battle' | 'victory'>('intro');
  const battleSystemRef = useRef<any>(null);

  const handleVictory = () => {
    setBattleState('victory');
  };

  const handleStartBattle = () => {
    setBattleState('battle');
    // Aguarda um pouco para o BattleSystem ser renderizado e depois chama startBattle
    setTimeout(() => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      }
    }, 100);
  };

  const handleDefeat = () => {
    // Em caso de derrota, pode redirecionar para uma tela de game over
    // Por enquanto, vamos apenas mostrar a derrota
    console.log('Jogador foi derrotado');
  };

  const enemy = {
    nome: 'Carcereiro',
    pericia: 8,
    forca: 7,
    imagem: '/src/assets/images/personagens/carcereiro.png'
  };

  return (
    <>
      {/* Controles de áudio - sempre visíveis */}
      {currentGroup && (
        <Box sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => {
                  playClick();
                  togglePlay?.();
                }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(179,18,18,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <Container data-screen="screen-26">
        <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {battleState === 'intro' && (
            <>
              <NarrativeText>
                Você continua a provocar o carcereiro em voz alta, sem obter reação, até que por fim grita:
                <br/><br/>
                — Seu pai é filho de um tocador de alaúde, e sua mãe parece um balde cheio de ovos de rã!
                <br/><br/>
                Diante disso, o carcereiro salta furioso e parte contra você. Espumando de raiva, ele abre a cela e entra de punhos erguidos. Ele não quer ouvir desculpas — ele quer lutar.
                <br/><br/>
                <strong>CARCEREIRO — PERÍCIA 8 | FORÇA 7 | PODER DE ATAQUE 0</strong>
                <br/><br/>
                Se você vencer, terá que abandonar a cidade antes que o alarme seja dado.
              </NarrativeText>

              <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <img 
                  src={enemy.imagem}
                  alt={enemy.nome}
                  style={{
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '2px solid #8B4513'
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <ChoiceButton onClick={handleStartBattle}>
                  Iniciar Batalha
                </ChoiceButton>
              </Box>
            </>
          )}

          {battleState === 'battle' && (
            <BattleSystem
              enemy={enemy}
              ficha={ficha}
              onUpdateFicha={onUpdateFicha}
              onVictory={handleVictory}
              onDefeat={handleDefeat}
              ref={battleSystemRef}
            />
          )}

          {battleState === 'victory' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: `${fadeIn} 0.5s ease-out` }}>
              <Typography variant="h5" sx={{ 
                color: '#4CAF50', 
                textAlign: 'center', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                marginBottom: '24px'
              }}>
                🏆 VITÓRIA! 🏆
              </Typography>
              
              <Typography variant="body1" sx={{ 
                textAlign: 'center', 
                color: 'text.primary',
                marginBottom: '32px'
              }}>
                Você derrotou o carcereiro! Agora escolha seu caminho para escapar da cidade:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ChoiceButton onClick={() => onGoToScreen(272)}>
                  Saia pela Porta Sul, que leva à Estrada do Comércio Principal
                </ChoiceButton>

                <ChoiceButton onClick={() => onGoToScreen(60)}>
                  Saia pela Porta Leste
                </ChoiceButton>
              </Box>
            </Box>
          )}
        </CardContent>
      </CardWrap>
        </Container>
      </>
    );
  };

export default Screen26;
