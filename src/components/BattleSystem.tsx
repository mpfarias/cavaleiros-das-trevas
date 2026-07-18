import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useClickSound } from '../hooks/useClickSound';
import { useCombat } from '../hooks/useCombat';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import DiceRollModal3D from './ui/DiceRollModal3D';
import GameOverScreen from './GameOverScreen';
import type { Ficha } from '../types';
import { getAttackModifier, getCombatAttackPower, getCombatPericia, hasEquippedWeapon } from '../utils/weapon';
import { getDesiredIncomingDamage, getPlayerHitDamage } from '../utils/combatDamage';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Animação específica para modais - apenas fade in/out sem transform
const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
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
  customDamage?: number; // Dano customizado (padrão é 2)
  disableLuckTest?: boolean; // Desabilitar teste de sorte
  ignoreArmor?: boolean; // Ignorar armadura
  attacksPerTurn?: number; // Número de ataques por turno (padrão é 1)
}

interface BattleSystemProps {
  enemy: Enemy;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onVictory: () => void;
  onDefeat: () => void;
  onGoToScreen?: (screenId: number) => void; // Adicionar prop para navegação
  beforeTurnStart?: () => Promise<void>; // Callback executado antes de cada turno iniciar
  ignoreEnemyForcaVictory?: boolean; // Ignorar vitória automática por FORÇA do inimigo
  onTurnResolved?: (turnResult: TurnResult) => void; // Callback ao finalizar um turno
  getTurnResultTextOverride?: (turn: TurnResult) => string | null; // Texto customizado por turno
  getTurnResultColorOverride?: (turn: TurnResult) => string | null; // Cor customizada do resultado
  hideLuckButton?: boolean; // Ocultar botão de testar sorte
  hideDamageText?: boolean; // Ocultar textos de dano
  forcePlayerHitText?: string; // Texto customizado para acerto do jogador
  forceEnemyHitText?: string; // Texto customizado para acerto do inimigo
  luckHelpTextOverride?: string; // Texto customizado abaixo do botão de sorte
  luckEffectOverride?: (params: { success: boolean; total: number; type: 'damage' | 'reduction' }) => string; // Resultado customizado da sorte
  disablePlayerForcaLoss?: boolean; // Não reduzir FORÇA do jogador
  ignorePlayerForcaDefeat?: boolean; // Ignorar derrota por FORÇA do jogador
  /** Botão opcional exibido após cada turno (modal de resultado e entre turnos). */
  abandonBattleLabel?: string;
  onAbandonBattle?: () => void;
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
  luckTestSuccess?: boolean; // Se o teste de sorte foi bem-sucedido
  enemyMultipleRolls?: number[]; // Múltiplas rolagens do inimigo (para attacksPerTurn > 1)
  multipleResults?: Array<{ enemyRoll: number; enemyPower: number; result: 'player_hit' | 'enemy_hit' | 'dodge'; damage: number }>; // Resultados individuais de cada ataque
}

export type BattleSystemHandle = {
  startBattle: () => void;
  currentTurn: number;
};

