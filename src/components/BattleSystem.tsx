import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useClickSound } from '../hooks/useClickSound';
import { GameAlert } from './ui/GameAlert';
import DiceRollModal3D from './ui/DiceRollModal3D';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.8); }
`;

// Container principal do sistema de combate - sem fundo, apenas conteúdo
const BattleContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  animation: `${fadeIn} 0.5s ease-out`
});

// Status da batalha
const StatusBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  background: 'rgba(139,69,19,0.1)',
  border: '1px solid rgba(139,69,19,0.3)',
  borderRadius: '8px',
  marginBottom: '16px'
});

// Histórico de turnos
const TurnHistory = styled(Box)({
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '16px',
  background: 'rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  marginBottom: '16px'
});

// Modal de resultado da batalha
const BattleModal = styled(Box)({
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
  maxWidth: '500px',
  width: '90%',
  zIndex: 1000,
  boxShadow: `
    0 20px 60px rgba(0,0,0,0.8),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.6)
  `,
  animation: `${fadeIn} 0.5s ease-out`,
  willChange: 'transform',
  backfaceVisibility: 'hidden'
});

// Overlay do modal
const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 999,
  animation: `${fadeIn} 0.3s ease-out`
});

// Botão do modal
const ModalButton = styled(Button)({
  padding: '12px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
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

interface Enemy {
  nome: string;
  pericia: number;
  forca: number;
  imagem: string;
}

interface BattleSystemProps {
  enemy: Enemy;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
  onVictory: () => void;
  onDefeat: () => void;
}

interface TurnResult {
  turn: number;
  playerRoll: number;
  enemyRoll: number;
  playerPower: number;
  enemyPower: number;
  result: 'player_hit' | 'enemy_hit' | 'dodge';
  damage: number;
  playerLuck?: boolean;
  enemyLuck?: boolean;
}

const BattleSystem = forwardRef<{ startBattle: () => void }, BattleSystemProps>(({
  enemy,
  ficha,
  onUpdateFicha,
  onVictory,
  onDefeat
}, ref) => {

  const playClick = useClickSound(0.2);

  const [battleState, setBattleState] = useState<'idle' | 'rolling' | 'battle' | 'enemyDefeated' | 'victory' | 'defeat'>('idle');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [enemyForca, setEnemyForca] = useState(enemy.forca);
  const [turnHistory, setTurnHistory] = useState<TurnResult[]>([]);
  const [showLuckAlert, setShowLuckAlert] = useState(false);
  const [luckResult, setLuckResult] = useState<string>('');
   
  // Estados para o sistema de dados
  const [dicePhase, setDicePhase] = useState<'enemy' | 'player'>('enemy');
  const [enemyRoll, setEnemyRoll] = useState<number | null>(null);
  const [playerRoll, setPlayerRoll] = useState<number | null>(null);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  
  // Estados para os modais temáticos
  const [showEnemyResultModal, setShowEnemyResultModal] = useState(false);
  const [showBattleResultModal, setShowBattleResultModal] = useState(false);
  const [currentTurnResult, setCurrentTurnResult] = useState<TurnResult | null>(null);

  const playerPericia = ficha?.pericia?.atual || 0;
  const playerForca = ficha?.forca?.atual || 0;

  // Expõe a função startBattle para o componente pai
  useImperativeHandle(ref, () => ({
    startBattle: () => startBattle()
  }), []);

  // Verificar condições de vitória/derrota
  useEffect(() => {
    if (enemyForca <= 0) {
      setBattleState('enemyDefeated');
      setTimeout(() => {
        setBattleState('victory');
        onVictory();
      }, 2500);
    } else if (playerForca <= 0) {
      setBattleState('defeat');
      onDefeat();
    }
  }, [enemyForca, playerForca, onVictory, onDefeat]);

  const startBattle = useCallback(() => {
    console.log('🚀 START BATTLE - Iniciando batalha');
    playClick();
    setCurrentTurn(1);
    setDicePhase('enemy');
    setEnemyRoll(null);
    setPlayerRoll(null);
    setDiceModalOpen(true);
  }, [playClick]);

  const nextTurn = useCallback(() => {
    playClick();
    setCurrentTurn(prev => prev + 1);
    setDicePhase('enemy');
    setEnemyRoll(null);
    setPlayerRoll(null);
    setDiceModalOpen(true);
  }, [playClick]);

  const resolveTurn = useCallback(() => {
    console.log('⚔️ RESOLVE TURN - Iniciando');
    
    if (enemyRoll === null || playerRoll === null) {
      console.log('❌ RESOLVE TURN - Dados faltando, saindo');
      return;
    }

    const enemyPower = enemyRoll + enemy.pericia;
    const playerPower = playerRoll + playerPericia;

    let result: TurnResult['result'];
    let damage = 0;

    if (playerPower > enemyPower) {
      result = 'player_hit';
      damage = 2;
      setEnemyForca(prev => prev - damage);
    } else if (enemyPower > playerPower) {
      result = 'enemy_hit';
      damage = 2;
      const updatedFicha = { ...ficha };
      updatedFicha.forca.atual = Math.max(0, playerForca - damage);
      onUpdateFicha(updatedFicha);
    } else {
      result = 'dodge';
      damage = 0;
    }

    const turnResult: TurnResult = {
      turn: currentTurn,
      playerRoll,
      enemyRoll,
      playerPower,
      enemyPower,
      result,
      damage
    };

    setTurnHistory(prev => [...prev, turnResult]);
    setCurrentTurnResult(turnResult);
    setShowBattleResultModal(true);
  }, [enemyRoll, playerRoll, enemy.pericia, playerPericia, currentTurn, ficha, playerForca, onUpdateFicha]);

  const handleDiceComplete = useCallback((_dice: number[], total: number) => {
    if (dicePhase === 'enemy') {
      setEnemyRoll(total);
      setDicePhase('player');
      setShowEnemyResultModal(true);
    } else {
      setPlayerRoll(total);
      setTimeout(() => {
        resolveTurn();
      }, 100);
    }
    setDiceModalOpen(false);
  }, [dicePhase, resolveTurn]);

  const testLuck = useCallback((forDamage: boolean) => {
    playClick();
    
    if (!ficha?.sorte?.atual || ficha.sorte.atual <= 0) {
      setLuckResult('Você não tem sorte suficiente para testar!');
      setShowLuckAlert(true);
      return;
    }

    const updatedFicha = { ...ficha };
    updatedFicha.sorte.atual = Math.max(0, ficha.sorte.atual - 1);
    onUpdateFicha(updatedFicha);

    if (forDamage) {
      setEnemyForca(prev => Math.max(0, prev - 1));
      setLuckResult('Sorte! Dano extra causado! -1 FORÇA do inimigo');
    } else {
      const recoveredForca = Math.min(1, playerForca + 1);
      updatedFicha.forca.atual = recoveredForca;
      onUpdateFicha(updatedFicha);
      setLuckResult('Sorte! Dano reduzido! +1 FORÇA recuperada');
    }

    setShowLuckAlert(true);
    setTimeout(() => setShowLuckAlert(false), 3000);
  }, [ficha, playerForca, onUpdateFicha, playClick]);

  const getTurnResultText = (turn: TurnResult) => {
    switch (turn.result) {
      case 'player_hit':
        return `Você acertou! Inimigo perde ${turn.damage} FORÇA`;
      case 'enemy_hit':
        return `Inimigo acertou! Você perde ${turn.damage} FORÇA`;
      case 'dodge':
        return 'Ambos desviaram!';
      default:
        return '';
    }
  };

  const canShowLuckButton = (turn: TurnResult) => {
    return (turn.result === 'player_hit' && !turn.playerLuck) || 
           (turn.result === 'enemy_hit' && !turn.enemyLuck);
  };

  const handleEnemyModalClose = useCallback(() => {
    setShowEnemyResultModal(false);
    setTimeout(() => {
      setDicePhase('player');
      setDiceModalOpen(true);
    }, 300);
  }, []);

  const handleBattleResultModalClose = useCallback(() => {
    setShowBattleResultModal(false);
    setCurrentTurnResult(null);
    setBattleState('battle');
  }, []);

  // Se a batalha terminou, não renderiza nada
  if (battleState === 'victory' || battleState === 'defeat') {
    return null;
  }

  return (
    <BattleContainer>
      {/* Status da batalha */}
      <StatusBox>
        <Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            {enemy.nome}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            PERÍCIA: {enemy.pericia} | FORÇA: {enemyForca}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Você
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            PERÍCIA: {playerPericia} | FORÇA: {playerForca}
          </Typography>
        </Box>
      </StatusBox>

      {/* Histórico de turnos */}
      {turnHistory.length > 0 && (
        <TurnHistory>
          <Typography variant="h6" sx={{ marginBottom: '12px', color: 'text.primary' }}>
            Histórico da Batalha
          </Typography>
          {turnHistory.map((turn, index) => (
            <Box key={index} sx={{ 
              marginBottom: '8px', 
              padding: '8px', 
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Turno {turn.turn}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                Você: {turn.playerRoll} + {playerPericia} = {turn.playerPower} | 
                {enemy.nome}: {turn.enemyRoll} + {enemy.pericia} = {turn.enemyPower}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: turn.result === 'player_hit' ? '#4CAF50' : 
                       turn.result === 'enemy_hit' ? '#F44336' : '#FF9800',
                fontWeight: 'bold'
              }}>
                {getTurnResultText(turn)}
              </Typography>
              {canShowLuckButton(turn) && (
                <Box sx={{ marginTop: '8px' }}>
                  {turn.result === 'player_hit' ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => testLuck(true)}
                      sx={{ 
                        borderColor: '#4CAF50', 
                        color: '#4CAF50',
                        marginRight: '8px'
                      }}
                    >
                      Testar Sorte (Dano Extra)
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => testLuck(false)}
                      sx={{ 
                        borderColor: '#FF9800', 
                        color: '#FF9800'
                      }}
                    >
                      Testar Sorte (Reduzir Dano)
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </TurnHistory>
      )}

      {/* Botão de próximo turno */}
      {battleState === 'battle' && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            onClick={nextTurn}
            variant="contained"
            sx={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
              color: '#FFFFFF',
              border: '2px solid #FFD700',
              borderRadius: '12px',
              fontSize: '18px',
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              '&:focus-visible': {
                outline: '2px solid #FFD700',
                outlineOffset: '2px'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(179,18,18,0.8) 100%)',
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 12px 32px rgba(179,18,18,0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)'
              }
            }}
          >
            Próximo Turno
          </Button>
        </Box>
      )}

      {/* Sistema de dados 3D */}
      <DiceRollModal3D
        open={diceModalOpen}
        numDice={2}
        onComplete={handleDiceComplete}
        title={dicePhase === 'enemy' ? `Dados para ${enemy.nome}` : 'Seus dados'}
      />

      {/* Alertas */}
      {showLuckAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showLuckAlert}>
          🍀 {luckResult}
        </GameAlert>
      )}

      {/* Modal 1: Resultado do inimigo */}
      {showEnemyResultModal && (
        <>
          <ModalOverlay onClick={handleEnemyModalClose} />
          <BattleModal>
            <Typography variant="h5" sx={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: '#8B4513',
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold'
            }}>
              Poder de Ataque do {enemy.nome}
            </Typography>
            
            <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
              <Typography variant="h4" sx={{ 
                color: '#B31212',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {enemyRoll} + {enemy.pericia} = {enemyRoll! + enemy.pericia}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8B4513' }}>
                O {enemy.nome} está pronto para atacar!
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <ModalButton onClick={handleEnemyModalClose}>
                Lançar Dados para Você
              </ModalButton>
            </Box>
          </BattleModal>
        </>
      )}

      {/* Modal 2: Resultado da batalha */}
      {showBattleResultModal && currentTurnResult && (
        <>
          <ModalOverlay onClick={handleBattleResultModalClose} />
          <BattleModal>
            <Typography variant="h5" sx={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: '#8B4513',
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold'
            }}>
              Resultado do Turno {currentTurnResult.turn}
            </Typography>
            
            <Box sx={{ marginBottom: '24px' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(139,69,19,0.1)',
                borderRadius: '8px'
              }}>
                <Typography variant="body1" sx={{ color: '#B31212', fontWeight: 'bold' }}>
                  {enemy.nome}: {currentTurnResult.enemyRoll} + {enemy.pericia} = {currentTurnResult.enemyPower}
                </Typography>
                <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Você: {currentTurnResult.playerRoll} + {playerPericia} = {currentTurnResult.playerPower}
                </Typography>
              </Box>
              
              <Typography variant="h6" sx={{ 
                textAlign: 'center',
                color: currentTurnResult.result === 'player_hit' ? '#4CAF50' : 
                       currentTurnResult.result === 'enemy_hit' ? '#B31212' : '#FF9800',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                {getTurnResultText(currentTurnResult)}
              </Typography>
            </Box>

            {canShowLuckButton(currentTurnResult) && (
              <Box sx={{ textAlign: 'center' }}>
                <ModalButton 
                  onClick={() => {
                    testLuck(currentTurnResult.result === 'player_hit');
                    handleBattleResultModalClose();
                  }}
                  sx={{ marginBottom: '12px' }}
                >
                  Testar a Sorte
                </ModalButton>
                <Typography variant="body2" sx={{ 
                  color: '#8B4513',
                  fontStyle: 'italic',
                  fontSize: '14px'
                }}>
                  {currentTurnResult.result === 'player_hit' 
                    ? 'Teste sua sorte para aumentar o dano causado ao inimigo!'
                    : 'Teste sua sorte para reduzir o dano sofrido!'
                  }
                </Typography>
              </Box>
            )}

            {!canShowLuckButton(currentTurnResult) && (
              <Box sx={{ textAlign: 'center' }}>
                <ModalButton onClick={handleBattleResultModalClose}>
                  Continuar
                </ModalButton>
              </Box>
            )}
          </BattleModal>
        </>
      )}
    </BattleContainer>
  );
});

export default BattleSystem;
