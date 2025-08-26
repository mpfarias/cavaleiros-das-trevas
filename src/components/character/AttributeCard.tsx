import { memo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Casino as CasinoIcon } from '@mui/icons-material';
import type { Ficha } from '../../types';
import { ATTRIBUTE_LIMITS, DICE_FORMULAS } from '../../constants/character';
import NumberInput from '../ui/NumberInput';
import DiceRollModal3D from '../ui/DiceRollModal3D';
import { useDiceSound } from '../../hooks/useDiceSound';

interface AttributeCardProps {
  title: string;
  attr: 'pericia' | 'forca' | 'sorte';
  ficha: Ficha;
  usarMeusDados: boolean;
  onAtributoChange: (attr: 'pericia' | 'forca' | 'sorte', valor: number) => void;
  rolagensFeitas?: number;
  maxRolagens?: number;
  onRoll?: () => void; // Função para executar a rolagem
}

const AttributeCard: React.FC<AttributeCardProps> = memo(({
  title,
  attr,
  ficha,
  usarMeusDados,
  onAtributoChange,
  rolagensFeitas = 0,
  maxRolagens = 3,
  onRoll
}) => {
  const limits = ATTRIBUTE_LIMITS[attr];
  const formula = DICE_FORMULAS[attr];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const playDice = useDiceSound();

  const handleAtributoChange = useCallback((valor: number) => {
    onAtributoChange(attr, valor);
  }, [attr, onAtributoChange]);

  const handleRollClick = useCallback(() => {
    if (rolagensFeitas >= maxRolagens) return;
    
    // Executar a rolagem se a função foi fornecida
    if (onRoll) {
      onRoll();
    }
    
    playDice();
    setIsModalOpen(true);
  }, [rolagensFeitas, maxRolagens, onRoll, playDice]);

  const handleRollComplete = useCallback((_dice: number[], total: number) => {
    setIsModalOpen(false);
    onAtributoChange(attr, total);
  }, [attr, onAtributoChange]);



  const getDescription = () => {
    switch (attr) {
      case 'pericia': return 'Representa sua habilidade em combate.';
      case 'forca': return 'Resistência física e capacidade de sobreviver.';
      case 'sorte': return 'Quanto a fortuna costuma estar do seu lado.';
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Título do atributo */}
        <Typography variant="h6" component="strong" sx={{ mb: 2, textAlign: 'center' }}>
          {title}
        </Typography>
        
        {/* Grid de valores - Inicial e Atual lado a lado */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 2, 
          mb: 2,
          alignItems: 'start'
        }}>
          {/* Coluna Inicial */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Inicial
            </Typography>
            <Chip
              label={ficha[attr].inicial || '–'}
              sx={{ 
                minWidth: 64, 
                fontWeight: 700,
                backgroundColor: '#8B4513',
                color: '#F5DEB3',
                border: '1px solid #D2B48C'
              }}
              aria-label={`Valor inicial de ${title}: ${ficha[attr].inicial || 'não definido'}`}
            />
          </Box>
          
          {/* Coluna Atual */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Atual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={ficha[attr].atual || '–'}
                sx={{ 
                  minWidth: 64, 
                  fontWeight: 700,
                  backgroundColor: '#8B4513',
                  color: '#F5DEB3',
                  border: '1px solid #D2B48C'
                }}
                aria-label={`Valor atual de ${title}: ${ficha[attr].atual || 'não definido'}`}
              />
              {/* Mostrar modificador ativo */}
              {ficha.modificadoresAtivos[attr] !== 0 && (
                <Chip
                  label={`${ficha.modificadoresAtivos[attr] > 0 ? '+' : ''}${ficha.modificadoresAtivos[attr]}`}
                  size="small"
                  color={ficha.modificadoresAtivos[attr] > 0 ? 'success' : 'error'}
                  sx={{
                    minWidth: 48,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                  aria-label={`Modificador de ${title}: ${ficha.modificadoresAtivos[attr] > 0 ? '+' : ''}${ficha.modificadoresAtivos[attr]}`}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        {usarMeusDados ? (
          <NumberInput
            value={ficha[attr].inicial}
            onChange={handleAtributoChange}
            min={limits.min}
            max={limits.max}
            label={`Digite um valor para ${title}`}
            aria-describedby={`${attr}-description`}
          />
        ) : (
          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRollClick}
              startIcon={<CasinoIcon />}
              disabled={rolagensFeitas >= maxRolagens}
              aria-label={`Rolar dados para ${title}: ${formula.text}`}
              sx={{
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }
              }}
            >
              {formula.text}
            </Button>
            {rolagensFeitas > 0 && (
              <Chip
                label={`${rolagensFeitas}/${maxRolagens}`}
                size="small"
                color={rolagensFeitas >= maxRolagens ? 'error' : 'default'}
                sx={{
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
            )}
          </Stack>
        )}

        <DiceRollModal3D
          open={isModalOpen}
          numDice={formula.dice === '2d6' ? 2 : 1}
          onComplete={handleRollComplete}
          title={`Rolando ${title}`}
          bonus={formula.bonus}
        />
        
        <Typography 
          id={`${attr}-description`}
          variant="caption" 
          color="text.secondary"
        >
          {getDescription()}
        </Typography>
      </CardContent>
    </Card>
  );
});

AttributeCard.displayName = 'AttributeCard';

export default AttributeCard;
