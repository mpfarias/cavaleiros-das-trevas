import { useState } from 'react';
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

// Styled Components
const PrepContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  overflow: 'auto'
});

const PrepCard = styled(Card)({
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
  animation: `${fadeIn} 1s ease-out`
});

const PrepTitle = styled(Typography)({
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

const ShopContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
});

const ShopItem = styled(Card)({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,222,179,0.6) 100%)',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    borderColor: '#8B4513'
  }
});

const ItemPrice = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: '18px',
  fontWeight: '700',
  color: '#B8860B',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
});

const BuyButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700'
  },
  '&:disabled': {
    background: 'rgba(139,69,19,0.3)',
    color: 'rgba(245,222,179,0.5)',
    borderColor: 'rgba(210,180,140,0.3)'
  }
});

const ActionButton = styled(Button)({
  padding: '16px 32px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '18px',
  fontFamily: '"Cinzel", serif',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: '8px',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    transform: 'translateY(-2px)'
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

interface ShopItemData {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'equipamento' | 'provisao';
  preco: number;
  descricao: string;
}

const SHOP_ITEMS: ShopItemData[] = [
  {
    id: 'pocao_cura',
    nome: 'Poção de Cura',
    tipo: 'provisao',
    preco: 15,
    descricao: 'Restaura 2 pontos de Força quando usado'
  },
  {
    id: 'racoes',
    nome: 'Rações para Viagem',
    tipo: 'provisao',
    preco: 10,
    descricao: 'Comida para 3 dias de viagem'
  },
  {
    id: 'corda',
    nome: 'Corda Resistente',
    tipo: 'equipamento',
    preco: 8,
    descricao: 'Útil para escaladas e situações difíceis'
  },
  {
    id: 'tocha',
    nome: 'Tochas',
    tipo: 'equipamento',
    preco: 5,
    descricao: 'Iluminação para lugares escuros (pacote com 3)'
  }
];

interface PreparationScreenProps {
  ficha: Ficha;
  onPurchase: (item: ShopItemData) => void;
  onFinishPreparation: () => void;
  onBackToRoyal: () => void;
}

const PreparationScreen: React.FC<PreparationScreenProps> = ({ 
  ficha, 
  onPurchase, 
  onFinishPreparation, 
  onBackToRoyal 
}) => {
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const currentGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);

  const handlePurchase = (item: ShopItemData) => {
    if (currentGold >= item.preco && !purchasedItems.includes(item.id)) {
      setPurchasedItems(prev => [...prev, item.id]);
      onPurchase(item);
    }
  };

  const canAfford = (price: number) => currentGold >= price;
  const alreadyBought = (itemId: string) => purchasedItems.includes(itemId);

  return (
    <PrepContainer>
      <BackButton onClick={onBackToRoyal}>
        ⬅ Voltar para Royal
      </BackButton>
      
      <PrepCard>
        <CardContent sx={{ padding: '40px' }}>
          <PrepTitle>🛒 Preparação para a Expedição</PrepTitle>
          
          <NarrativeText>
            Você decide ser prudente e se afasta de <strong>Bartolph</strong> antes que ele possa insistir mais no jogo. 
            <br/><br/>
            — Sua escolha — diz ele, dando de ombros. — Mas não diga que não te ofereci uma chance de ganhar um dinheiro fácil.
            <br/><br/>
            Com <strong>duas horas</strong> até o encontro com <strong>Mendokan</strong>, você decide usar esse tempo sabiamente para comprar <strong>equipamentos e provisões</strong> para a expedição a <strong>Karnstein</strong>.
            <br/><br/>
            Você encontra um <strong>mercador local</strong> disposto a vender alguns itens úteis. <strong>Você tem {currentGold} moedas de ouro</strong> para gastar.
          </NarrativeText>

          <ShopContainer>
            {SHOP_ITEMS.map((item) => (
              <ShopItem key={item.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: '"Cinzel", serif',
                        fontWeight: '700',
                        color: '#4a2c00',
                        flex: 1
                      }}
                    >
                      {item.nome}
                    </Typography>
                    <ItemPrice>💰 {item.preco}</ItemPrice>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#8B4513',
                      fontStyle: 'italic',
                      marginBottom: '16px',
                      lineHeight: 1.4
                    }}
                  >
                    {item.descricao}
                  </Typography>
                  
                  <BuyButton 
                    fullWidth
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford(item.preco) || alreadyBought(item.id)}
                  >
                    {alreadyBought(item.id) ? '✓ Comprado' : 
                     !canAfford(item.preco) ? 'Sem Ouro Suficiente' : 
                     'Comprar'}
                  </BuyButton>
                </CardContent>
              </ShopItem>
            ))}
          </ShopContainer>

          <Box sx={{ 
            padding: '20px', 
            background: 'rgba(139,69,19,0.1)', 
            borderRadius: '12px', 
            border: '1px solid rgba(139,69,19,0.3)',
            marginBottom: '24px'
          }}>
            <Typography sx={{ 
              textAlign: 'center', 
              fontFamily: '"Cinzel", serif',
              fontWeight: '600',
              color: '#4a2c00'
            }}>
              💰 Ouro Restante: <strong>{currentGold}</strong> moedas
              {purchasedItems.length > 0 && (
                <>
                  <br/>
                  ✅ Itens Comprados: <strong>{purchasedItems.length}</strong>
                </>
              )}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <ActionButton onClick={onFinishPreparation}>
              Partir para Karnstein
            </ActionButton>
          </Box>
        </CardContent>
      </PrepCard>
    </PrepContainer>
  );
};

export default PreparationScreen;


