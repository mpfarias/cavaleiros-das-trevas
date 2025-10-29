import { useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import type { Ficha, Item } from '../types';

// Imports das imagens dos itens
import machadoGuerraImg from '../assets/images/machado-de-guerra.png';
import cotaMalhaImg from '../assets/images/cota-de-malha.png';
import pocaoCorrosivaImg from '../assets/images/almotolia-com-pocao-corrosiva.png';
import amuletoSorteImg from '../assets/images/amuleto-sorte.png';
import capaCamaleaoImg from '../assets/images/capa-camaleao.png';
import foguetesImg from '../assets/images/foguetes.png';
import espelhoImg from '../assets/images/espelho.png';
import provisoesImg from '../assets/images/provisoes.png';
import anelAgilidadeImg from '../assets/images/anel-agilidade.png';
import pocaoAnestesicaImg from '../assets/images/pocao-anestesica.png';
import algemasImg from '../assets/images/algemas.png';
import cordaGanchoImg from '../assets/images/corda-e-gancho.png';
import espadaAcoImg from '../assets/images/espada-de-aco.png';
import dadoViciadoImg from '../assets/images/dado-viciado.png';
import chavePretaImg from '../assets/images/chave-preta.png';

// Keyframes para animação da imagem
const fadeInImage = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Components
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: `linear-gradient(160deg, rgba(15,17,20,0.95), rgba(25,27,30,0.92))`,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
    backdropFilter: 'blur(10px)',
    maxWidth: '920px',
    width: '92%',
    maxHeight: '86vh',
    overflow: 'hidden'
  }
}));

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: '"Cinzel", serif',
  fontSize: '24px',
  fontWeight: 900,
  color: '#E0DFDB',
  textAlign: 'center',
  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
});

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-root': {
    minHeight: '48px'
  },
  '& .MuiTab-root': {
    fontFamily: '"Cinzel", serif',
    fontWeight: '600',
    color: '#CBBBA0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '14px',
    '&.Mui-selected': {
      color: '#F5DEB3',
      fontWeight: '900'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#B67B03',
    height: '3px',
    boxShadow: '0 0 12px rgba(182,123,3,0.6)'
  }
});

const GoldDisplay = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px',
  background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(218,165,32,0.08) 100%)',
  border: '1px solid rgba(218,165,32,0.4)',
  borderRadius: '12px',
  margin: '12px 0 20px 0',
  boxShadow: '0 4px 24px rgba(218,165,32,0.25)'
});

const ItemCard = styled(Card)({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  margin: '8px 0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
  }
});

const ItemContent = styled(CardContent)({
  padding: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:last-child': {
    paddingBottom: '12px'
  }
});

const ItemInfo = styled(Box)({
  flex: 1,
  marginRight: '12px'
});



