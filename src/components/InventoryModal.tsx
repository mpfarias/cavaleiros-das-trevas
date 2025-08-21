import React, { useState } from 'react';
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
  Grid,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { Ficha, Item } from '../types';

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
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
  }
});

const ItemContent = styled(CardContent)({
  padding: '12px 16px !important',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const ItemName = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: '16px',
  fontWeight: '600',
  color: '#E0DFDB'
});

const ItemQuantity = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: '14px',
  fontWeight: '700',
  color: '#F5DEB3',
  background: 'rgba(255,255,255,0.06)',
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.12)'
});

const EmptyMessage = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#8B4513',
  textAlign: 'center',
  padding: '32px',
  opacity: 0.7
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
}

const InventoryModal: React.FC<InventoryModalProps> = ({ open, onClose, ficha }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
    if (items.length === 0) {
      return <EmptyMessage>{emptyMessage}</EmptyMessage>;
    }

    return items.map((item, index) => (
      <ItemCard key={index}>
        <ItemContent>
          <Box>
            <ItemName>{item.nome}</ItemName>
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
          </Box>
          <ItemQuantity>
            {item.quantidade}x
          </ItemQuantity>
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
              return (
                <Card key={key} sx={{ border: '2px solid #8B4513', background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,222,179,0.6))' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', color: '#4a2c00', mb: 1 }}>{label}</Typography>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#8B4513' }}>Inicial</Typography>
                        <Chip 
                          label={atr.inicial} 
                          sx={{ 
                            fontWeight: 900, 
                            fontFamily: '"Cinzel", serif', 
                            mt: .5,
                            backgroundColor: '#4a2c00',
                            color: '#F5DEB3',
                            border: '1px solid #D2B48C'
                          }} 
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#8B4513' }}>Atual</Typography>
                        <Chip 
                          label={atualClamped} 
                          sx={{ 
                            fontWeight: 900, 
                            fontFamily: '"Cinzel", serif', 
                            mt: .5,
                            backgroundColor: '#4a2c00',
                            color: '#F5DEB3',
                            border: '1px solid #D2B48C'
                          }} 
                        />
                      </Grid>
                    </Grid>
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
    </StyledDialog>
  );
};

export default InventoryModal;
