import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import InventoryModal from './InventoryModal';
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

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(250, 161, 35, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(250, 161, 35, 0.6);
  }
`;

// Styled Components
const GameContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',  // Altura mínima ao invés de fixa
  background: `
    linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',  // Alinhar no topo
  padding: '20px',
  paddingBottom: '40px',  // Espaço extra embaixo
  overflow: 'visible',  // Permitir overflow
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" stitchTiles="stitch"/></filter></defs><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.03"/></svg>')
    `,
    pointerEvents: 'none'
  }
});

const StoryCard = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  minHeight: 'auto',  // Permitir altura automática
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
  overflow: 'visible !important',  // Forçar visibilidade do conteúdo
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '8px',
    left: '8px',
    right: '8px',
    bottom: '8px',
    border: '2px solid rgba(139,69,19,0.3)',
    borderRadius: '12px',
    pointerEvents: 'none'
  }
});

const LocationTitle = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: 'clamp(24px, 4vw, 36px)',
  fontWeight: '900',
  color: '#4a2c00',
  textAlign: 'center',
  marginBottom: '24px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  letterSpacing: '2px',
  textTransform: 'uppercase'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)',
  '& strong': {
    color: '#2c1810',
    fontWeight: '700'
  }
});

const ChoicesContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  marginTop: '20px'
});

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '600',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  animation: `${fadeIn} 0.8s ease-out 0.5s both`,
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    animation: `${pulseGlow} 2s ease-in-out infinite`
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

const BackButton = styled('button')({
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
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  zIndex: 10,
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'scale(1.05)'
  }
});

const PlayerStatus = styled(Box)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  padding: '12px 16px',
  background: 'rgba(139,69,19,0.8)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '600',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  zIndex: 10,
  '&:hover': {
    background: 'rgba(179,18,18,0.8)',
    borderColor: '#FFD700',
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(179,18,18,0.4)'
  }
});

interface RoyalLendleScreenProps {
  onChoice: (choice: string) => void;
  onBackToMap: () => void;
  ficha: Ficha;
}

const RoyalLendleScreen: React.FC<RoyalLendleScreenProps> = ({ 
  onChoice, 
  onBackToMap, 
  ficha
}) => {
  const [textVisible, setTextVisible] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Calcular total de moedas de ouro
  const totalGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);

  useEffect(() => {
    // Animar entrada do texto
    const textTimer = setTimeout(() => {
      setTextVisible(true);
    }, 500);

    // Animar entrada das escolhas
    const choicesTimer = setTimeout(() => {
      setChoicesVisible(true);
    }, 1000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(choicesTimer);
    };
  }, []);

  const handleChoice = (choice: string) => {
    console.log(`🎲 Jogador escolheu: ${choice}`);
    onChoice(choice);
  };

  return (
    <GameContainer>
      <BackButton onClick={onBackToMap}>
        ⬅ Voltar ao Mapa
      </BackButton>
      
      <PlayerStatus onClick={() => setInventoryOpen(true)}>
        {ficha.nome} | 💰 {totalGold} Moedas de Ouro
      </PlayerStatus>

      <StoryCard>
        <CardContent sx={{ 
          padding: '40px', 
          paddingBottom: '60px',  // Espaço extra embaixo
          overflow: 'visible',
          minHeight: 'auto'
        }}>
          <LocationTitle>
            Royal Lendle
          </LocationTitle>
          
          <NarrativeText 
            sx={{ 
              opacity: textVisible ? 1 : 0,
              transition: 'opacity 1s ease-out'
            }}
          >
            Embora aliviado por você ter concordado em ir com ele, <strong>Mendokan</strong> fica um tanto envergonhado e diz:
            <br/><br/>
            — Nós somos muito pobres. Não podemos pagar mais do que <strong>duzentas Moedas de Ouro</strong> e, além disso, os anciãos da aldeia decretaram que só te pagaríamos depois que o serviço fosse concluído.
            <br/><br/>
            Como você sabe que os tempos estão difíceis para todos, não volta atrás e concorda com os termos do contrato. <strong>Mendokan</strong> sorri, aliviado, e vai se encontrar com os amigos para preparar a partida para <strong>Karnstein</strong>. Enquanto isso, você terá que comprar <strong>Provisões</strong> e outro equipamento para a sua expedição.
            <br/><br/>
            Você se despede de <strong>Mendokan</strong> e combinam de se encontrar dali a duas horas, na estrada principal ao sul da cidade. Assim que ele sai, chega um sujeito vestido de forma extravagante, abrindo caminho com cotoveladas para chegar até você. Ele se chama <strong>Bartolph</strong> e é um jogador pouco confiável. Frequentador das áreas mais perigosas da cidade, vive usando roupas caras de seda, como se quisesse mostrar o dinheiro que ganha no jogo.
            <br/><br/>
            — Há muito tempo que não te vejo por aqui — diz com um ar astuto. — <strong>Quer tentar a sorte?</strong>
            <br/><br/>
            Embora você não queira perder tempo, a verdade é que, se ganhasse, teria mais dinheiro para comprar equipamento, o que seria útil. O que você decide fazer?
          </NarrativeText>

          {/* BOTÕES ESTILIZADOS - AGORA QUE SABEMOS QUE FUNCIONA */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            marginTop: '32px',
            width: '100%'
          }}>
            <button 
              onClick={() => handleChoice('aceitar_jogo')}
              style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                color: '#F5DEB3',
                border: '2px solid #D2B48C',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: '"Cinzel", serif',
                fontWeight: '600',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)';
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)';
                e.currentTarget.style.borderColor = '#D2B48C';
                e.currentTarget.style.color = '#F5DEB3';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              }}
            >
              <div>
                🎲 <strong>Aceitar o Desafio de Bartolph</strong>
                <div style={{ 
                  marginTop: '8px', 
                  color: '#D2B48C', 
                  fontFamily: '"Spectral", serif',
                  fontStyle: 'italic',
                  fontSize: '14px'
                }}>
                  Tentar a sorte pode render mais ouro para equipamentos...
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleChoice('recusar_jogo')}
              style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
                color: '#F5DEB3',
                border: '2px solid #D2B48C',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: '"Cinzel", serif',
                fontWeight: '600',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                width: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)';
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)';
                e.currentTarget.style.borderColor = '#D2B48C';
                e.currentTarget.style.color = '#F5DEB3';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              }}
            >
              <div>
                🚶 <strong>Ir Embora e Preparar-se</strong>
                <div style={{ 
                  marginTop: '8px', 
                  color: '#D2B48C', 
                  fontFamily: '"Spectral", serif',
                  fontStyle: 'italic',
                  fontSize: '14px'
                }}>
                  Não perder tempo e focar na missão principal.
                </div>
              </div>
            </button>
          </Box>
        </CardContent>
      </StoryCard>

      {/* Modal da Bolsa */}
      <InventoryModal 
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        ficha={ficha}
      />
    </GameContainer>
  );
};

export default RoyalLendleScreen;