const ItemQuantity = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontWeight: '700',
  color: '#B67B03',
  fontSize: '16px',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  minWidth: '40px',
  textAlign: 'center'
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



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  ficha: Ficha;
  onUpdateFicha?: (ficha: Ficha) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ open, onClose, ficha, onUpdateFicha }) => {
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para hover da imagem
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Função para obter a imagem do item
  const getItemImage = useCallback((item: Item): string | undefined => {
    const imageMap: Record<string, string> = {
      'machado-de-guerra': machadoGuerraImg,
      'cota-de-malha': cotaMalhaImg,
      'almotolia-pocao-corrosiva': pocaoCorrosivaImg,
      'amuleto-sorte': amuletoSorteImg,
      'capa-camaleao': capaCamaleaoImg,
      'foguetes': foguetesImg,
      'espelho': espelhoImg,
      'provisoes': provisoesImg,
      'anel-agilidade': anelAgilidadeImg,
      'pocao-anestesica': pocaoAnestesicaImg,
      'algemas': algemasImg,
      'corda-e-gancho': cordaGanchoImg,
      'espada_inicial': espadaAcoImg,
      'dado-viciado': dadoViciadoImg,
      'chave-preta': chavePretaImg
    };
    
    // Buscar primeiro pelo ID exato
    if (imageMap[item.id]) {
      return imageMap[item.id];
    }
    
    // Buscar pelo nome para itens com IDs dinâmicos
    const nomeLower = item.nome.toLowerCase();
    if (nomeLower.includes('foguete')) return foguetesImg;
    if (nomeLower.includes('provisão') || nomeLower.includes('provisao')) return provisoesImg;
    if (nomeLower.includes('espada') && nomeLower.includes('aço')) return espadaAcoImg;
    if (nomeLower.includes('dado') && nomeLower.includes('viciado')) return dadoViciadoImg;
    
    return undefined;
  }, []);

  // Função para mostrar imagem no hover
  const handleItemHover = useCallback((event: React.MouseEvent, item: Item) => {
    const image = getItemImage(item);
    if (image) {
      setHoverImage({
        src: image,
        x: event.clientX - 1,
        y: event.clientY - 20
      });
    }
  }, [getItemImage]);

  // Função para esconder imagem no hover
  const handleItemLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  // Função para atualizar posição da imagem durante o hover (mais responsiva)
  const handleItemMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX - 400,
      y: event.clientY - 500
    } : null);
  }, []);

  // Organizar itens por categoria
  const organizeItems = (items: Item[]) => {
    return {
      armas: items.filter(item => item.tipo === 'arma'),
      armaduras: items.filter(item => item.tipo === 'armadura'),
      equipamentos: items.filter(item => item.tipo === 'equipamento'),
      provisoes: items.filter(item => item.tipo === 'provisao'),
      ouro: items.filter(item => item.tipo === 'ouro')
    };
  };

  const categorizedItems = organizeItems(ficha.bolsa);

  // Calcular total de moedas de ouro
  const totalGold = categorizedItems.ouro.reduce((total, item) => {
    return total + (item.quantidade || 0);
  }, 0);

  const renderItemsList = (items: Item[], emptyMessage: string) => {
    // Agrupar itens iguais e somar quantidades
    const groupedItems = items.reduce((acc, item) => {
      // Usar o NOME como chave para agrupar (itens com mesmo nome são agrupados)
      const existingItem = acc.find(i => i.nome === item.nome);
      
      if (existingItem) {
        // Se já existe, somar a quantidade
        existingItem.quantidade = (existingItem.quantidade || 1) + (item.quantidade || 1);
      } else {
        // Se não existe, adicionar novo item
        acc.push({ ...item, quantidade: item.quantidade || 1 });
      }
      
      return acc;
    }, [] as Item[]);

    if (groupedItems.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#8B4513',
          fontStyle: 'italic'
        }}>
          {emptyMessage}
        </Box>
      );
    }

    return groupedItems.map((item, index) => (
      <ItemCard 
        key={`${item.id}-${index}`}
        onMouseEnter={(e) => handleItemHover(e, item)}
        onMouseLeave={handleItemLeave}
        onMouseMove={handleItemMove}
      >
        <ItemContent>
          <ItemInfo>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Cinzel", serif',
                fontWeight: '700',
                color: '#E0DFDB',
                marginBottom: '4px'
              }}
            >
              {item.nome}
            </Typography>
            {item.adquiridoEm && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#B67B03',
                  fontSize: '12px',
                  marginBottom: '4px'
                }}
              >
                Adquirido em: {item.adquiridoEm}
              </Typography>
            )}
            {item.descricao && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#8B4513', 
                  fontStyle: 'italic',
                  fontSize: '14px',
                  marginTop: '4px'
                }}
              >
                {item.descricao}
              </Typography>
            )}
            
            {/* Efeitos dos itens */}
            {item.efeitos && (
              <Box sx={{ marginTop: '8px' }}>
                {/* Efeitos de combate */}
                {item.efeitos.combat && (
                  <Box sx={{ marginBottom: '4px' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#D32F2F',
                        fontWeight: 600,
                        display: 'block'
                      }}
                    >
                      Combate: {item.efeitos.combat.damage} dano à {item.efeitos.combat.damageType === 'forca' ? 'FORÇA' : 'SORTE'}
                      {item.efeitos.combat.damageCondition && ` (${item.efeitos.combat.damageCondition})`}
                    </Typography>
                  </Box>
                )}
                
                {/* Modificadores de atributos */}
                {item.efeitos.attributes && (
                  <Box sx={{ marginBottom: '4px' }}>
                    {Object.entries(item.efeitos.attributes).map(([attr, value]) => {
                      if (value === 0) return null;
                      const attrLabel = attr === 'pericia' ? 'PERÍCIA' : 
                                      attr === 'forca' ? 'FORÇA' : 
                                      attr === 'sorte' ? 'SORTE' : 
                                      attr === 'ataque' ? 'ATAQUE' : attr;
                      return (
                        <Typography
                          key={attr}
                          variant="caption"
                          sx={{
                            color: value > 0 ? '#388E3C' : '#D32F2F',
                            fontWeight: 600,
                            display: 'block'
                          }}
                        >
                          {attrLabel}: {value > 0 ? '+' : ''}{value}
                        </Typography>
                      );
                    })}
                  </Box>
                )}
                
                {/* Durabilidade */}
                {item.efeitos.durability && (
                  <Box sx={{ marginBottom: '4px' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#F57C00',
                        fontWeight: 600,
                        display: 'block'
                      }}
                    >
                      Durabilidade: {item.durabilidadeAtual || item.efeitos.durability}/{item.efeitos.durability}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </ItemInfo>
          {item.quantidade && item.quantidade > 1 && (
            <ItemQuantity>
              {item.quantidade}x
            </ItemQuantity>
          )}
        </ItemContent>
      </ItemCard>
    ));
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        <Box sx={{ flex: 1 }}>
          💰 Bolsa de {ficha.nome}
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: '#8B4513',
            '&:hover': { 
              backgroundColor: 'rgba(139,69,19,0.1)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent sx={{ padding: '0' }}>
        {/* Atributos e Ouro */}
        <Box sx={{ padding: '16px' }}>
          {/* Atributos */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            {[{ key: 'pericia', label: 'Perícia' }, { key: 'forca', label: 'Força' }, { key: 'sorte', label: 'Sorte' }].map(({ key, label }) => {
              const atr = (ficha as any)[key] as { inicial: number; atual: number };
              const atualClamped = Math.min(atr.atual, atr.inicial);
              const modificador = ficha.modificadoresAtivos?.[key as keyof typeof ficha.modificadoresAtivos] || 0;
              return (
                <Card key={key} sx={{ border: '2px solid #8B4513', background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,222,179,0.6))' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', color: '#4a2c00', mb: 2, textAlign: 'center' }}>{label}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
                      {/* Coluna Inicial */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 600 }}>Inicial</Typography>
                        <Chip 
                          label={atr.inicial} 
                          sx={{ 
                            fontWeight: 900, 
                            fontFamily: '"Cinzel", serif',
                            backgroundColor: '#4a2c00',
                            color: '#F5DEB3',
                            border: '1px solid #D2B48C',
                            minWidth: 64
                          }} 
                        />
                      </Box>
                      
                      {/* Coluna Atual */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 600 }}>Atual</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip 
                            label={atualClamped} 
                            sx={{ 
                              fontWeight: 900, 
                              fontFamily: '"Cinzel", serif',
                              backgroundColor: '#8B4513',
                              color: '#F5DEB3',
                              border: '1px solid #D2B48C',
                              minWidth: 64
                            }} 
                          />
                          {/* Mostrar modificador ativo */}
                          {modificador !== 0 && (
                            <Chip 
                              label={`${modificador > 0 ? '+' : ''}${modificador}`}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                fontFamily: '"Cinzel", serif',
                                backgroundColor: modificador > 0 ? '#388E3C' : '#D32F2F',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                height: '20px',
                                minWidth: 48
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Display de Moedas de Ouro */}
          <GoldDisplay>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Cinzel", serif',
                fontWeight: '700',
                color: '#B8860B',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              💰 Moedas de Ouro:
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: '"Cinzel", serif',
                fontWeight: '900',
                color: '#DAA520',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {totalGold}
            </Typography>
          </GoldDisplay>
        </Box>

        <Divider sx={{ borderColor: '#8B4513', opacity: 0.3 }} />

        {/* Abas do Inventário (sem Ouro para evitar repetição) */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="⚔️ Armas" />
            <Tab label="🛡️ Armaduras" />
            <Tab label="🎒 Equipamentos" />
            <Tab label="🍞 Provisões" />
          </StyledTabs>
        </Box>

        {/* Conteúdo das Abas */}
        <Box sx={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            {renderItemsList(categorizedItems.armas, "Nenhuma arma no inventário")}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderItemsList(categorizedItems.armaduras, "Nenhuma armadura no inventário")}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            {renderItemsList(categorizedItems.equipamentos, "Nenhum equipamento no inventário")}
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            {renderItemsList(categorizedItems.provisoes, "Nenhuma provisão no inventário")}
          </TabPanel>
          
          {/* Removido painel de Ouro para não duplicar informação com o topo */}
        </Box>
      </DialogContent>
      
      {/* Imagem de hover */}
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
    </StyledDialog>
  );
};

export default InventoryModal;
