import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import type { Ficha } from '../types';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const diceRoll = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1.2); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
`;

// Styled Components
const GameContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: `
    linear-gradient(135deg, #1a0f08 0%, #2c1810 25%, #4a2c1a 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.2) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  overflow: 'auto'
});

const GameCard = styled(Card)({
  maxWidth: '800px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 50%, rgba(139,69,19,0.9) 100%)
  `,
  border: '3px solid #D2B48C',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 0 0 1px rgba(218,165,32,0.3)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`
});

const GameTitle = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: 'clamp(20px, 3vw, 32px)',
  fontWeight: '900',
  color: '#FFD700',
  textAlign: 'center',
  marginBottom: '24px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  letterSpacing: '2px',
  textTransform: 'uppercase'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#F5DEB3',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  '& strong': {
    color: '#FFD700',
    fontWeight: '700'
  }
});

const DiceContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  margin: '32px 0',
  padding: '24px',
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '12px',
  border: '2px solid #8B4513'
});

const DiceBox = styled(Box)<{ isRolling?: boolean }>(({ isRolling }) => ({
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, #F5DEB3 0%, #D2B48C 100%)',
  border: '3px solid #8B4513',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '36px',
  fontWeight: '900',
  color: '#8B4513',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  animation: isRolling ? `${diceRoll} 1s ease-in-out` : 'none',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(245,222,179,0.5)'
  }
}));

const ActionButton = styled(Button)({
  padding: '12px 24px',
  background: 'linear-gradient(135deg, rgba(218,165,32,0.9) 0%, rgba(255,215,0,0.8) 100%)',
  color: '#4a2c00',
  border: '2px solid #FFD700',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '8px',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255,215,0,1) 0%, rgba(218,165,32,0.9) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255,215,0,0.4)'
  }
});

const BackButton = styled(Button)({
  position: 'absolute',
  top: '20px',
  left: '20px',
  padding: '12px 20px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '600',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700'
  }
});

interface BartolphGameScreenProps {
  ficha: Ficha;
  onGameResult: (won: boolean, goldChange: number) => void;
  onBackToRoyal: () => void;
}

