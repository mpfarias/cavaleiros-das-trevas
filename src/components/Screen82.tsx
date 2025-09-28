import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button, Chip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useItemEffects } from '../hooks/useItemEffects';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useState, useCallback } from 'react';
import { GameAlert } from './ui/GameAlert';
import type { Ficha } from '../types';

// Imports das imagens dos itens
import machadoGuerraImg from '../assets/images/machado-de-guerra.png';
import cotaMalhaImg from '../assets/images/cota-de-malha.png';
import estrepesMetalImg from '../assets/images/estrepes-de-metal.png';
import candeiaAzeiteImg from '../assets/images/candeia-e-azeite.png';
import algemasImg from '../assets/images/algemas.png';
import almotoliaPocaoCorrosivaImg from '../assets/images/almotolia-com-pocao-corrosiva.png';
import cordaGanchoImg from '../assets/images/corda-e-gancho.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
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
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(139,69,19,0.3)',
    borderColor: '#8B4513'
  }
});

const HoverImage = styled(Box)({
  position: 'fixed',
  zIndex: 1500,
  pointerEvents: 'none',
  animation: `${fadeInImage} 0.3s ease-out`,
  '& img': {
    maxWidth: '400px',
    maxHeight: '400px',
    borderRadius: '12px',
    border: '3px solid #8B4513',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backgroundColor: 'transparent'
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

interface Screen82Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'tool' | 'consumable' | 'special';
  maxQuantity?: number; // undefined = pode comprar quantos quiser
  equipmentType?: 'weapon' | 'armor'; // Para itens que ocupam slot de equipamento
  effects: {
    combat?: string;
    attributes?: string;
    special?: string;
    durability?: number;
  };
  // Efeitos detalhados para o sistema
  detailedEffects?: {
    combat?: {
      damage?: number;
      damageType?: 'forca' | 'sorte';
      damageCondition?: string;
    };
    attributes?: {
      pericia?: number;
      forca?: number;
      sorte?: number;
      ataque?: number;
    };
    durability?: number;
  };
  // Imagem do item para hover
  image?: string;
}

const Screen82: React.FC<Screen82Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'royal-lendle'
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(30);
  
  // Hook para gerenciar efeitos dos itens
  const { applyModifiersToAttributes } = useItemEffects();
  
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Estados para os alerts de compra
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [purchaseInfo, setPurchaseInfo] = useState({ itemName: '', quantity: 0, cost: 0, remaining: 0 });
  
  // Estados para confirmação de substituição de equipamento
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [replaceInfo, setReplaceInfo] = useState({ 
    newItem: null as MarketItem | null, 
    currentItem: null as any, 
    quantity: 1 
  });

  // Estados para hover da imagem
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  
  // Função para aplicar os efeitos dos itens aos atributos
  const applyItemEffects = (ficha: Ficha) => {
    return applyModifiersToAttributes(ficha);
  };

  // Função para obter a imagem do item
  const getItemImage = (itemId: string): string | undefined => {
    const imageMap: Record<string, string> = {
      'machado-guerra': machadoGuerraImg,
      'armadura-cota-malha': cotaMalhaImg,
      'estrepes-metal': estrepesMetalImg,
      'candeia-azeite': candeiaAzeiteImg,
      'algemas': algemasImg,
      'almotolia-pocao-corrosiva': almotoliaPocaoCorrosivaImg,
      'corda-gancho': cordaGanchoImg
    };
    return imageMap[itemId];
  };

  // Função para mostrar imagem no hover
  const handleItemHover = useCallback((event: React.MouseEvent, itemId: string) => {
    const image = getItemImage(itemId);
    if (image) {
      setHoverImage({
        src: image,
        x: event.clientX + 20,
        y: event.clientY - 20
      });
    }
  }, []);

  // Função para esconder imagem no hover
  const handleItemLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  // Função para atualizar posição da imagem durante o hover (mais responsiva)
  const handleItemMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);


     const marketItems: MarketItem[] = [
     
     {
        id: 'machado-guerra',
        name: 'Machado de Guerra',
        description: 'Cada vez que atingir um inimigo com ele, cause 4 pontos de dano à FORÇA (ou 6 pontos se tiver sucesso em um Teste de Sorte; 2 pontos se falhar). Porém, o peso do machado é um problema: subtraia 1 ponto do resultado sempre que jogar os dados para um Ataque.',
        price: 3,
        type: 'weapon',
        equipmentType: 'weapon',
        maxQuantity: 1,
        image: machadoGuerraImg,
        effects: {
          combat: '4 pontos de dano à FORÇA (6 se sucesso em Sorte, 2 se falhar)',
          attributes: '-1 ponto em testes de Ataque',
          special: 'Dano base: 4, pode variar com teste de Sorte'
        },
        detailedEffects: {
          combat: {
            damage: 4,
            damageType: 'forca',
            damageCondition: '6 se sucesso em Sorte, 2 se falhar'
          },
          attributes: {
            ataque: -1
          }
        }
      },
    {
      id: 'estrepes-metal',
      name: 'Estrepes de Metal',
      description: 'Pequenas esferas com picos usadas para atrasar perseguidores, lançadas no chão. Você pode comprar quantos conjuntos quiser.',
      price: 1,
      type: 'tool',
      image: estrepesMetalImg,
      effects: {
        special: 'Atrasa perseguidores'
      }
    },
         {
       id: 'armadura-cota-malha',
       name: 'Armadura de Cota de Malha',
       description: 'Sempre que for atingido em combate, perca apenas 1 ponto de FORÇA (0 se passar em um Teste de Sorte; 2 se falhar). No entanto, ela é desconfortável: some 1 ponto ao resultado sempre que fizer um Teste de Perícia. Protege apenas em combate e resiste a 10 ataques.',
       price: 3,
       type: 'armor',
       equipmentType: 'armor',
       maxQuantity: 1,
       image: cotaMalhaImg,
       effects: {
         combat: 'Perde apenas 1 ponto de FORÇA (0 se sucesso em Sorte, 2 se falhar)',
         attributes: '+1 ponto em testes de Perícia',
         durability: 10
       },
       detailedEffects: {
         combat: {
           damage: 1,
           damageType: 'forca',
           damageCondition: '0 se sucesso em Sorte, 2 se falhar'
         },
         attributes: {
           pericia: 1
         },
         durability: 10
       }
     },
    {
      id: 'candeia-azeite',
      name: 'Candeia e Azeite',
      description: 'Útil em lugares escuros. 1 Moeda de Ouro compra uma candeia com 1 dose de azeite. Cada vez que usar a candeia, gasta 1 dose. Compre quantas doses quiser (mas não mais candeias).',
      price: 1,
      type: 'consumable',
      image: candeiaAzeiteImg,
      effects: {
        special: 'Ilumina lugares escuros'
      }
    },
    {
      id: 'algemas',
      name: 'Algemas',
      description: 'Servem para prender a maioria dos humanoides.',
      price: 2,
      type: 'tool',
      maxQuantity: 1,
      image: algemasImg,
      effects: {
        special: 'Prende humanoides'
      }
    },
    {
      id: 'almotolia-pocao-corrosiva',
      name: 'Almotolia com Poção Corrosiva',
      description: 'Uma solução química que dissolve a maioria dos metais, mas é inofensiva para a pele. Compre quantas doses quiser.',
      price: 4,
      type: 'consumable',
      image: almotoliaPocaoCorrosivaImg,
      effects: {
        special: 'Dissolve metais'
      }
    },
    {
      id: 'corda-gancho',
      name: 'Corda e Gancho',
      description: 'Vinte metros de uma corda fina e leve com um gancho preso na ponta.',
      price: 4,
      type: 'tool',
      maxQuantity: 1,
      image: cordaGanchoImg,
      effects: {
        special: '20 metros de corda com gancho'
      }
    }
  ];

  // Função para verificar se o jogador já possui um item específico
  const checkExistingItem = (itemId: string) => {
    return ficha.bolsa.find(item => item.id === itemId);
  };

  // Função para verificar se o jogador já possui um tipo de equipamento
  const checkExistingEquipment = (equipmentType: 'weapon' | 'armor') => {
    if (equipmentType === 'weapon') {
      return ficha.bolsa.find(item => item.tipo === 'arma');
    } else if (equipmentType === 'armor') {
      return ficha.bolsa.find(item => item.tipo === 'armadura');
    }
    return null;
  };

  const handlePurchase = () => {
    if (selectedItem && ficha.bolsa) {
      // Encontra as moedas de ouro na bolsa
      const moedasOuro = ficha.bolsa.find(item => item.tipo === 'ouro');
      const currentGold = moedasOuro?.quantidade || 0;
      const totalCost = selectedItem.price * quantity;
      
      if (currentGold >= totalCost) {
        // REGRA 1: Bloqueia se já possui o MESMO item (mesmo ID)
        if (selectedItem.maxQuantity === 1) {
          const existingItem = checkExistingItem(selectedItem.id);
          if (existingItem) {
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
        
        // REGRA 2: Se for equipamento e já possuir um diferente, mostra modal de substituição
        if (selectedItem.equipmentType) {
          const existingEquipment = checkExistingEquipment(selectedItem.equipmentType);
          if (existingEquipment) {
            // Mostrar modal de confirmação de substituição
            setReplaceInfo({
              newItem: selectedItem,
              currentItem: existingEquipment,
              quantity: quantity
            });
            setShowReplaceDialog(true);
            setShowPurchaseDialog(false);
            return;
          }
        }
        
        // Se chegou aqui, pode comprar normalmente (sem substituição)
        executePurchase(selectedItem, quantity, totalCost, currentGold);
      }
    }
  };

  // Função para executar a compra
  const executePurchase = (item: MarketItem, qty: number, cost: number, currentGold: number) => {
    // Compra normal (sem substituição)
    let newBolsa = [...ficha.bolsa];
    
    // Atualiza o ouro
    newBolsa = newBolsa.map(existingItem => 
      existingItem.tipo === 'ouro' 
        ? { ...existingItem, quantidade: currentGold - cost }
        : existingItem
    );
    
    // Adiciona o novo item à bolsa com efeitos detalhados
    const newItem = {
      id: item.id,
      nome: item.name,
      tipo: (item.type === 'weapon' ? 'arma' : 
             item.type === 'armor' ? 'armadura' : 'equipamento') as 'arma' | 'armadura' | 'equipamento',
      quantidade: qty,
      descricao: item.description,
      adquiridoEm: 'Mercado Oriental',
      efeitos: item.detailedEffects ? {
        combat: item.detailedEffects.combat,
        attributes: item.detailedEffects.attributes,
        durability: item.detailedEffects.durability
      } : undefined,
      durabilidadeAtual: item.detailedEffects?.durability
    };
    
    newBolsa.push(newItem);
    
    const newFicha = {
      ...ficha,
      bolsa: newBolsa
    };
    
    // Aplica os modificadores dos itens aos atributos
    const updatedFicha = applyItemEffects(newFicha);
    
    onUpdateFicha(updatedFicha);
    setShowPurchaseDialog(false);
    setSelectedItem(null);
    setQuantity(1);
    
    // Configurar informações para os alerts
    setPurchaseInfo({
      itemName: item.name,
      quantity: qty,
      cost: cost,
      remaining: currentGold - cost
    });
    
    // Mostrar alert de compra
    setShowPurchaseAlert(true);
    setTimeout(() => setShowPurchaseAlert(false), 3000);
    
    // Mostrar alert de moedas após 1 segundo
    setTimeout(() => {
      setShowMoneyAlert(true);
      setTimeout(() => setShowMoneyAlert(false), 3000);
    }, 1000);
  };

  // Função para confirmar substituição de equipamento
  const handleReplaceEquipment = () => {
    if (replaceInfo.newItem && replaceInfo.currentItem) {
      const moedasOuro = ficha.bolsa.find(item => item.tipo === 'ouro');
      const currentGold = moedasOuro?.quantidade || 0;
      const totalCost = replaceInfo.newItem.price * replaceInfo.quantity;
      
      if (currentGold >= totalCost) {
        // Remove o equipamento atual
        const newBolsa = ficha.bolsa.filter(item => item.id !== replaceInfo.currentItem.id);
        
        // Atualiza o ouro
        const updatedBolsa = newBolsa.map(item => 
          item.tipo === 'ouro' 
            ? { ...item, quantidade: currentGold - totalCost }
            : item
        );
        
        // Adiciona o novo equipamento
        const newItem = {
          id: replaceInfo.newItem.id,
          nome: replaceInfo.newItem.name,
          tipo: (replaceInfo.newItem.type === 'weapon' ? 'arma' : 'armadura') as 'arma' | 'armadura',
          quantidade: replaceInfo.quantity,
          descricao: replaceInfo.newItem.description,
          adquiridoEm: 'Mercado Oriental',
          efeitos: replaceInfo.newItem.detailedEffects ? {
            combat: replaceInfo.newItem.detailedEffects.combat,
            attributes: replaceInfo.newItem.detailedEffects.attributes,
            durability: replaceInfo.newItem.detailedEffects.durability
          } : undefined,
          durabilidadeAtual: replaceInfo.newItem.detailedEffects?.durability
        };
        
        updatedBolsa.push(newItem);
        
        const newFicha = {
          ...ficha,
          bolsa: updatedBolsa
        };
        
        // Aplica os modificadores dos itens aos atributos
        const updatedFichaWithEffects = applyItemEffects(newFicha);
        
        onUpdateFicha(updatedFichaWithEffects);
        setShowReplaceDialog(false);
        setReplaceInfo({ newItem: null, currentItem: null, quantity: 1 });
        
        // Configurar informações para os alerts
        setPurchaseInfo({
          itemName: replaceInfo.newItem.name,
          quantity: replaceInfo.quantity,
          cost: totalCost,
          remaining: currentGold - totalCost
        });
        
        // Mostrar alert de compra
        setShowPurchaseAlert(true);
        setTimeout(() => setShowPurchaseAlert(false), 3000);
        
        // Mostrar alert de moedas após 1 segundo
        setTimeout(() => {
          setShowMoneyAlert(true);
          setTimeout(() => setShowMoneyAlert(false), 3000);
        }, 1000);
      }
    }
  };

  



   const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return '#D32F2F';
      case 'armor': return '#1976D2';
      case 'tool': return '#388E3C';
      case 'consumable': return '#F57C00';
      case 'special': return '#7B1FA2';
      default: return '#666';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'weapon': return 'Arma';
      case 'armor': return 'Armadura';
      case 'tool': return 'Ferramenta';
      case 'consumable': return 'Consumível';
      case 'special': return 'Especial';
      default: return 'Item';
    }
  };

  return (
    <Container data-screen="screen-82">
      {/* Controle de Volume */}
      <VolumeControl />
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
           <span>
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
           </span>
         </Tooltip>
       </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Em pouco tempo, você escolhe os artigos que podem ser úteis durante a aventura. 
            Confira a lista e, se comprar algo, será acrescentado no seu equipamento e 
            descontado o valor das suas Moedas de Ouro.
            <br/><br/>
            Você só deve usar os itens quando for instruído a isso, com exceção do machado 
            de guerra e da armadura. Só é permitido comprar uma unidade de cada item, 
            a menos que seja indicado o contrário.
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
                onMouseEnter={(event) => handleItemHover(event, item.id)}
                onMouseLeave={handleItemLeave}
                onMouseMove={handleItemMove}
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
                onGoToScreen(66); // Quem não aceitou vai para o mercado oeste
              }
            }}>
              Visitar a parte Oeste
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
               {selectedItem.effects.combat && (
                 <Box sx={{ marginBottom: '12px' }}>
                   <Typography variant="body2" sx={{ fontWeight: 600, color: '#D32F2F' }}>
                     Efeito em Combate: {selectedItem.effects.combat}
                   </Typography>
                 </Box>
               )}
               
               {selectedItem.effects.attributes && (
                 <Box sx={{ marginBottom: '12px' }}>
                   <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                     Efeito nos Atributos: {selectedItem.effects.attributes}
                   </Typography>
                 </Box>
               )}

               {selectedItem.effects.durability && (
                 <Box sx={{ marginBottom: '12px' }}>
                   <Typography variant="body2" sx={{ fontWeight: 600, color: '#F57C00' }}>
                     Durabilidade: {selectedItem.effects.durability} ataques
                   </Typography>
                 </Box>
               )}

               {selectedItem.effects.special && (
                 <Box sx={{ marginBottom: '12px' }}>
                   <Typography variant="body2" sx={{ fontWeight: 600, color: '#7B1FA2' }}>
                     Efeito Especial: {selectedItem.effects.special}
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

          {/* Modal de confirmação de substituição de equipamento */}
          {showReplaceDialog && replaceInfo.newItem && replaceInfo.currentItem && (
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
                    color: '#B31212'
                  }}>
                    ⚠️ Confirmar Substituição de Equipamento
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#8B4513',
                    marginBottom: '16px'
                  }}>
                    {replaceInfo.newItem.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    marginBottom: '16px',
                    fontStyle: 'italic'
                  }}>
                    {replaceInfo.newItem.description}
                  </Typography>

                  <Box sx={{ 
                    backgroundColor: '#FFF3CD', 
                    border: '1px solid #FFEAA7',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <Typography variant="body1" sx={{ 
                      color: '#856404',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      ⚠️ ATENÇÃO:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      Se comprar este item, você <strong>substituirá</strong> sua {replaceInfo.currentItem.tipo === 'arma' ? 'arma' : 'armadura'} atual:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#B31212',
                      fontWeight: 700,
                      marginTop: '8px'
                    }}>
                      "{replaceInfo.currentItem.nome}"
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#8B4513',
                    fontWeight: 700,
                    marginBottom: '24px'
                  }}>
                    Custo Total: {replaceInfo.newItem.price * replaceInfo.quantity} Moeda{(replaceInfo.newItem.price * replaceInfo.quantity) > 1 ? 's' : ''} de Ouro
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setShowReplaceDialog(false);
                        setReplaceInfo({ newItem: null, currentItem: null, quantity: 1 });
                      }}
                      sx={{ color: '#8B4513', borderColor: '#8B4513' }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleReplaceEquipment}
                      sx={{ 
                        backgroundColor: '#B31212',
                        '&:hover': { backgroundColor: '#8B0000' }
                      }}
                    >
                      Confirmar Substituição
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

                     {/* Hover Image */}
           {hoverImage && (
             <HoverImage
               sx={{
                 left: hoverImage.x,
                 top: hoverImage.y
               }}
             >
               <img src={hoverImage.src} alt="Item" />
             </HoverImage>
           )}
       </Container>
     );
   };
   
   export default Screen82;
