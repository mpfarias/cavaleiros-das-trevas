import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useClickSound } from '../hooks/useClickSound';
import { GameAlert } from './ui/GameAlert';
import DiceRollModal3D from './ui/DiceRollModal3D';
import GameOverScreen from './GameOverScreen';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.8); }
`;

// Animação específica para modais - apenas fade in/out sem transform
const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Animações para vitória
const victoryTitle = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(1deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const enemyFadeOut = keyframes`
  0% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(0.8) rotate(5deg); }
  100% { opacity: 0; transform: scale(0.6) rotate(10deg); }
`;

const pathOptionsFadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
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
  animation: `${modalFadeIn} 0.3s ease-out`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  // Garantir que o modal sempre fique centralizado
  transformOrigin: 'center center'
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
  animation: `${modalFadeIn} 0.3s ease-out`
});

// Botão do modal
const ModalButton = styled(Button)({
  padding: '12px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #8B4513',
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
    outline: '2px solid #8B4513',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#8B4513',
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
  finalDamage?: number; // Dano real final após teste de sorte
  luckTestApplied?: boolean; // Se o teste de sorte foi aplicado
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
  const [showPlayerResultModal, setShowPlayerResultModal] = useState(false);
  const [showBattleResultModal, setShowBattleResultModal] = useState(false);
  const [currentTurnResult, setCurrentTurnResult] = useState<TurnResult | null>(null);
  
  // Estados para teste de sorte
  const [showLuckDiceModal, setShowLuckDiceModal] = useState(false);
  const [luckTestType, setLuckTestType] = useState<'damage' | 'reduction' | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

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
      
      // Tocar áudio de vitória
      const victoryAudio = new Audio('/src/assets/sounds/male-scream.wav');
      victoryAudio.volume = 0.7;
      victoryAudio.play().catch(console.error);
      
      setTimeout(() => {
        setBattleState('victory');
        setShowVictoryModal(true);
        onVictory();
      }, 2500);
    } else if (playerForca <= 0) {
      setBattleState('defeat');
      setShowGameOver(true);
      onDefeat();
    }
  }, [enemyForca, playerForca, onVictory, onDefeat]);

  const startBattle = useCallback(() => {
    console.log('🚀 START BATTLE - Iniciando batalha');
    playClick();
    setBattleState('battle');
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
      damage,
      finalDamage: damage, // Inicialmente igual ao dano base
      luckTestApplied: false
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
      setShowPlayerResultModal(true);
    }
    setDiceModalOpen(false);
  }, [dicePhase]);

  const testLuck = useCallback((forDamage: boolean) => {
    playClick();
    
    if (!ficha?.sorte?.atual || ficha.sorte.atual <= 0) {
      setLuckResult('Você não tem sorte suficiente para testar!');
      setShowLuckAlert(true);
      return;
    }

    // Configura o tipo de teste de sorte e abre a modal de dados
    setLuckTestType(forDamage ? 'damage' : 'reduction');
    setShowLuckDiceModal(true);
  }, [ficha, playClick]);

  const handleLuckDiceComplete = useCallback((_dice: number[], total: number) => {
    if (!luckTestType) return;
    
    // Consome 1 ponto de sorte
    console.log(`🎲 [TESTE DE SORTE] Sorte ANTES da subtração: ${ficha.sorte.atual}`);
    
    const updatedFicha = { ...ficha };
    updatedFicha.sorte.atual = Math.max(0, ficha.sorte.atual - 1);
    onUpdateFicha(updatedFicha);
    
    console.log(`🎲 [TESTE DE SORTE] Sorte DEPOIS da subtração: ${updatedFicha.sorte.atual}`);

    // Teste de sorte: se o total for igual ou MENOR que a sorte ATUAL do jogador, é sucesso
    console.log(`🎲 [TESTE DE SORTE] Dados: ${total}, Sorte atual: ${ficha.sorte.atual}`);
    console.log(`🎲 [TESTE DE SORTE] ${total} <= ${ficha.sorte.atual}? ${total <= ficha.sorte.atual}`);
    
    const isSuccess = total <= ficha.sorte.atual;
    
    if (luckTestType === 'damage') {
      if (isSuccess) {
        console.log(`🎯 [TESTE DE SORTE] SUCESSO! Dados ${total} <= Sorte ${ficha.sorte.atual}`);
        // Regra 2: Dano dobrado - ao invés de 2 pontos, o inimigo perde 4 pontos
        // Como já perdeu 2 pontos no turno, aplicamos +2 pontos adicionais
        setEnemyForca(prev => Math.max(0, prev - 2));
        setLuckResult(`Sorte! Dados: ${total} - Dano dobrado! -2 FORÇA adicional do inimigo (Total: 4 pontos)`);
        
        // Atualizar o histórico com o dano final
        setTurnHistory(prev => prev.map(turn => 
          turn.turn === currentTurn ? { ...turn, finalDamage: 4, luckTestApplied: true } : turn
        ));
      } else {
        console.log(`🎯 [TESTE DE SORTE] FALHA! Dados ${total} > Sorte ${ficha.sorte.atual}`);
        // Regra 3: Se falhar no teste de sorte para dano, o inimigo perde apenas 1 ponto
        // Como já perdeu 2 pontos no turno, revertemos +1 ponto
        setEnemyForca(prev => Math.min(enemy.forca, prev + 1));
        setLuckResult(`Falha! Dados: ${total} - Dano reduzido! Inimigo perde apenas 1 ponto de FORÇA`);
        
        // Atualizar o histórico com o dano final
        setTurnHistory(prev => prev.map(turn => 
          turn.turn === currentTurn ? { ...turn, finalDamage: 1, luckTestApplied: true } : turn
        ));
      }
    } else {
      if (isSuccess) {
        // Regra 4: Se o teste de sorte para redução for bem-sucedido, o jogador perde apenas 1 ponto
        // Como já perdeu 2 pontos no turno, recuperamos +1 ponto
        const recoveredForca = Math.min(ficha.forca.inicial, playerForca + 1);
        updatedFicha.forca.atual = recoveredForca;
        onUpdateFicha(updatedFicha);
        setLuckResult(`Sorte! Dados: ${total} - Dano reduzido! +1 FORÇA recuperada (Total perdido: 1 ponto)`);
        
        // Atualizar o histórico com o dano final
        setTurnHistory(prev => prev.map(turn => 
          turn.turn === currentTurn ? { ...turn, finalDamage: 1, luckTestApplied: true } : turn
        ));
      } else {
        // Regra 5: Se falhar no teste de sorte para redução, o jogador perde 3 pontos
        // Como já perdeu 2 pontos no turno, aplicamos +1 ponto adicional
        updatedFicha.forca.atual = Math.max(0, playerForca - 1);
        onUpdateFicha(updatedFicha);
        setLuckResult(`Falha! Dados: ${total} - Dano aumentado! +1 FORÇA perdida (Total perdido: 3 pontos)`);
        
        // Atualizar o histórico com o dano final
        setTurnHistory(prev => prev.map(turn => 
          turn.turn === currentTurn ? { ...turn, finalDamage: 3, luckTestApplied: true } : turn
        ));
      }
    }

    setShowLuckDiceModal(false);
    setLuckTestType(null);
    setShowLuckAlert(true);
    setTimeout(() => setShowLuckAlert(false), 3000);
  }, [luckTestType, ficha, playerForca, onUpdateFicha]);

  const getTurnResultText = (turn: TurnResult) => {
    switch (turn.result) {
      case 'player_hit':
        if (turn.luckTestApplied && turn.finalDamage !== undefined) {
          return `Você acertou! Inimigo perde ${turn.finalDamage} pontos de FORÇA!`;
        }
        return `Você acertou! Inimigo perde ${turn.damage} pontos de FORÇA`;
      case 'enemy_hit':
        if (turn.luckTestApplied && turn.finalDamage !== undefined) {
          return `Inimigo acertou! Você perde ${turn.finalDamage} pontos de FORÇA!`;
        }
        return `Inimigo acertou! Você perde ${turn.damage} pontos de FORÇA`;
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

  const handlePlayerModalClose = useCallback(() => {
    setShowPlayerResultModal(false);
    setTimeout(() => {
      resolveTurn();
    }, 300);
  }, [resolveTurn]);

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
                     <Typography variant="body2" sx={{ color: '#d35656ff' }}>
             PERÍCIA: {enemy.pericia} | FORÇA: {enemyForca}
           </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Você
          </Typography>
                     <Typography variant="body2" sx={{ color: '#d35656ff' }}>
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
                             <Typography variant="body2" sx={{ color: '#d35656ff', fontSize: '12px' }}>
                 Você: {turn.playerRoll} + {playerPericia} = {turn.playerPower} | 
                 {enemy.nome}: {turn.enemyRoll} + {enemy.pericia} = {turn.enemyPower}
               </Typography>
                             <Typography variant="body2" sx={{ 
                 color: turn.result === 'player_hit' ? '#2b7e2eff' : 
                        turn.result === 'enemy_hit' ? '#F44336' : '#FF9800',
                 fontWeight: 'bold'
               }}>
                 {getTurnResultText(turn)}
               </Typography>
               
               {/* Indicador de teste de sorte aplicado */}
               {turn.luckTestApplied && (
                 <Typography variant="caption" sx={{ 
                   color: '#FFD700',
                   fontStyle: 'italic',
                   fontSize: '11px',
                   display: 'block',
                   marginTop: '4px'
                 }}>
                   Teste de sorte aplicado
                 </Typography>
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
               border: '2px solid #8B4513',
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
                 outline: '2px solid #8B4513',
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

             {/* Sistema de dados 3D para batalha */}
       <DiceRollModal3D
         open={diceModalOpen}
         numDice={2}
         onComplete={handleDiceComplete}
         title={dicePhase === 'enemy' ? `Dados para ${enemy.nome}` : 'Seus dados'}
       />

       {/* Sistema de dados 3D para teste de sorte */}
       <DiceRollModal3D
         open={showLuckDiceModal}
         numDice={2}
         onComplete={handleLuckDiceComplete}
         title={luckTestType === 'damage' ? 'Teste de Sorte - Dano Extra' : 'Teste de Sorte - Reduzir Dano'}
       />

      {/* Alertas */}
      {showLuckAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showLuckAlert}>
         {luckResult}
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
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <ModalButton onClick={handleEnemyModalClose}>
                Lançar Dados para Você
              </ModalButton>
            </Box>
          </BattleModal>
        </>
      )}

      {/* Modal 2: Resultado do jogador */}
      {showPlayerResultModal && (
        <>
          <ModalOverlay onClick={handlePlayerModalClose} />
          <BattleModal>
            <Typography variant="h5" sx={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: '#8B4513',
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold'
            }}>
              Seu Poder de Ataque
            </Typography>
            
            <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
              <Typography variant="h4" sx={{ 
                color: '#4CAF50',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {playerRoll} + {playerPericia} = {playerRoll! + playerPericia}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <ModalButton onClick={handlePlayerModalClose}>
                Ver Resultado da Batalha
              </ModalButton>
            </Box>
          </BattleModal>
        </>
      )}

      {/* Modal 3: Resultado da batalha */}
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
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {currentTurnResult.result === 'player_hit' 
                    ? 'Teste sua sorte para aumentar o dano causado ao inimigo!'
                    : 'Teste sua sorte para reduzir o dano sofrido!'
                  }
                </Typography>
                                 <ModalButton 
                   onClick={handleBattleResultModalClose}
                   sx={{
                     background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                     borderColor: '#8B4513',
                     '&:hover': {
                       background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(179,18,18,0.8) 100%)'
                     }
                   }}
                 >
                   Ok
                 </ModalButton>
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

      {/* Modal de Vitória */}
      {showVictoryModal && (
        <>
          <ModalOverlay onClick={() => {}} />
          <BattleModal>
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              marginBottom: '32px',
              color: '#FFD700',
              fontFamily: '"Cinzel", serif',
              fontWeight: 'bold',
              textShadow: '0 4px 8px rgba(0,0,0,0.8)',
              animation: 'victoryTitle 2s ease-in-out infinite alternate'
            }}>
              🏆 VITÓRIA! 🏆
            </Typography>
            
            {/* Imagem do inimigo com fade out */}
            <Box sx={{ 
              textAlign: 'center', 
              marginBottom: '32px',
              animation: 'enemyFadeOut 3s ease-out forwards'
            }}>
              <img 
                src={enemy.imagem} 
                alt={enemy.nome}
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '12px',
                  border: '3px solid #8B4513'
                }}
              />
              <Typography variant="h6" sx={{ 
                marginTop: '16px',
                color: '#8B4513',
                fontFamily: '"Cinzel", serif',
                fontWeight: 'bold'
              }}>
                {enemy.nome} foi derrotado!
              </Typography>
            </Box>

            {/* Opções de caminho */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              animation: 'pathOptionsFadeIn 1s ease-in 3s both'
            }}>
              <Typography variant="h6" sx={{ 
                textAlign: 'center',
                color: '#8B4513',
                fontFamily: '"Cinzel", serif',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Escolha seu caminho para escapar da cidade:
              </Typography>
              
              <ModalButton 
                onClick={() => {
                  playClick();
                  setShowVictoryModal(false);
                  // Redirecionar para tela 272 (Porta Sul)
                  window.location.href = '/screen/272';
                }}
                sx={{ marginBottom: '8px' }}
              >
                🗺️ Porta Sul - Estrada do Comércio Principal
              </ModalButton>
              
              <ModalButton 
                onClick={() => {
                  playClick();
                  setShowVictoryModal(false);
                  // Redirecionar para tela 60 (Porta Leste)
                  window.location.href = '/screen/60';
                }}
                sx={{ marginBottom: '8px' }}
              >
                🗺️ Porta Leste
              </ModalButton>
            </Box>
          </BattleModal>
        </>
      )}

      {/* Tela de Game Over */}
      {showGameOver && (
        <GameOverScreen
          onRestart={() => {
            setShowGameOver(false);
            window.location.reload();
          }}
          onMainMenu={() => {
            setShowGameOver(false);
            window.location.href = '/';
          }}
          deathReason="Você foi derrotado em combate"
          deathLocation={`Batalha contra ${enemy.nome}`}
          characterStats={ficha}
        />
      )}
    </BattleContainer>
  );
});

export default BattleSystem;
