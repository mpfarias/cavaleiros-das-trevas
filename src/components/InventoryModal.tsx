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
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { Ficha, Item } from '../types';

// Styled Components
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(160deg, rgba(245,222,179,0.98), rgba(222,184,135,0.95))',
    border: '3px solid #8B4513',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh'
  }
}));

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: '"Cinzel", serif',
  fontSize: '28px',
  fontWeight: '900',
  color: '#4a2c00',
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  borderBottom: '2px solid #8B4513',
  paddingBottom: '16px',
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
    color: '#8B4513',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '14px',
    '&.Mui-selected': {
      color: '#4a2c00',
      fontWeight: '900'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#8B4513',
    height: '3px'
  }
});

const GoldDisplay = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px',
  background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(218,165,32,0.1) 100%)',
  border: '2px solid #DAA520',
  borderRadius: '12px',
  margin: '16px 0',
  boxShadow: '0 4px 12px rgba(218,165,32,0.3)'
});

const ItemCard = styled(Card)({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,222,179,0.6) 100%)',
  border: '1px solid #D2B48C',
  borderRadius: '8px',
  margin: '8px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
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
  color: '#3d2817'
});

const ItemQuantity = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: '14px',
  fontWeight: '700',
  color: '#8B4513',
  background: 'rgba(139,69,19,0.1)',
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid rgba(139,69,19,0.3)'
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
        {/* Display de Moedas de Ouro */}
        <Box sx={{ padding: '16px' }}>
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

        {/* Abas do Inventário */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="⚔️ Armas" />
            <Tab label="🛡️ Armaduras" />
            <Tab label="🎒 Equipamentos" />
            <Tab label="🍞 Provisões" />
            <Tab label="💰 Ouro" />
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
          
          <TabPanel value={tabValue} index={4}>
            {renderItemsList(categorizedItems.ouro, "Nenhuma moeda de ouro no inventário")}
          </TabPanel>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default InventoryModal;
