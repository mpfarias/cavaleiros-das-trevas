import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import BattleSystem from './BattleSystem';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import cavaleiroImg from '../assets/images/personagens/cavaleiro05.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen245Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen245: React.FC<Screen245Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(245);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  
  const [battleState, setBattleState] = useState<'intro' | 'skill-test' | 'battle' | 'victory'>('intro');
  const battleSystemRef = useRef<any>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  
  // Estados para o teste de perícia inicial
  const [showSkillDiceModal, setShowSkillDiceModal] = useState(false);
  const [showSkillAlert, setShowSkillAlert] = useState(false);
  const [skillResult, setSkillResult] = useState<string>('');

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

  const handleStartSkillTest = () => {
    playClick();
    setBattleState('skill-test');
    setShowSkillDiceModal(true);
  };

  const handleSkillDiceComplete = useCallback((_dice: number[], total: number) => {
    setShowSkillDiceModal(false);
    
    const periciaAtual = ficha.pericia.atual;
    const isSuccess = total <= periciaAtual;
    
    if (isSuccess) {
      // Sucesso! Desviou da estrela
      setSkillResult(`Sucesso! Dados: ${total} - Você desviou da estrela mortal!`);
      setShowSkillAlert(true);
      
      setTimeout(() => {
        setShowSkillAlert(false);
        // Após o alert, inicia a batalha
        setTimeout(() => {
          setBattleState('battle');
          
          const waitForBattleSystem = (attempts = 0) => {
            if (battleSystemRef.current?.startBattle) {
              battleSystemRef.current.startBattle();
            } else if (attempts < 10) {
              setTimeout(() => waitForBattleSystem(attempts + 1), 100);
            }
          };
          
          setTimeout(() => waitForBattleSystem(), 150);
        }, 500);
      }, NOTIFICATION_CONFIG.autoHideDuration);
    } else {
      // Falha! Estrela acertou = morte instantânea
      setSkillResult(`Você falhou no teste de Perícia! Dados: ${total} - A estrela de Metal-Cruel perfura seu corpo. A dor é insuportável... e então... nada.`);
      setShowSkillAlert(true);
      
      // Redireciona para Game Over após 4 segundos
      setTimeout(() => {
        onGoToScreen(999); // Game Over genérico
      }, 4000);
    }
  }, [ficha, onGoToScreen]);

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
    nome: 'Quinto Cavaleiro das Trevas',
    pericia: 9,
    forca: 9,
    imagem: cavaleiroImg
    // Permite teste de sorte e armadura normalmente (após o teste inicial)
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

      <Container data-screen="screen-245">
        <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {battleState === 'intro' && (
            <>
              <NarrativeText>
                Este Cavaleiro das Trevas carrega consigo várias estrelas de arremesso, letais e esculpidas em uma substância mágica chamada Metal-Cruel.
                <br/><br/>
                As feridas causadas por esse metal nunca cicatrizam completamente, rasgando a carne e condenando suas vítimas a uma morte lenta e dolorosa.
                <br/><br/>
                No início do combate, o Cavaleiro atira uma dessas estrelas.
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
                  ⚠️ ATENÇÃO: Teste sua PERÍCIA para desviar!
                  <br/>
                  • Sucesso: Você desvia e o combate começa
                  <br/>
                  • Falha: A estrela acerta... MORTE INSTANTÂNEA!
                  <br/>
                  (A ferida de Metal-Cruel é SEMPRE fatal)
                </Box>
                <br/><br/>
                <strong>QUINTO CAVALEIRO DAS TREVAS — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
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
                
                <ChoiceButton onClick={handleStartSkillTest}>
                  Testar a Perícia e Iniciar Batalha
                </ChoiceButton>
              </Box>
            </>
          )}

          {battleState === 'skill-test' && (
            <Box sx={{ textAlign: 'center', padding: '40px' }}>
              <Typography variant="h5" sx={{ 
                color: '#8B4513',
                marginBottom: '24px',
                fontFamily: '"Cinzel", serif',
                fontWeight: 'bold'
              }}>
                O Cavaleiro lança a estrela mortal...
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Rolando dados para o teste de Perícia...
              </Typography>
            </Box>
          )}

          {battleState === 'battle' && (
            <BattleSystem
              enemy={enemy}
              ficha={ficha}
              onUpdateFicha={stableOnUpdateFicha}
              onVictory={handleVictory}
              onDefeat={handleDefeat}
              onGoToScreen={onGoToScreen}
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
                Você derrotou o cavaleiro das estrelas! Continuando sua fuga...
              </Typography>
            </Box>
          )}
        </CardContent>
        </CardWrap>
      </Container>

      {/* Modal de dados para o teste de perícia */}
      <DiceRollModal3D
        open={showSkillDiceModal}
        numDice={2}
        onComplete={handleSkillDiceComplete}
        title="Teste de Perícia"
      />

      {/* Alerta com resultado do teste de perícia */}
      {showSkillAlert && (
        <GameAlert sx={{ top: '120px', zIndex: 1200 }} $isVisible={showSkillAlert}>
          {skillResult}
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
            background: theme.cardWrap.background,
            border: theme.cardWrap.border,
            borderRadius: theme.cardWrap.borderRadius,
            boxShadow: theme.cardWrap.boxShadow
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: '"Cinzel", serif',
          fontSize: '24px',
          fontWeight: 700,
          color: theme.cardWrap.border.split(' ')[2],
          textAlign: 'center',
          borderBottom: `2px solid ${theme.cardWrap.border.split(' ')[2]}`,
          paddingBottom: '16px'
        }}>
          Sistema de Batalhas
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Typography variant="body1" sx={{ 
            fontFamily: '"Spectral", serif',
            fontSize: '16px',
            lineHeight: 1.8,
            color: theme.narrativeText.color,
            marginBottom: '16px'
          }}>
            <strong>Como funciona:</strong>
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: '"Spectral", serif',
            fontSize: '15px',
            lineHeight: 1.7,
            color: theme.narrativeText.color,
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
            • <strong>ANTES da batalha</strong>, você faz um teste de PERÍCIA
            <br/>
            • Role 2d6: se total ≤ sua PERÍCIA → desvia da estrela
            <br/>
            • Se falhar: a estrela de Metal-Cruel acerta → <strong>MORTE INSTANTÂNEA!</strong>
            <br/>
            • O Metal-Cruel é mágico e SEMPRE fatal, sem exceção
            <br/>
            • Se desviar com sucesso, o combate segue normalmente
            <br/>
            • No combate, armadura e teste de Sorte funcionam
            <br/>
            • A batalha termina quando a FORÇA de alguém chegar a zero
          </Typography>

          <Box sx={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              onClick={handleCloseBattleInfo}
              variant="contained"
              sx={{
                background: theme.choiceButton.background,
                color: theme.choiceButton.color,
                border: theme.choiceButton.border,
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                padding: '12px 32px',
                textShadow: theme.choiceButton.textShadow,
                boxShadow: theme.choiceButton.boxShadow,
                '&:hover': {
                  background: theme.choiceButton.hoverBackground,
                  borderColor: theme.choiceButton.hoverBorderColor,
                  boxShadow: theme.choiceButton.hoverBoxShadow
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

export default Screen245;

