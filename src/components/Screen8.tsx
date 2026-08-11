import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import BattleSystem, { type BattleSystemHandle } from './BattleSystem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import cavaleiroImg from '../assets/images/personagens/cavaleiro01.png';
import { getDarkKnightVictoryScreen } from '../utils/darkKnightVictory';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen8Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen8: React.FC<Screen8Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle';
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(8);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  
  const [battleState, setBattleState] = useState<'intro' | 'battle' | 'victory'>('intro');
  const battleSystemRef = useRef<BattleSystemHandle | null>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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
    const nextScreen = getDarkKnightVictoryScreen(ficha);
    setTimeout(() => {
      onGoToScreen(nextScreen);
    }, 2000);
  };

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
    nome: 'Primeiro Cavaleiro das Trevas',
    pericia: 9,
    forca: 9,
    imagem: cavaleiroImg,
    attacksPerTurn: 2 // Ataca 2 vezes por turno (permite teste de sorte e armadura)
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

      <Container data-screen="screen-8">
        <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {battleState === 'intro' && (
            <>
              <NarrativeText>
                O Cavaleiro das Trevas que você enfrenta não empunha qualquer arma — ele é um mestre das artes marciais, e suas mãos letais e cadavéricas se movem com velocidade sobrenatural.
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
                  ⚠️ Durante o combate, o Cavaleiro das Trevas ataca <strong>DUAS VEZES POR TURNO</strong>.
                  <br/>
                  Resolva o confronto como se estivesse lutando contra dois inimigos simultaneamente.
                </Box>
                <br/><br/>
                <strong>PRIMEIRO CAVALEIRO DAS TREVAS — PERÍCIA {enemy.pericia} | FORÇA {enemy.forca}</strong>
              </NarrativeText>

              <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <img 
                  src={enemy.imagem}
                  alt={enemy.nome}
                  style={{
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    border: theme.hoverImage.border,
                    boxShadow: theme.hoverImage.boxShadow,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    playClick();
                    setShowImageModal(true);
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={handleShowBattleInfo}
                  variant="outlined"
                  sx={{
                    padding: '12px 24px',
                    border: `2px solid ${theme.cardWrap.border.split(' ')[2]}`,
                    color: theme.cardWrap.border.split(' ')[2],
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
                      background: `${theme.cardWrap.border.split(' ')[2]}15`,
                      borderColor: theme.choiceButton.hoverBorderColor,
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
                Você derrotou o mestre das artes marciais! Continuando sua fuga...
              </Typography>
            </Box>
          )}
        </CardContent>
        </CardWrap>
      </Container>

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
            • Este cavaleiro <strong>ataca 2 vezes por turno</strong>
            <br/>
            • Ele rola os dados DUAS VEZES e compara cada resultado com o seu
            <br/>
            • Você recebe 2 de dano por cada ataque que ele vencer
            <br/>
            • Se ele vencer os dois ataques, você toma 4 pontos de dano no total
            <br/>
            • Se você vencer pelo menos 1 ataque, ele toma apenas 2 pontos de dano
            <br/>
            • Você pode usar armadura e testar a sorte normalmente
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

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={cavaleiroImg}
        imageAlt="Primeiro Cavaleiro das Trevas"
      />
    </>
  );
};

export default Screen8;