const BartolphGameScreen: React.FC<BartolphGameScreenProps> = ({ 
  ficha, 
  onGameResult, 
  onBackToRoyal 
}) => {
  const [gameState, setGameState] = useState<'intro' | 'betting' | 'rolling' | 'result'>('intro');
  const [playerDice, setPlayerDice] = useState<number>(0);
  const [bartolphDice, setBartolphDice] = useState<number>(0);
  const [bet, setBet] = useState<number>(10);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);

  const currentGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const startGame = () => {
    setGameState('betting');
  };

  const placeBet = (amount: number) => {
    setBet(amount);
    setGameState('rolling');
  };

  const rollDices = () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const playerRoll = rollDice();
      const bartolphRoll = rollDice();
      
      setPlayerDice(playerRoll);
      setBartolphDice(bartolphRoll);
      setIsRolling(false);
      
      const won = playerRoll > bartolphRoll;
      setGameResult(won ? 'won' : 'lost');
      setGameState('result');
    }, 1000);
  };

  const finishGame = () => {
    const goldChange = gameResult === 'won' ? bet : -bet;
    onGameResult(gameResult === 'won', goldChange);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'intro':
        return (
          <>
            <GameTitle>🎲 Desafio de Bartolph</GameTitle>
            <NarrativeText>
              <strong>Bartolph</strong> sorri com malícia enquanto retira dois dados de osso do bolso.
              <br/><br/>
              — O jogo é simples — diz ele, fazendo os dados dançarem em sua mão. — <strong>Cada um rola um dado</strong>. Quem tirar o maior número, <strong>ganha</strong>. 
              <br/><br/>
              — Você escolhe quanto quer apostar. Se ganhar, eu pago o <strong>dobro</strong>. Se perder... bem, você já sabe como funciona.
              <br/><br/>
              Bartolph te observa com olhos astutos, claramente confiante em sua sorte. <strong>Você tem {currentGold} moedas de ouro</strong> para apostar.
            </NarrativeText>
            <Box sx={{ textAlign: 'center' }}>
              <ActionButton onClick={startGame}>
                🎯 Aceitar o Desafio
              </ActionButton>
            </Box>
          </>
        );

      case 'betting':
        return (
          <>
            <GameTitle>💰 Escolha sua Aposta</GameTitle>
            <NarrativeText>
              Bartolph aguarda enquanto você decide quanto apostar. <strong>Você tem {currentGold} moedas de ouro</strong>.
              <br/><br/>
              — Quanto você quer arriscar? — pergunta ele, tamborilando os dedos na mesa.
            </NarrativeText>
            <Box sx={{ textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              {[5, 10, 20, 50].filter(amount => amount <= currentGold).map(amount => (
                <ActionButton key={amount} onClick={() => placeBet(amount)}>
                  💰 {amount} Moedas
                </ActionButton>
              ))}
            </Box>
          </>
        );

      case 'rolling':
        return (
          <>
            <GameTitle>🎲 Hora de Rolar os Dados!</GameTitle>
            <NarrativeText>
              <strong>Aposta:</strong> {bet} moedas de ouro
              <br/><br/>
              Bartolph balança os dados e os joga na mesa. Sua vez!
            </NarrativeText>
            <DiceContainer>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#F5DEB3', marginBottom: '12px', fontFamily: '"Cinzel", serif', fontWeight: '600' }}>
                  Seu Dado
                </Typography>
                <DiceBox isRolling={isRolling} onClick={!isRolling ? rollDices : undefined}>
                  {playerDice || '?'}
                </DiceBox>
              </Box>
              <Typography sx={{ color: '#FFD700', fontSize: '24px', fontWeight: '900' }}>VS</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#F5DEB3', marginBottom: '12px', fontFamily: '"Cinzel", serif', fontWeight: '600' }}>
                  Dado de Bartolph
                </Typography>
                <DiceBox isRolling={isRolling}>
                  {bartolphDice || '?'}
                </DiceBox>
              </Box>
            </DiceContainer>
            {!isRolling && playerDice === 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <ActionButton onClick={rollDices}>
                  🎲 Rolar os Dados!
                </ActionButton>
              </Box>
            )}
          </>
        );

      case 'result':
        return (
          <>
            <GameTitle>
              {gameResult === 'won' ? '🎉 Vitória!' : '💸 Derrota!'}
            </GameTitle>
            <NarrativeText>
              <strong>Resultado:</strong>
              <br/>
              Seu dado: <strong>{playerDice}</strong>
              <br/>
              Dado de Bartolph: <strong>{bartolphDice}</strong>
              <br/><br/>
              {gameResult === 'won' ? (
                <>
                  Bartolph franze a testa, claramente irritado.
                  <br/>
                  — Sortudo... — resmunga enquanto coloca <strong>{bet} moedas de ouro</strong> na mesa. — Aqui está seu prêmio.
                  <br/><br/>
                  <strong>Você ganhou {bet} moedas de ouro!</strong>
                </>
              ) : (
                <>
                  Bartolph sorri largamente e estende a mão.
                  <br/>
                  — Como eu disse, a sorte favorece os experientes — diz enquanto recolhe suas <strong>{bet} moedas de ouro</strong>.
                  <br/><br/>
                  <strong>Você perdeu {bet} moedas de ouro!</strong>
                </>
              )}
            </NarrativeText>
            <Box sx={{ textAlign: 'center' }}>
              <ActionButton onClick={finishGame}>
                ➡️ Continuar Aventura
              </ActionButton>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <GameContainer>
      <BackButton onClick={onBackToRoyal}>
        ⬅ Voltar para Royal
      </BackButton>
      
      <GameCard>
        <CardContent sx={{ padding: '40px' }}>
          {renderContent()}
        </CardContent>
      </GameCard>
    </GameContainer>
  );
};

export default BartolphGameScreen;


