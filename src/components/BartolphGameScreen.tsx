import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import type { Ficha } from '../types';
import NumberInput from './ui/NumberInput';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { useDiceSound } from '../hooks/useDiceSound';

import { useAudioGroup } from '../hooks/useAudioGroup';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

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



// Styled Components - Padrão das outras telas narrativas
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









interface BartolphGameScreenProps {
  ficha: Ficha;
  onGameResult: (won: boolean, goldChange: number) => void;
  onNavigateToScreen: (id: number) => void;
}

const BartolphGameScreen: React.FC<BartolphGameScreenProps> = ({ 
  ficha, 
  onGameResult, 
  onNavigateToScreen
}) => {

  
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(86);
  const [rolled, setRolled] = useState<number | null>(null);
  const [bet, setBet] = useState<number>(5);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const playDice = useDiceSound(0.8);
  const [resultOpen, setResultOpen] = useState(false);

  // Verificação de segurança para a ficha
  if (!ficha || !ficha.bolsa || !Array.isArray(ficha.bolsa)) {
    console.error('🎲 [Screen86] Ficha inválida detectada');
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>Erro: Ficha inválida</h2>
        <p>Por favor, retorne ao início e crie um personagem válido.</p>
        <button onClick={() => window.location.href = '/'}>Ir para início</button>
      </div>
    );
  }

  const currentGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);

  const nextScreenId = useMemo(() => {
    if (rolled == null) return null;
    // Ajuste solicitado: ao ganhar, ir para 54; ao perder, manter 43
    return rolled >= 4 ? 54 : 43;
  }, [rolled]);

  const won = useMemo(() => (rolled != null ? rolled >= 4 : null), [rolled]);
  const betValid = useMemo(() => bet >= 1 && bet <= currentGold, [bet, currentGold]);

  const finishGame = () => {
    if (won == null || nextScreenId == null) return;
    

    
    const goldChange = won ? bet : -bet;

    
    onGameResult(won, goldChange);
    onNavigateToScreen(nextScreenId);
  };

  // Ajusta aposta padrão conforme ouro disponível
  useEffect(() => {
    if (currentGold <= 0) {
      setBet(0);
      return;
    }
    setBet((prev) => {
      const prevValid = prev >= 1 && prev <= currentGold ? prev : 1;
      return Math.min(prevValid, currentGold);
    });
  }, [currentGold]);



  const handleDiceComplete = (dice: number[]) => {
    const result = dice[0]; // 1 dado
    setRolled(result);
    setResultOpen(true);
    setDiceModalOpen(false);
  };



  const renderContent = () => (
    <>
      <NarrativeText>
        Bartolph se senta perto de você e lhe entrega um dado.
        <br/><br/>
        — Aposte algumas Moedas de Ouro e jogue o dado — convida ele, esfregando as mãos de satisfação. — Se sair 4 ou mais, você ganha o que apostou mais uma quantia igual que eu terei que lhe dar. Se o resultado for inferior a 4, eu ganho e a aposta é minha. Fácil, não é?
        <br/><br/>
        De fato, até parece fácil demais. Um grupo de pessoas, atraído pela voz de Bartolph, se reúne ao redor de vocês.
        <br/><br/>
        Decida quantas Moedas deseja colocar em jogo e registre esse número no espaço abaixo, em seguida jogue o dado.
        <br/><br/>
      </NarrativeText>

      <Box sx={{ maxWidth: 420, margin: '0 auto' }}>
        <NumberInput
          value={bet}
          onChange={setBet}
          min={1}
          max={currentGold > 0 ? currentGold : 1}
          label={`Moedas para apostar (Você tem ${currentGold})`}
        />

        <DiceContainer>
          <button
            onClick={() => {
              playDice();
              setDiceModalOpen(true);
            }}
            disabled={!betValid}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
              color: '#F5DEB3',
              border: '2px solid #D2B48C',
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: '"Cinzel", serif',
              fontWeight: '600',
              textAlign: 'center',
              cursor: betValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              outline: 'none',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              opacity: betValid ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (betValid) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)';
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (betValid) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)';
                e.currentTarget.style.borderColor = '#D2B48C';
                e.currentTarget.style.color = '#F5DEB3';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              }
            }}
          >
            Rolar Dado
          </button>
        </DiceContainer>

        {rolled == null ? (
          <Box sx={{ textAlign: 'center' }}>
            {currentGold < 1 && (
              <Typography sx={{ mt: 1 }} variant="caption" color="text.secondary">
                Você não tem moedas de ouro para apostar.
              </Typography>
            )}
          </Box>
        ) : null}

        {/* Modal 3D de dados */}
        <DiceRollModal3D
          open={diceModalOpen}
          numDice={1}
          onComplete={handleDiceComplete}
          bonus={0}
        />

        {/* Dialog de resultado */}
        <Dialog open={resultOpen} onClose={undefined} aria-labelledby="resultado-dados" maxWidth="xs" fullWidth>
          <DialogTitle id="resultado-dados" sx={{ textAlign: 'center' }}>
            {rolled != null && (rolled >= 4 ? 'Você ganhou' : 'Você perdeu')}
          </DialogTitle>
          <DialogContent>
            <Typography align="center">
              Resultado do dado: <strong>{rolled}</strong>
              <br/>
              {rolled != null && (rolled >= 4 ? (
                <>Você receberá {bet} moedas de ouro.</>
              ) : (
                <>Serão descontadas {bet} moedas de ouro.</>
              ))}
            </Typography>
            {!betValid && (
              <Typography sx={{ mt: 1 }} variant="caption" color="text.secondary" align="center">
                Defina uma aposta válida (entre 1 e {currentGold}).
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <button
              onClick={finishGame}
              disabled={!betValid}
              style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                color: '#F5DEB3',
                border: '2px solid #D2B48C',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: '"Cinzel", serif',
                fontWeight: '600',
                textAlign: 'center',
                cursor: betValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                outline: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                opacity: betValid ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (betValid) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)';
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (betValid) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)';
                  e.currentTarget.style.borderColor = '#D2B48C';
                  e.currentTarget.style.color = '#F5DEB3';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
                }
              }}
            >
              {rolled != null && (rolled >= 4 ? 'Ganhei' : 'Perdi')}
            </button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );

  return (
    <Container data-screen="bartolph-86">
      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'fixed', // Mudado de 'absolute' para 'fixed' para ficar sempre visível
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={togglePlay}
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
          {renderContent()}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default BartolphGameScreen;


