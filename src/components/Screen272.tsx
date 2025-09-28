import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
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

interface Screen272Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen272: React.FC<Screen272Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Hook de áudio direto para controle manual
  const { isPlaying, togglePlay, changeTrack, tryStartMusic } = useAudio();
  const currentGroup = 'battle'; // Grupo de áudio para tela de batalha
  const playClick = useClickSound(0.2);
  
  const [battleState, setBattleState] = useState<'intro' | 'battle' | 'victory' | 'defeat'>('intro');
  const battleSystemRef = useRef<any>(null);
  const [showBattleInfoModal, setShowBattleInfoModal] = useState(false);

  // Estabilizar o callback onUpdateFicha para evitar re-renderizações do BattleSystem
  const stableOnUpdateFicha = useCallback((updatedFicha: any) => {
    console.log('🔄 [Screen272] onUpdateFicha chamado com ficha atualizada');
    onUpdateFicha(updatedFicha);
  }, [onUpdateFicha]);

  // Inicializar áudio de batalha quando a tela carregar
  useEffect(() => {
    const initializeBattleAudio = async () => {
      try {
        console.log('🎵 [Screen272] Inicializando áudio de batalha...');
        await changeTrack('/src/assets/sounds/bgm-battle.mp3');
        tryStartMusic();
        console.log('🎵 [Screen272] Áudio de batalha inicializado com sucesso!');
      } catch (error) {
        console.warn('🎵 [Screen272] Erro ao inicializar áudio de batalha:', error);
      }
    };
    
    initializeBattleAudio();
  }, [changeTrack, tryStartMusic]);

  const handleVictory = () => {
    setBattleState('victory');
  };

  const handleStartBattle = () => {
    setBattleState('battle');
    
    // Função recursiva para verificar se o BattleSystem está pronto
    const waitForBattleSystem = (attempts = 0) => {
      if (battleSystemRef.current?.startBattle) {
        battleSystemRef.current.startBattle();
      } else if (attempts < 10) { // Máximo de 10 tentativas
        setTimeout(() => waitForBattleSystem(attempts + 1), 100);
      } else {
        console.error('BattleSystem não foi inicializado corretamente');
        // Fallback: tenta iniciar novamente
        setBattleState('intro');
      }
    };
    
    // Primeira tentativa após um delay
    setTimeout(() => waitForBattleSystem(), 150);
  };

  const handleDefeat = () => {
    // Em caso de derrota, atualizar o estado para mostrar GameOverScreen
    console.log('💀 [Screen272] Jogador foi derrotado, atualizando estado para defeat');
    setBattleState('defeat');
  };

  const handleShowBattleInfo = () => {
    setShowBattleInfoModal(true);
  };

  const handleCloseBattleInfo = () => {
    setShowBattleInfoModal(false);
  };

  const enemy = {
    nome: 'Homem-Orc',
    pericia: 8,
    forca: 8,
    imagem: '/src/assets/images/personagens/homem-orc.png'
  };

  return (
    <>
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controles de áudio */}
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

      <Container data-screen="screen-272">
        <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          {battleState === 'intro' && (
            <>
              <NarrativeText>
                Você perdeu muito tempo em Royal Lendle, mas finalmente avista a Porta Sul.
                <br/><br/>
                É uma estrutura maciça, com duas portas de aço reforçado, erguida no meio de uma muralha tão larga que possui túneis e vigias.
                <br/><br/>
                O movimento não é intenso, e os guardas estão ocupados revistando a carroça de um mercador. Por isso, ninguém percebe quando uma figura encapuzada de negro intercepta o seu caminho.
                <br/><br/>
                Mesmo disfarçado, você o reconhece: é o Homem-Orc. Ele empunha uma espada assassina e, com uma voz sibilante carregada de ódio, rosna:
                <br/><br/>
                — "Morra, estúpido! Nem você nem os idiotas dos seus amigos chegarão a Karnstein vivos. A vontade do meu Mestre será cumprida!"
                <br/><br/>
                Dito isso, ele avança contra você.
                <br/><br/>
                <strong>HOMEM-ORC — PERÍCIA 8 | FORÇA 8 </strong>
                <br/><br/>
                Se você vencer sem tomar dano, poderá continuar sua jornada. Se tomar dano, terá que se recuperar.
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
                Você derrotou o Homem-Orc! Verificando seu estado...
              </Typography>

              {(() => {
                // Verificar se o jogador tomou dano
                const danoOriginal = ficha.forca.inicial;
                const forcaAtual = ficha.forca.atual;
                const tomouDano = forcaAtual < danoOriginal;
                
                console.log(`🩸 [Screen272] Força original: ${danoOriginal}, Atual: ${forcaAtual}, Tomou dano: ${tomouDano}`);
                
                if (tomouDano) {
                  // Vitória com dano - vai para tela 4
                  setTimeout(() => {
                    onGoToScreen(4);
                  }, 2000);
                  return (
                    <Typography variant="body1" sx={{ 
                      textAlign: 'center', 
                      color: '#F44336',
                      marginBottom: '32px'
                    }}>
                      Você tomou dano na batalha. Será redirecionado para se recuperar...
                    </Typography>
                  );
                } else {
                  // Vitória sem dano - vai para tela 40
                  setTimeout(() => {
                    onGoToScreen(40);
                  }, 2000);
                  return (
                    <Typography variant="body1" sx={{ 
                      textAlign: 'center', 
                      color: '#4CAF50',
                      marginBottom: '32px'
                    }}>
                      Vitória perfeita! Continuando sua jornada...
                    </Typography>
                  );
                }
              })()}
            </Box>
          )}
        </CardContent>
              </CardWrap>
          </Container>

        {/* Modal de informações sobre o sistema de batalha */}
        {showBattleInfoModal && (
          <>
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={handleCloseBattleInfo}
            />
            <Box
              sx={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: `
                  linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 50%, rgba(205,133,63,0.98) 100%)
                `,
                border: '3px solid #8B4513',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: `
                  0 20px 60px rgba(0,0,0,0.8),
                  inset 0 1px 0 rgba(255,255,255,0.3),
                  0 0 0 1px rgba(139,69,19,0.6)
                `
              }}
            >
              <Typography variant="h4" sx={{ 
                textAlign: 'center', 
                marginBottom: '24px',
                color: '#8B4513',
                fontFamily: '"Cinzel", serif',
                fontWeight: 'bold'
              }}>
                ⚔️ Sistema de Batalha ⚔️
              </Typography>

              <Box sx={{ marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  🎯 Como Funciona:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: '16px', lineHeight: 1.6 }}>
                  Cada turno de batalha é dividido em duas fases: o inimigo lança dados primeiro, depois você. 
                  O poder de ataque é calculado somando o resultado dos dados + sua PERÍCIA.
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  ⚡ Resultados dos Turnos:
                </Typography>
                <Box sx={{ 
                  background: 'rgba(139,69,19,0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#4CAF50' }}>• Você acerta:</strong> Inimigo perde 2 pontos de FORÇA
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#F44336' }}>• Inimigo acerta:</strong> Você perde 2 pontos de FORÇA
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#FF9800' }}>• Empate:</strong> Ambos desviam, sem dano
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  🎲 Teste de Sorte (Opcional):
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: '12px', lineHeight: 1.6 }}>
                  Após cada turno, você pode testar sua sorte gastando 1 ponto de SORTE atual:
                </Typography>
                <Box sx={{ 
                  background: 'rgba(139,69,19,0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>🎯 Se você acertou o inimigo:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ marginLeft: '16px', marginBottom: '4px' }}>
                    • <strong style={{ color: '#4CAF50' }}>Sucesso (≥7):</strong> Inimigo perde 4 pontos de FORÇA (2 base + 2 sorte)
                  </Typography>
                  <Typography variant="body2" sx={{ marginLeft: '16px', marginBottom: '8px' }}>
                    • <strong style={{ color: '#F44336' }}>Falha (&lt;7):</strong> Inimigo perde apenas 1 ponto de FORÇA (2 base - 1 azar)
                  </Typography>
                  
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    <strong>🛡️ Se o inimigo acertou você:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ marginLeft: '16px', marginBottom: '4px' }}>
                    • <strong style={{ color: '#4CAF50' }}>Sucesso (≥7):</strong> Você perde apenas 1 ponto de FORÇA (2 base - 1 sorte)
                  </Typography>
                  <Typography variant="body2" sx={{ marginLeft: '16px', marginBottom: '4px' }}>
                    • <strong style={{ color: '#F44336' }}>Falha (&lt;7):</strong> Você perde 3 pontos de FORÇA (2 base + 1 azar)
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  🏆 Condições de Vitória:
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  • <strong style={{ color: '#4CAF50' }}>Vitória:</strong> Reduzir a FORÇA do inimigo para 0
                  • <strong style={{ color: '#F44336' }}>Derrota:</strong> Sua FORÇA chegar a 0
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  Dicas Estratégicas:
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  • Use o teste de sorte com sabedoria - pontos de sorte são limitados!
                  • Considere o risco vs. benefício antes de testar a sorte
                  • Monitore sua FORÇA e SORTE durante a batalha
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={handleCloseBattleInfo}
                  variant="contained"
                  sx={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                    color: '#F5DEB3',
                    border: '2px solid #8B4513',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: '"Cinzel", serif',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                      color: '#FFFFFF'
                    }
                  }}
                >
                  Entendi!
                </Button>
              </Box>
            </Box>
          </>
        )}
        </>
      );
    };

export default Screen272;
