import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import BattleSystem from './BattleSystem';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import cavaleiroImg from '../assets/images/personagens/cavaleiro02.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #0b0614 0%, #120a1f 25%, #0e0a18 50%, #070512 75%, #000000 100%),
    radial-gradient(circle at 30% 30%, rgba(96,54,160,0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(58,34,94,0.12) 0%, transparent 50%)
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

interface Screen394Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen394: React.FC<Screen394Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);
  
  const [battleState, setBattleState] = useState<'intro' | 'battle' | 'victory'>('intro');
  const battleSystemRef = useRef<any>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  
  // Estados para o sistema de punhal
  const [showDaggerDiceModal, setShowDaggerDiceModal] = useState(false);
  const [showDaggerAlert, setShowDaggerAlert] = useState(false);
  const [daggerResult, setDaggerResult] = useState<string>('');
  const daggerResolveRef = useRef<(() => void) | null>(null);

  const stableOnUpdateFicha = useCallback((updatedFicha: any) => {
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
      } catch (error) {
        console.warn('Erro ao inicializar áudio de batalha:', error);
      }
    };
    
    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const handleVictory = () => {
    setBattleState('victory');
    // Redireciona para tela 335 após 2 segundos
    setTimeout(() => {
      onGoToScreen(335);
    }, 2000);
  };

  // Função executada ANTES de cada turno - rola o dado do punhal
  const handleBeforeTurnStart = useCallback(async () => {
    return new Promise<void>((resolve) => {
      // Armazena o resolve para ser chamado depois
      daggerResolveRef.current = resolve;
      // Abre o modal do punhal
      setShowDaggerDiceModal(true);
    });
  }, []);

  const handleDaggerDiceComplete = useCallback((_dice: number[], total: number) => {
    // Fecha o modal
    setShowDaggerDiceModal(false);
    
    if (total >= 5) {
      // Acertou! Perde 2 pontos de FORÇA
      const updatedFicha = { ...ficha };
      updatedFicha.forca.atual = Math.max(0, ficha.forca.atual - 2);
      onUpdateFicha(updatedFicha);
      setDaggerResult(`O Cavaleiro acertou o punhal em você! Perdeu 2 pontos de FORÇA (Dado: ${total})`);
    } else {
      // Errou!
      setDaggerResult(`O Cavaleiro errou o arremesso do punhal! (Dado: ${total})`);
    }
    
    setShowDaggerAlert(true);
    setTimeout(() => setShowDaggerAlert(false), 3000);
    
    // Resolve a Promise após um pequeno delay para garantir que o modal fechou
    setTimeout(() => {
      if (daggerResolveRef.current) {
        daggerResolveRef.current();
        daggerResolveRef.current = null;
      }
    }, 500);
  }, [ficha, onUpdateFicha]);

  const handleStartBattle = () => {
    setBattleState('battle');
    
    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) {
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        setBattleState('intro');
      }
    };
    
    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleDefeat = () => {
    // Derrota pelo cavaleiro = morte
    onGoToScreen(999); // Game Over genérico
  };

  const handleShowBattleInfo = () => {
    setShowBattleInfoModal(true);
  };

  const handleCloseBattleInfo = () => {
    setShowBattleInfoModal(false);
  };

  const enemy = {
    nome: 'Segundo Cavaleiro das Trevas',
    pericia: 9,
    forca: 9,
    imagem: cavaleiroImg
    // Permite teste de sorte e armadura normalmente
  };

  return (
    <>
      <VolumeControl />
      
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

      <Container data-screen="screen-394">
        <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {battleState === 'intro' && (
            <>
              <NarrativeText>
                Este Cavaleiro das Trevas carrega no peito vários punhais finamente trabalhados.
                <br/><br/>
                No início de cada combate, ele atira uma das suas facas.
                <br/><br/>
                <Box component="span" sx={{ 
                  color: '#D32F2F', 
                  fontWeight: 700,
                  fontSize: '16px',
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(211,47,47,0.1)',
                  borderRadius: '8px',
                  border: '2px solid #D32F2F'
                }}>
                  ⚠️ ATENÇÃO: Antes de cada turno, 1 dado será lançado!
                  <br/>
                  • Resultado 1-4: O cavaleiro erra o punhal
                  <br/>
                  • Resultado 5-6: O cavaleiro acerta o punhal em você ( perde 2 de FORÇA)
                  <br/>
                  Nem armaduras nem teste de Sorte reduzem o dano do punhal!
                </Box>
                <br/><br/>
                <strong>SEGUNDO CAVALEIRO DAS TREVAS — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
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
                <Button
                  onClick={handleShowBattleInfo}
                  variant="outlined"
                  sx={{
                    padding: '12px 24px',
                    border: '2px solid #8B4513',
                    color: '#8B4513',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: '"Cinzel", serif',
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    marginBottom: '16px',
                    '&:hover': {
                      background: 'rgba(139,69,19,0.1)',
                      borderColor: '#654321',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Conhecer Sistema de Batalhas
                </Button>
                
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
              onUpdateFicha={stableOnUpdateFicha}
              onVictory={handleVictory}
              onDefeat={handleDefeat}
              onGoToScreen={onGoToScreen}
              beforeTurnStart={handleBeforeTurnStart}
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
                VITÓRIA!
              </Typography>
              
              <Typography variant="body1" sx={{ 
                textAlign: 'center', 
                color: 'text.primary',
                marginBottom: '32px'
              }}>
                Você derrotou o cavaleiro dos punhais! Continuando sua fuga...
              </Typography>
            </Box>
          )}
        </CardContent>
        </CardWrap>
      </Container>

      {/* Modal de dados para o punhal */}
      <DiceRollModal3D
        open={showDaggerDiceModal}
        numDice={1}
        onComplete={handleDaggerDiceComplete}
        title="Arremesso do Punhal"
      />

      {/* Alerta com resultado do punhal */}
      {showDaggerAlert && (
        <GameAlert sx={{ top: '120px', zIndex: 1200 }} $isVisible={showDaggerAlert}>
          {daggerResult}
        </GameAlert>
      )}

      {/* Modal de informações de batalha */}
      <Dialog 
        open={showBattleInfoModal} 
        onClose={handleCloseBattleInfo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 100%)',
            border: '3px solid #8B4513',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: '"Cinzel", serif',
          fontSize: '24px',
          fontWeight: 700,
          color: '#8B4513',
          textAlign: 'center',
          borderBottom: '2px solid #8B4513',
          paddingBottom: '16px'
        }}>
          Sistema de Batalhas
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Typography variant="body1" sx={{ 
            fontFamily: '"Spectral", serif',
            fontSize: '16px',
            lineHeight: 1.8,
            color: '#3d2817',
            marginBottom: '16px'
          }}>
            <strong>Como funciona:</strong>
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: '"Spectral", serif',
            fontSize: '15px',
            lineHeight: 1.7,
            color: '#3d2817',
            marginBottom: '12px'
          }}>
            • A cada turno, você e o inimigo rolam dados (2d6)
            <br/>
            • O resultado é somado à PERÍCIA de cada um
            <br/>
            • Quem tiver o maior total causa dano na FORÇA do oponente
            <br/>
            • Em caso de empate, ambos se defendem e ninguém sofre dano
            <br/>
            <br/>
            <strong style={{ color: '#D32F2F' }}>⚠️ ESPECIAL NESTA BATALHA:</strong>
            <br/>
            • <strong>ANTES de cada turno</strong>, o cavaleiro atira um punhal
            <br/>
            • Você rola 1 dado para ver se o punhal acerta
            <br/>
            • Resultado 1-4: O punhal erra (sem dano)
            <br/>
            • Resultado 5-6: O punhal acerta (-2 FORÇA)
            <br/>
            • O dano do punhal ignora armadura e não pode ser reduzido com Sorte
            <br/>
            • Após o punhal, o combate segue normalmente
            <br/>
            • No combate normal, armadura e teste de Sorte funcionam
            <br/>
            • A batalha termina quando a FORÇA de alguém chegar a zero
          </Typography>

          <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              onClick={handleCloseBattleInfo}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                color: '#F5DEB3',
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                padding: '12px 32px',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                }
              }}
            >
              Entendi
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Screen394;