const BattleSystem = forwardRef<BattleSystemHandle, BattleSystemProps>(({
  enemy,
  ficha,
  onUpdateFicha,
  onVictory,
  onDefeat,
  onGoToScreen,
  beforeTurnStart,
  ignoreEnemyForcaVictory,
  onTurnResolved,
  getTurnResultTextOverride,
  getTurnResultColorOverride,
  hideLuckButton,
  hideDamageText,
  forcePlayerHitText,
  forceEnemyHitText,
  luckHelpTextOverride,
  luckEffectOverride,
  disablePlayerForcaLoss,
  ignorePlayerForcaDefeat,
  abandonBattleLabel,
  onAbandonBattle
}, ref) => {

  const playClick = useClickSound(0.2);
  const { applyDamageWithArmor } = useCombat();

  const [battleState, setBattleState] = useState<'idle' | 'rolling' | 'battle' | 'enemyDefeated' | 'victory' | 'defeat'>('idle');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [enemyForca, setEnemyForca] = useState(enemy.forca);
  const [turnHistory, setTurnHistory] = useState<TurnResult[]>([]);
  const [showLuckAlert, setShowLuckAlert] = useState(false);
  const [luckResult, setLuckResult] = useState<string>('');
   
  // Estados para o sistema de dados
  const [dicePhase, setDicePhase] = useState<'enemy' | 'enemy2' | 'player'>('enemy');
  const [enemyRoll, setEnemyRoll] = useState<number | null>(null);
  const [enemyRoll2, setEnemyRoll2] = useState<number | null>(null); // Segunda rolagem do inimigo (se attacksPerTurn > 1)
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
  const [deferTurnResolve, setDeferTurnResolve] = useState(false);
  const [showArmorBrokenAlert, setShowArmorBrokenAlert] = useState(false);
  const [armorBrokenMessage, setArmorBrokenMessage] = useState('');

  const playerPericia = getCombatPericia(ficha);
  const attackModifier = getAttackModifier(ficha);
  const isUnarmed = !hasEquippedWeapon(ficha);
  const playerForca = ficha?.forca?.atual || 0;

  const formatPlayerPower = (roll: number, power: number) => {
    const modText = attackModifier !== 0 ? ` ${attackModifier > 0 ? '+' : '−'} ${Math.abs(attackModifier)}` : '';
    return `${roll} + ${playerPericia}${modText} = ${power}`;
  };

  const applyIncomingDamageToPlayer = useCallback((
    workingFicha: Ficha,
    incomingDamage: number,
    onArmorBroken?: (armorName: string) => void
  ): { ficha: Ficha; damageDealt: number } => {
    if (disablePlayerForcaLoss) {
      return { ficha: workingFicha, damageDealt: 0 };
    }

    if (enemy.ignoreArmor) {
      const newForca = Math.max(0, workingFicha.forca.atual - incomingDamage);
      const damageDealt = workingFicha.forca.atual - newForca;
      return {
        ficha: {
          ...workingFicha,
          forca: { ...workingFicha.forca, atual: newForca }
        },
        damageDealt
      };
    }

    const { ficha: updatedFicha, armorBroken } = applyDamageWithArmor(workingFicha, incomingDamage, 'forca');
    const damageDealt = workingFicha.forca.atual - updatedFicha.forca.atual;

    if (armorBroken && onArmorBroken) {
      onArmorBroken(armorBroken);
    }

    return { ficha: updatedFicha, damageDealt };
  }, [disablePlayerForcaLoss, enemy.ignoreArmor, applyDamageWithArmor]);

  const handleArmorBroken = useCallback((armorName: string) => {
    setArmorBrokenMessage(`Sua ${armorName} absorveu o último golpe e se despedaçou! Foi removida da bolsa.`);
    setShowArmorBrokenAlert(true);
    setTimeout(() => setShowArmorBrokenAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, []);

  // Verificar condições de vitória/derrota
  useEffect(() => {
    if (!ignoreEnemyForcaVictory && enemyForca <= 0) {
      setBattleState('enemyDefeated');
      
      // Tocar áudio de vitória
      const victoryAudio = new Audio('/src/assets/sounds/male-scream.wav');
      victoryAudio.volume = 0.7;
      victoryAudio.play().catch(console.error);
      
      setTimeout(() => {
        setBattleState('victory');
        onVictory();
      }, 2500);
    } else if (!ignorePlayerForcaDefeat && playerForca <= 0) {
      setBattleState('defeat');
      onDefeat();
      if (onGoToScreen) {
        onGoToScreen(999);
      } else {
        setShowGameOver(true);
      }
    }
  }, [enemyForca, playerForca, onVictory, onDefeat, onGoToScreen, ignoreEnemyForcaVictory, ignorePlayerForcaDefeat]);

  const startBattle = useCallback(async () => {
    playClick();
    setBattleState('battle');
    setCurrentTurn(1);
    
    // Executar callback antes do turno, se existir
    if (beforeTurnStart) {
      await beforeTurnStart();
    }
    
    setDicePhase('enemy');
    setEnemyRoll(null);
    setEnemyRoll2(null);
    setPlayerRoll(null);
    setDiceModalOpen(true);
  }, [playClick, beforeTurnStart]);

  // Expõe a função startBattle para o componente pai
  useImperativeHandle(ref, () => ({
    startBattle: () => startBattle(),
    currentTurn,
  }), [startBattle, currentTurn]);

  const nextTurn = useCallback(async () => {
    playClick();
    setCurrentTurn(prev => prev + 1);
    
    // Executar callback antes do turno, se existir
    if (beforeTurnStart) {
      await beforeTurnStart();
    }
    
    setDicePhase('enemy');
    setEnemyRoll(null);
    setEnemyRoll2(null);
    setPlayerRoll(null);
    setDiceModalOpen(true);
  }, [playClick, beforeTurnStart]);

  const resolveTurn = useCallback(() => {
    
    if (enemyRoll === null || playerRoll === null) {
      return;
    }

    const playerPower = getCombatAttackPower(playerRoll, ficha);
    const weaponDamage = getPlayerHitDamage(ficha);
    const baseDamage = enemy.customDamage || 2;
    const hasMultipleAttacks = (enemy.attacksPerTurn && enemy.attacksPerTurn > 1) || false;

    // ⚠️ ATENÇÃO: Esta lógica de múltiplos ataques SÓ é ativada quando:
    // 1. O inimigo tem attacksPerTurn > 1 (hasMultipleAttacks = true)
    // 2. E a segunda rolagem existe (enemyRoll2 !== null)
    // Para inimigos normais (sem attacksPerTurn ou attacksPerTurn = 1), 
    // a batalha funciona normalmente no bloco 'else' abaixo
    if (hasMultipleAttacks && enemyRoll2 !== null) {
      const multipleResults = [];
      let totalPlayerDamage = 0;
      let playerWonAtLeastOnce = false;
      let workingFicha = ficha;

      // Primeira rolagem do inimigo
      const enemyPower1 = enemyRoll + enemy.pericia;
      if (playerPower > enemyPower1) {
        playerWonAtLeastOnce = true;
        multipleResults.push({
          enemyRoll: enemyRoll,
          enemyPower: enemyPower1,
          result: 'player_hit' as const,
          damage: weaponDamage
        });
      } else if (enemyPower1 > playerPower) {
        const { ficha: updatedFicha, damageDealt } = applyIncomingDamageToPlayer(workingFicha, baseDamage, handleArmorBroken);
        workingFicha = updatedFicha;
        totalPlayerDamage += damageDealt;
        multipleResults.push({
          enemyRoll: enemyRoll,
          enemyPower: enemyPower1,
          result: 'enemy_hit' as const,
          damage: damageDealt
        });
      } else {
        multipleResults.push({
          enemyRoll: enemyRoll,
          enemyPower: enemyPower1,
          result: 'dodge' as const,
          damage: 0
        });
      }

      // Segunda rolagem do inimigo
      const enemyPower2 = enemyRoll2 + enemy.pericia;
      if (playerPower > enemyPower2) {
        playerWonAtLeastOnce = true;
        multipleResults.push({
          enemyRoll: enemyRoll2,
          enemyPower: enemyPower2,
          result: 'player_hit' as const,
          damage: weaponDamage
        });
      } else if (enemyPower2 > playerPower) {
        const { ficha: updatedFicha, damageDealt } = applyIncomingDamageToPlayer(workingFicha, baseDamage, handleArmorBroken);
        workingFicha = updatedFicha;
        totalPlayerDamage += damageDealt;
        multipleResults.push({
          enemyRoll: enemyRoll2,
          enemyPower: enemyPower2,
          result: 'enemy_hit' as const,
          damage: damageDealt
        });
      } else {
        multipleResults.push({
          enemyRoll: enemyRoll2,
          enemyPower: enemyPower2,
          result: 'dodge' as const,
          damage: 0
        });
      }

      const totalEnemyDamage = playerWonAtLeastOnce ? weaponDamage : 0;
      if (playerWonAtLeastOnce) {
        setEnemyForca(prev => prev - weaponDamage);
      }

      if (totalPlayerDamage > 0) {
        onUpdateFicha(workingFicha);
      }
      
      // Determinar resultado geral
      let overallResult: TurnResult['result'];
      if (totalEnemyDamage > totalPlayerDamage) {
        overallResult = 'player_hit';
      } else if (totalPlayerDamage > totalEnemyDamage) {
        overallResult = 'enemy_hit';
      } else if (totalPlayerDamage === 0 && totalEnemyDamage === 0) {
        overallResult = 'dodge';
      } else {
        overallResult = 'enemy_hit'; // Empate com dano = inimigo vence
      }

      // O damage deve refletir apenas o dano do resultado (não soma ambos os lados)
      const resultDamage = overallResult === 'player_hit' ? totalEnemyDamage : 
                           overallResult === 'enemy_hit' ? totalPlayerDamage : 
                           0;

      const turnResult: TurnResult = {
        turn: currentTurn,
        playerRoll,
        enemyRoll, // Usar a primeira rolagem como principal
        playerPower,
        enemyPower: enemyPower1, // Usar o primeiro poder como principal
        result: overallResult,
        damage: resultDamage, // Apenas o dano relevante para o resultado
        finalDamage: resultDamage,
        luckTestApplied: false,
        enemyMultipleRolls: [enemyRoll, enemyRoll2],
        multipleResults
      };

      setTurnHistory(prev => [...prev, turnResult]);
      setCurrentTurnResult(turnResult);
      setShowBattleResultModal(true);
    } else {
      // Lógica padrão para um único ataque
      const enemyPower = enemyRoll + enemy.pericia;

      let result: TurnResult['result'];
      let damage = 0;

      if (playerPower > enemyPower) {
        result = 'player_hit';
        damage = weaponDamage;
        setEnemyForca(prev => prev - damage);
      } else if (enemyPower > playerPower) {
        result = 'enemy_hit';
        const { ficha: updatedFicha, damageDealt } = applyIncomingDamageToPlayer(ficha, baseDamage, handleArmorBroken);
        damage = damageDealt;
        if (damageDealt > 0) {
          onUpdateFicha(updatedFicha);
        }
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
        finalDamage: damage,
        luckTestApplied: false
      };

      setTurnHistory(prev => [...prev, turnResult]);
      setCurrentTurnResult(turnResult);
      setShowBattleResultModal(true);
    }
  }, [enemyRoll, enemyRoll2, playerRoll, enemy.pericia, enemy.attacksPerTurn, enemy.customDamage, currentTurn, ficha, onUpdateFicha, applyIncomingDamageToPlayer, handleArmorBroken]);

  const handleDiceComplete = useCallback((_dice: number[], total: number) => {
    if (dicePhase === 'enemy') {
      setEnemyRoll(total);
      // NÃO muda dicePhase ainda - será mudado em handleEnemyModalClose
      setShowEnemyResultModal(true);
    } else if (dicePhase === 'enemy2') {
      setEnemyRoll2(total);
      // NÃO muda dicePhase ainda - será mudado em handleEnemyModalClose
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
      setTimeout(() => setShowLuckAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      return;
    }

    // Configura o tipo de teste de sorte e abre a modal de dados
    setLuckTestType(forDamage ? 'damage' : 'reduction');
    setShowLuckDiceModal(true);
    setDeferTurnResolve(true);
  }, [ficha, playClick]);

  const handleLuckDiceComplete = useCallback((_dice: number[], total: number) => {
    if (!luckTestType) return;
    
    // Consome 1 ponto de sorte
    
    const updatedFicha = { ...ficha };
    updatedFicha.sorte.atual = Math.max(0, ficha.sorte.atual - 1);
    onUpdateFicha(updatedFicha);
    

    // Teste de sorte: se o total for igual ou MENOR que a sorte ATUAL do jogador, é sucesso
    
    const isSuccess = total <= ficha.sorte.atual;
    const luckFlags = luckTestType === 'damage'
      ? { playerLuck: true as const }
      : { enemyLuck: true as const };

    let finalDamage = currentTurnResult?.damage ?? 0;
    let defaultMessage = '';

    if (luckTestType === 'damage') {
      const alreadyDealt = currentTurnResult?.damage ?? getPlayerHitDamage(ficha);
      const desiredDamage = getPlayerHitDamage(ficha, isSuccess);
      const delta = desiredDamage - alreadyDealt;
      finalDamage = desiredDamage;

      if (delta !== 0) {
        setEnemyForca(prev => Math.max(0, Math.min(enemy.forca, prev - delta)));
      }

      defaultMessage = isSuccess
        ? `Sorte! Dados: ${total} — Inimigo perde ${desiredDamage} pontos de FORÇA no total`
        : `Você falhou no teste de Sorte! Dados: ${total} — Inimigo perde apenas ${desiredDamage} ponto${desiredDamage === 1 ? '' : 's'} de FORÇA`;
    } else {
      const rawIncoming = enemy.customDamage || 2;
      const alreadyDealt = currentTurnResult?.damage ?? getDesiredIncomingDamage(ficha, rawIncoming, { ignoreArmor: enemy.ignoreArmor });
      const desiredDamage = getDesiredIncomingDamage(ficha, rawIncoming, {
        ignoreArmor: enemy.ignoreArmor,
        luckTestSuccess: isSuccess,
      });
      const delta = desiredDamage - alreadyDealt;
      finalDamage = desiredDamage;

      if (delta !== 0 && !disablePlayerForcaLoss) {
        updatedFicha.forca.atual = Math.max(
          0,
          Math.min(ficha.forca.inicial, playerForca - delta),
        );
        onUpdateFicha(updatedFicha);
      }

      const recovered = delta < 0 ? Math.abs(delta) : 0;
      const extraLost = delta > 0 ? delta : 0;
      defaultMessage = isSuccess
        ? `Sorte! Dados: ${total} — Dano reduzido! ${recovered > 0 ? `+${recovered} FORÇA recuperada. ` : ''}Total perdido: ${desiredDamage} ponto${desiredDamage === 1 ? '' : 's'}`
        : `Você falhou no teste de Sorte! Dados: ${total} — Dano aumentado! ${extraLost > 0 ? `+${extraLost} FORÇA perdida. ` : ''}Total perdido: ${desiredDamage} ponto${desiredDamage === 1 ? '' : 's'}`;
    }

    // luckEffectOverride só personaliza a mensagem; o efeito mecânico acima sempre aplica
    setLuckResult(
      luckEffectOverride
        ? luckEffectOverride({ success: isSuccess, total, type: luckTestType })
        : defaultMessage
    );

    setTurnHistory(prev => prev.map(turn => 
      turn.turn === currentTurn ? { ...turn, ...luckFlags, finalDamage, luckTestApplied: true, luckTestSuccess: isSuccess } : turn
    ));
    setCurrentTurnResult(prev => (
      prev && prev.turn === currentTurn ? { ...prev, ...luckFlags, finalDamage, luckTestApplied: true, luckTestSuccess: isSuccess } : prev
    ));

    setShowLuckDiceModal(false);
    setLuckTestType(null);
    setShowLuckAlert(true);
    setTimeout(() => setShowLuckAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    if (deferTurnResolve && onTurnResolved && currentTurnResult && currentTurnResult.turn === currentTurn) {
      onTurnResolved({
        ...currentTurnResult,
        luckTestApplied: true,
        luckTestSuccess: isSuccess
      });
      setCurrentTurnResult(null);
      setDeferTurnResolve(false);
    }
  }, [luckTestType, ficha, playerForca, onUpdateFicha, currentTurn, enemy.forca, enemy.customDamage, enemy.ignoreArmor, luckEffectOverride, deferTurnResolve, onTurnResolved, currentTurnResult, disablePlayerForcaLoss]);

  const getTurnResultText = (turn: TurnResult) => {
    if (getTurnResultTextOverride) {
      const override = getTurnResultTextOverride(turn);
      if (override) {
        return override;
      }
    }
    switch (turn.result) {
      case 'player_hit':
        if (forcePlayerHitText) {
          return forcePlayerHitText;
        }
        if (turn.luckTestApplied && turn.finalDamage !== undefined) {
          return `Você acertou! Inimigo perde ${turn.finalDamage} pontos de FORÇA!`;
        }
        if (hideDamageText) {
          return 'Você acertou!';
        }
        return `Você acertou! Inimigo perde ${turn.damage} pontos de FORÇA`;
      case 'enemy_hit':
        if (forceEnemyHitText) {
          return forceEnemyHitText;
        }
        if (turn.luckTestApplied && turn.finalDamage !== undefined) {
          return `Inimigo acertou! Você perde ${turn.finalDamage} pontos de FORÇA!`;
        }
        if (hideDamageText) {
          return 'Inimigo acertou!';
        }
        return `Inimigo acertou! Você perde ${turn.damage} pontos de FORÇA`;
      case 'dodge':
        return 'Ambos desviaram!';
      default:
        return '';
    }
  };

  const getTurnResultColor = (turn: TurnResult) => {
    if (getTurnResultColorOverride) {
      const override = getTurnResultColorOverride(turn);
      if (override) {
        return override;
      }
    }
    return turn.result === 'player_hit'
      ? '#4CAF50'
      : turn.result === 'enemy_hit'
        ? '#B31212'
        : '#FF9800';
  };

  const canShowLuckButton = (turn: TurnResult) => {
    if (hideLuckButton) {
      return false;
    }
    // Se o inimigo desabilita teste de sorte, nunca mostra o botão
    if (enemy.disableLuckTest) {
      return false;
    }
    return ((turn.result === 'player_hit' && !turn.playerLuck) ||
           (turn.result === 'enemy_hit' && !turn.enemyLuck)) &&
           !turn.luckTestApplied;
  };

  const isTurnInteractionBlocked =
    diceModalOpen ||
    showEnemyResultModal ||
    showPlayerResultModal ||
    showBattleResultModal ||
    showLuckDiceModal;

  const handleEnemyModalClose = useCallback(() => {
    setShowEnemyResultModal(false);
    setTimeout(() => {
      // Se é a primeira rolagem do inimigo e ele ataca múltiplas vezes, rolar novamente
      if (dicePhase === 'enemy' && enemy.attacksPerTurn && enemy.attacksPerTurn > 1) {
        setDicePhase('enemy2');
        setDiceModalOpen(true);
      } else if (dicePhase === 'enemy2') {
        // Segunda rolagem completa, agora é a vez do jogador
        setDicePhase('player');
        setDiceModalOpen(true);
      } else {
        // Rolagem única do inimigo completa, vez do jogador
        setDicePhase('player');
        setDiceModalOpen(true);
      }
    }, 300);
  }, [dicePhase, enemy.attacksPerTurn]);

  const handlePlayerModalClose = useCallback(() => {
    setShowPlayerResultModal(false);
    setTimeout(() => {
      resolveTurn();
    }, 300);
  }, [resolveTurn]);

  const handleBattleResultModalClose = useCallback(() => {
    setShowBattleResultModal(false);
    if (!deferTurnResolve && onTurnResolved && currentTurnResult) {
      onTurnResolved(currentTurnResult);
      setCurrentTurnResult(null);
    }
    setBattleState('battle');
  }, [onTurnResolved, currentTurnResult, deferTurnResolve]);

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
             PERÍCIA: {playerPericia}{isUnarmed ? ' (-1 sem arma)' : ''}{attackModifier !== 0 ? ` | ATAQUE: ${attackModifier > 0 ? '+' : ''}${attackModifier}` : ''} | FORÇA: {playerForca}
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
              
              {/* Mostrar múltiplos ataques se existirem */}
              {turn.multipleResults && turn.multipleResults.length > 0 ? (
                <>
                  <Typography variant="body2" sx={{ color: '#d35656ff', fontSize: '12px', marginTop: '4px' }}>
                    Você: {formatPlayerPower(turn.playerRoll, turn.playerPower)}
                  </Typography>
                  {turn.multipleResults.map((attack, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: '#d35656ff', fontSize: '11px', marginLeft: '8px' }}>
                      {idx + 1}º Ataque: {attack.enemyRoll} + {enemy.pericia} = {attack.enemyPower}
                    </Typography>
                  ))}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: '#d35656ff', fontSize: '12px' }}>
                  Você: {formatPlayerPower(turn.playerRoll, turn.playerPower)} | 
                  {enemy.nome}: {turn.enemyRoll} + {enemy.pericia} = {turn.enemyPower}
                </Typography>
              )}
              
              <Typography variant="body2" sx={{ 
                color: getTurnResultColor(turn),
                fontWeight: 'bold',
                marginTop: '4px'
              }}>
                {getTurnResultText(turn)}
              </Typography>
               
              {/* Indicador de teste de sorte aplicado */}
              {turn.luckTestApplied && (
                <Typography variant="caption" sx={{ 
                  color: turn.luckTestSuccess ? '#4CAF50' : '#F44336',
                  fontStyle: 'italic',
                  fontSize: '11px',
                  display: 'block',
                  marginTop: '4px'
                }}>
                  {turn.luckTestSuccess ? '✓ Teste de sorte: SUCESSO' : '✗ Teste de sorte: FALHA'}
                </Typography>
              )}
              
            </Box>
          ))}
        </TurnHistory>
      )}

      {/* Botão de próximo turno */}
      {battleState === 'battle' && (
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                     <Button
             onClick={nextTurn}
             disabled={isTurnInteractionBlocked}
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

          {abandonBattleLabel && onAbandonBattle && turnHistory.length > 0 && (
            <Button
              onClick={() => {
                playClick();
                onAbandonBattle();
              }}
              disabled={isTurnInteractionBlocked}
              variant="outlined"
              sx={{
                padding: '12px 24px',
                border: '2px solid #8B4513',
                color: '#8B4513',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(139,69,19,0.1)',
                  borderColor: '#B31212',
                  color: '#B31212',
                },
              }}
            >
              {abandonBattleLabel}
            </Button>
          )}
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
        <GameAlert sx={{ top: '120px' }} visible={showLuckAlert} onClose={() => setShowLuckAlert(false)}>
         {luckResult}
        </GameAlert>
      )}

      {showArmorBrokenAlert && (
        <GameAlert sx={{ top: '180px' }} visible={showArmorBrokenAlert} onClose={() => setShowArmorBrokenAlert(false)}>
          {armorBrokenMessage}
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
              {dicePhase === 'enemy' && enemy.attacksPerTurn && enemy.attacksPerTurn > 1
                ? '1º Ataque do'
                : dicePhase === 'enemy2' 
                ? '2º Ataque do' 
                : 'Poder de Ataque do'} {enemy.nome}
            </Typography>
            
            <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
              <Typography variant="h4" sx={{ 
                color: '#B31212',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {dicePhase === 'enemy2' && enemyRoll2 !== null 
                  ? `${enemyRoll2} + ${enemy.pericia} = ${enemyRoll2 + enemy.pericia}`
                  : `${enemyRoll} + ${enemy.pericia} = ${enemyRoll! + enemy.pericia}`
                }
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <ModalButton onClick={handleEnemyModalClose}>
                {dicePhase === 'enemy' && enemy.attacksPerTurn && enemy.attacksPerTurn > 1 
                  ? 'Rolar 2º Ataque do Inimigo'
                  : 'Lançar Dados para Você'
                }
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
                {formatPlayerPower(playerRoll!, playerRoll! + playerPericia + attackModifier)}
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
              {currentTurnResult.multipleResults && currentTurnResult.multipleResults.length > 0 ? (
                // Mostrar múltiplos resultados para ataques múltiplos
                <>
                  <Typography variant="body2" sx={{ 
                    textAlign: 'center', 
                    marginBottom: '16px', 
                    fontWeight: 'bold',
                    color: '#8B4513'
                  }}>
                    Você: {formatPlayerPower(currentTurnResult.playerRoll, currentTurnResult.playerPower)}
                  </Typography>
                  
                  {currentTurnResult.multipleResults.map((attackResult, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      marginBottom: '12px',
                      padding: '12px',
                      background: 'rgba(139,69,19,0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(139,69,19,0.2)'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#B31212', 
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        {index + 1}º Ataque: {attackResult.enemyRoll} + {enemy.pericia} = {attackResult.enemyPower}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: attackResult.result === 'player_hit' ? '#4CAF50' : 
                               attackResult.result === 'enemy_hit' ? '#B31212' : '#FF9800',
                        fontWeight: 'bold'
                      }}>
                        {attackResult.result === 'player_hit' 
                          ? `✓ Você acertou!`
                          : attackResult.result === 'enemy_hit'
                          ? `✗ Você foi atingido! (${attackResult.damage} de dano)`
                          : '○ Empate! Ambos se defenderam'
                        }
                      </Typography>
                    </Box>
                  ))}
                  
                  <Typography variant="h6" sx={{ 
                    textAlign: 'center',
                    color: getTurnResultColor(currentTurnResult),
                    fontWeight: 'bold',
                    marginTop: '16px'
                  }}>
                    {getTurnResultText(currentTurnResult)}
                  </Typography>
                </>
              ) : (
                // Mostrar resultado único padrão
                <>
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
                      Você: {formatPlayerPower(currentTurnResult.playerRoll, currentTurnResult.playerPower)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    textAlign: 'center',
                    color: getTurnResultColor(currentTurnResult),
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}>
                    {getTurnResultText(currentTurnResult)}
                  </Typography>
                </>
              )}
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
                  {luckHelpTextOverride ?? (
                    currentTurnResult.result === 'player_hit' 
                      ? 'Teste sua sorte para aumentar o dano causado ao inimigo!'
                      : 'Teste sua sorte para reduzir o dano sofrido!'
                  )}
                </Typography>
                                 <ModalButton 
                   onClick={handleBattleResultModalClose}
                   sx={{
                     background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
                     borderColor: '#8B4513',
                     marginBottom: abandonBattleLabel && onAbandonBattle ? '12px' : 0,
                     '&:hover': {
                       background: 'linear-gradient(135deg, rgba(139,0,0,0.9) 0%, rgba(179,18,18,0.8) 100%)'
                     }
                   }}
                 >
                   Ok
                 </ModalButton>
                 {abandonBattleLabel && onAbandonBattle && (
                   <ModalButton
                     onClick={() => {
                       playClick();
                       setShowBattleResultModal(false);
                       onAbandonBattle();
                     }}
                     sx={{
                       background: 'linear-gradient(135deg, rgba(139,69,19,0.85) 0%, rgba(100,50,20,0.8) 100%)',
                       borderColor: '#8B4513',
                     }}
                   >
                     {abandonBattleLabel}
                   </ModalButton>
                 )}
              </Box>
            )}

            {!canShowLuckButton(currentTurnResult) && (
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <ModalButton onClick={handleBattleResultModalClose}>
                  Continuar
                </ModalButton>
                {abandonBattleLabel && onAbandonBattle && (
                  <ModalButton
                    onClick={() => {
                      playClick();
                      setShowBattleResultModal(false);
                      onAbandonBattle();
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(139,69,19,0.85) 0%, rgba(100,50,20,0.8) 100%)',
                      borderColor: '#8B4513',
                    }}
                  >
                    {abandonBattleLabel}
                  </ModalButton>
                )}
              </Box>
            )}
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
          deathReason="Você foi derrotado em combate"
          deathLocation={`Batalha contra ${enemy.nome}`}
          characterStats={ficha}
        />
      )}
    </BattleContainer>
  );
});

export default BattleSystem;
