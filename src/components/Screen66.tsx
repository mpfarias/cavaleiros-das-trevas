import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button, Chip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useState } from 'react';
import { GameAlert } from './ui/GameAlert';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a0f08 0%, #2c1810 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.2) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '1000px',
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

const ItemCard = styled(Card)({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.8) 100%)',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(139,69,19,0.3)',
    borderColor: '#8B4513'
  }
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

interface Screen66Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'magic' | 'tool' | 'consumable' | 'special';
  maxQuantity?: number; // undefined = pode comprar quantos quiser
  effects: {
    special?: string;
    attributes?: string;
    durability?: number;
  };
  // Efeitos detalhados para o sistema
  detailedEffects?: {
    attributes?: {
      sorte?: number;
      pericia?: number;
    };
    durability?: number;
    special?: string;
  };
}

const Screen66: React.FC<Screen66Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'parte-oeste'
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(30);
  
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Estados para os alerts de compra
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [purchaseInfo, setPurchaseInfo] = useState({ itemName: '', quantity: 0, cost: 0, remaining: 0 });
  
  const marketItems: MarketItem[] = [
    {
      id: 'amuleto-sorte',
      name: 'Amuleto da Sorte',
      description: 'Uso único. Permite recuperar sua pontuação inicial de SORTE.',
      price: 4,
      type: 'magic',
      maxQuantity: 1,
      effects: {
        special: 'Recupera pontuação inicial de SORTE (uso único)'
      }
      // Removido detailedEffects - efeito só quando usado
    },
    {
      id: 'capa-camaleao',
      name: 'Capa de Camaleão',
      description: 'Tecido por duendes, este manto assume a cor de qualquer ambiente natural. Não é tão eficaz contra construções humanas (como paredes de tijolos), mas funciona muito bem na escuridão.',
      price: 3,
      type: 'magic',
      maxQuantity: 1,
      effects: {
        special: 'Camuflagem em ambientes naturais e escuridão'
      }
    },
    {
      id: 'foguetes',
      name: 'Foguetes',
      description: 'Lançados contra uma superfície dura, explodem com luz e som estrondoso. Não causam dano, mas podem assustar inimigos.',
      price: 2,
      type: 'tool',
      effects: {
        special: 'Luz e som para assustar inimigos'
      }
    },
    {
      id: 'espelho',
      name: 'Espelho',
      description: 'Apesar de parecer inútil, espelhos já provaram ter utilidade em outras aventuras.',
      price: 1,
      type: 'tool',
      maxQuantity: 1,
      effects: {
        special: 'Utilidade em aventuras específicas'
      }
    },
    {
      id: 'provisoes',
      name: 'Provisões',
      description: 'Refeições para manter sua energia durante a aventura.',
      price: 1,
      type: 'consumable',
      effects: {
        special: 'Mantém energia durante aventuras'
      }
    },
    {
      id: 'anel-agilidade',
      name: 'Anel da Agilidade',
      description: 'Pode ser usado sempre que realizar um Teste de Perícia. Ao usar, subtraia 2 do resultado dos dados. Pode ser usado até três vezes; depois perde o efeito.',
      price: 4,
      type: 'magic',
      maxQuantity: 1,
      effects: {
        special: '-2 em testes de Perícia (3 usos)',
        durability: 3
      }
      // Removido detailedEffects.attributes - penalidade só quando usado
    },
    {
      id: 'pocao-anestesica',
      name: 'Poção Anestésica',
      description: 'Um frasco desse líquido potente faz um Monstro dormir por vários dias.',
      price: 3,
      type: 'consumable',
      effects: {
        special: 'Faz monstros dormirem por vários dias'
      }
    }
  ];

  // Função para verificar se o jogador já possui um item específico
  const checkExistingItem = (itemId: string) => {
    return ficha.bolsa.find(item => item.id === itemId);
  };

  const handlePurchase = () => {
    console.log('🎲 [Screen66] handlePurchase chamado');
    console.log('🎲 [Screen66] selectedItem:', selectedItem);
    console.log('🎲 [Screen66] ficha.bolsa:', ficha.bolsa);
    
    if (selectedItem && ficha.bolsa) {
      // Encontra as moedas de ouro na bolsa
      const moedasOuro = ficha.bolsa.find(item => item.tipo === 'ouro');
      const currentGold = moedasOuro?.quantidade || 0;
      const totalCost = selectedItem.price * quantity;
      
      console.log('🎲 [Screen66] Moedas de ouro:', currentGold);
      console.log('🎲 [Screen66] Custo total:', totalCost);
      console.log('🎲 [Screen66] Pode comprar?', currentGold >= totalCost);
      
      if (currentGold >= totalCost) {
        // REGRA 1: Bloqueia se já possui o MESMO item (mesmo ID)
        if (selectedItem.maxQuantity === 1) {
          const existingItem = checkExistingItem(selectedItem.id);
          console.log('🎲 [Screen66] Item existente:', existingItem);
          
          if (existingItem) {
            console.log('🎲 [Screen66] Item já possuído, bloqueando compra');
            // Configurar alert de item já possuído
            setPurchaseInfo({
              itemName: selectedItem.name,
              quantity: 0,
              cost: 0,
              remaining: currentGold
            });
            
            // Mostrar alert de erro
            setShowPurchaseAlert(true);
            setTimeout(() => setShowPurchaseAlert(false), 3000);
            
            setShowPurchaseDialog(false);
            setSelectedItem(null);
            setQuantity(1);
            return;
          }
        }
        
        console.log('🎲 [Screen66] Executando compra...');
        // Se chegou aqui, pode comprar normalmente
        executePurchase(selectedItem, quantity, totalCost, currentGold);
      } else {
        console.log('🎲 [Screen66] Ouro insuficiente para compra');
      }
    } else {
      console.log('🎲 [Screen66] selectedItem ou ficha.bolsa é null/undefined');
    }
  };

  // Função para executar a compra
  const executePurchase = (item: MarketItem, qty: number, cost: number, currentGold: number) => {
    console.log('🎲 [Screen66] executePurchase chamado com:', { item, qty, cost, currentGold });
    
    try {
      let newBolsa = [...ficha.bolsa];
      console.log('🎲 [Screen66] Bolsa atual:', newBolsa);
      
      // Atualiza o ouro
      newBolsa = newBolsa.map(existingItem => 
        existingItem.tipo === 'ouro' 
          ? { ...existingItem, quantidade: currentGold - cost }
          : existingItem
      );
      console.log('🎲 [Screen66] Bolsa após atualizar ouro:', newBolsa);
      
      // Adiciona o novo item à bolsa com efeitos detalhados
      const newItem = {
        id: item.id,
        nome: item.name,
        tipo: (() => {
          // Mapear o tipo do MarketItem para o tipo correto da bolsa
          switch (item.type) {
            case 'consumable':
              return 'provisao' as 'provisao';
            case 'magic':
              return 'equipamento' as 'equipamento';
            case 'tool':
              return 'equipamento' as 'equipamento';
            case 'special':
              return 'equipamento' as 'equipamento';
            default:
              return 'equipamento' as 'equipamento';
          }
        })(),
        quantidade: qty,
        descricao: item.description,
        adquiridoEm: 'Parte Oeste de Royal Lendle',
        efeitos: item.effects.durability ? {
          durability: item.effects.durability
        } : undefined,
        durabilidadeAtual: item.effects.durability
      };
      console.log('🎲 [Screen66] Novo item criado:', newItem);
      
      newBolsa.push(newItem);
      console.log('🎲 [Screen66] Bolsa após adicionar item:', newBolsa);
      
      const newFicha = {
        ...ficha,
        bolsa: newBolsa
      };
      console.log('🎲 [Screen66] Nova ficha criada:', newFicha);
      
      // Aplica os modificadores dos itens aos atributos
      console.log('🎲 [Screen66] Aplicando efeitos dos itens...');
      let updatedFicha;
      try {
        // Para itens da Tela 66, não aplicamos modificadores automáticos
        // Os efeitos só são aplicados quando o item é usado durante o jogo
        updatedFicha = newFicha;
        console.log('🎲 [Screen66] Ficha mantida sem modificadores automáticos (efeitos só quando usado)');
      } catch (error) {
        console.error('🎲 [Screen66] Erro ao processar ficha:', error);
        updatedFicha = newFicha;
      }
      
      console.log('🎲 [Screen66] Chamando onUpdateFicha...');
      console.log('🎲 [Screen66] onUpdateFicha é uma função?', typeof onUpdateFicha);
      console.log('🎲 [Screen66] onUpdateFicha:', onUpdateFicha);
      
      // Chama a função de atualização
      onUpdateFicha(updatedFicha);
      
      console.log('🎲 [Screen66] onUpdateFicha foi chamada com sucesso');
      
      // Configurar informações para os alerts ANTES de fechar o modal
      setPurchaseInfo({
        itemName: item.name,
        quantity: qty,
        cost: cost,
        remaining: currentGold - cost
      });
      
      console.log('🎲 [Screen66] purchaseInfo configurado:', {
        itemName: item.name,
        quantity: qty,
        cost: cost,
        remaining: currentGold - cost
      });
      
      // Mostrar alert de compra
      console.log('🎲 [Screen66] Mostrando alert de compra...');
      setShowPurchaseAlert(true);
      setTimeout(() => setShowPurchaseAlert(false), 3000);
      
      // Mostrar alert de moedas após 1 segundo
      setTimeout(() => {
        console.log('🎲 [Screen66] Mostrando alert de moedas...');
        setShowMoneyAlert(true);
        setTimeout(() => setShowMoneyAlert(false), 3000);
      }, 1000);
      
      // Fechar o modal por último
      console.log('🎲 [Screen66] Fechando modal...');
      setShowPurchaseDialog(false);
      setSelectedItem(null);
      setQuantity(1);
      
      console.log('🎲 [Screen66] Compra finalizada com sucesso!');
      
      // Verificação adicional: verificar se a ficha foi realmente atualizada
      setTimeout(() => {
        console.log('🎲 [Screen66] Verificação pós-compra - ficha atual:', ficha);
        console.log('🎲 [Screen66] Verificação pós-compra - bolsa atual:', ficha.bolsa);
      }, 100);
      
    } catch (error) {
      console.error('🎲 [Screen66] Erro durante a compra:', error);
      // Em caso de erro, pelo menos fecha o modal
      setShowPurchaseDialog(false);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'magic': return '#7B1FA2';
      case 'tool': return '#388E3C';
      case 'consumable': return '#F57C00';
      case 'special': return '#1976D2';
      default: return '#666';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'magic': return 'Mágico';
      case 'tool': return 'Ferramenta';
      case 'consumable': return 'Consumível';
      case 'special': return 'Especial';
      default: return 'Item';
    }
  };

  return (
    <Container data-screen="screen-66">
      {/* Alerts de compra */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showPurchaseAlert}>
        {purchaseInfo.quantity > 0 
          ? `Compra realizada com sucesso! ${purchaseInfo.itemName} x${purchaseInfo.quantity}`
          : `Você já possui ${purchaseInfo.itemName}! Só é permitido comprar uma unidade.`
        }
      </GameAlert>
      
      <GameAlert sx={{ top: '180px' }} $isVisible={showMoneyAlert}>
        Moedas gastas: {purchaseInfo.cost} | Restantes: {purchaseInfo.remaining}
      </GameAlert>
      
      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'fixed',
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
          <NarrativeText>
            Você não demora a descobrir os itens que podem ser úteis ao longo desta aventura. 
            Preste atenção à lista abaixo e, se comprar algum, será inserido na sua bolsa e 
            o valor subtraído da quantidade de Moedas de Ouro.
            <br/><br/>
            Com exceção das <strong>Provisões</strong>, do <strong>Amuleto da Sorte</strong> (que pode ser usado a qualquer momento, exceto em combate) 
            e do <strong>Anel da Agilidade</strong> (que pode ser usado sempre que testar a sorte), todos os outros itens só podem ser usados 
            quando as instruções indicarem.
            <br/><br/>
            Salvo indicação contrária, só é permitido comprar uma unidade de cada item.
            <br/><br/>
            <strong>Você tem {ficha.bolsa?.find(item => item.tipo === 'ouro')?.quantidade || 0} Moedas de Ouro disponíveis.</strong>
          </NarrativeText>

          {/* Grid de itens */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3, 
            marginBottom: '32px' 
          }}>
            {marketItems.map((item) => (
              <ItemCard 
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setQuantity(1);
                  setShowPurchaseDialog(true);
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    fontFamily: '"Cinzel", serif', 
                    fontWeight: 600,
                    color: '#3d2817',
                    marginBottom: '8px'
                  }}>
                    {item.name}
                  </Typography>
                  
                  <Chip 
                    label={getTypeText(item.type)}
                    size="small"
                    sx={{ 
                      backgroundColor: getTypeColor(item.type),
                      color: 'white',
                      marginBottom: '8px'
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    marginBottom: '12px',
                    minHeight: '80px',
                    fontSize: '14px'
                  }}>
                    {item.description}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#8B4513',
                    fontWeight: 700,
                    textAlign: 'right'
                  }}>
                    {item.price} Moeda{item.price > 1 ? 's' : ''} de Ouro
                  </Typography>
                </CardContent>
              </ItemCard>
            ))}
          </Box>

          {/* Botões de navegação */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => {
              const aceitouBartolph = localStorage.getItem('cavaleiro:aceitouBartolph') === 'true';
              if (aceitouBartolph) {
                onGoToScreen(321); // Quem aceitou o desafio vai para 321
              } else {
                onGoToScreen(82); // Quem não aceitou vai para o mercado leste
              }
            }}>
              Visitar o lado Leste do mercado
            </ChoiceButton>
            
            <ChoiceButton onClick={() => onGoToScreen(321)}>
              Ir embora
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Dialog de compra */}
      {showPurchaseDialog && selectedItem && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
        >
          <Card sx={{ 
            maxWidth: '600px', 
            width: '100%',
            background: 'rgba(255,255,255,0.98)',
            border: '2px solid #8B4513'
          }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography variant="h5" sx={{ 
                fontFamily: '"Cinzel", serif',
                marginBottom: '16px',
                color: '#3d2817'
              }}>
                Confirmar Compra
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: '#8B4513',
                marginBottom: '16px'
              }}>
                {selectedItem.name}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#666',
                marginBottom: '16px',
                fontStyle: 'italic'
              }}>
                {selectedItem.description}
              </Typography>

              {/* Efeitos do item */}
              {selectedItem.effects.special && (
                <Box sx={{ marginBottom: '12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#7B1FA2' }}>
                    Efeito Especial: {selectedItem.effects.special}
                  </Typography>
                </Box>
              )}
              
              {selectedItem.effects.durability && (
                <Box sx={{ marginBottom: '12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#F57C00' }}>
                    Durabilidade: {selectedItem.effects.durability} usos
                  </Typography>
                </Box>
              )}
              
              {/* Quantidade (se permitido) */}
              {!selectedItem.maxQuantity && (
                <Box sx={{ marginBottom: '16px' }}>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                    Quantidade:
                  </Typography>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      padding: '8px',
                      border: '1px solid #D2B48C',
                      borderRadius: '4px',
                      width: '80px'
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="h6" sx={{ 
                color: '#8B4513',
                fontWeight: 700,
                marginBottom: '24px'
              }}>
                Custo Total: {selectedItem.price * quantity} Moeda{(selectedItem.price * quantity) > 1 ? 's' : ''} de Ouro
              </Typography>
              
              <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowPurchaseDialog(false)}
                  sx={{ color: '#8B4513', borderColor: '#8B4513' }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handlePurchase}
                  disabled={(ficha.bolsa?.find(item => item.tipo === 'ouro')?.quantidade || 0) < (selectedItem.price * quantity)}
                  sx={{ 
                    backgroundColor: '#8B4513',
                    '&:hover': { backgroundColor: '#A0522D' },
                    '&:disabled': { backgroundColor: '#ccc' }
                  }}
                >
                  Comprar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Screen66;
