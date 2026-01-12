import React, { useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DiceRollModal3D from './ui/DiceRollModal3D';
import type { Ficha } from '../types';
import { atualizarQuantidade } from '../utils/inventory';
import pracaMasonicImg from '../assets/images/locais/praca_masonic.png';

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
    linear-gradient(135deg, #2c1810 0%, #3d2817 25%, #2c1810 50%, #1a0f0a 75%, #0d0503 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,50,0.2) 0%, transparent 50%)
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

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 100%)',
    border: '3px solid #8B4513',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: '"Cinzel", serif',
  fontSize: '24px',
  fontWeight: 700,
  color: '#8B4513',
  textAlign: 'center',
  borderBottom: '2px solid #8B4513',
  paddingBottom: '16px'
});

const BetInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: '"Spectral", serif',
    '& fieldset': {
      borderColor: '#8B4513',
    },
    '&:hover fieldset': {
      borderColor: '#A0522D',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8B4513',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Spectral", serif',
    color: '#3d2817',
  },
  '& .MuiInputBase-input': {
    color: '#3d2817',
    fontFamily: '"Spectral", serif',
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

const LocationLink = styled('span')({
  color: '#8B4513',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#A0522D'
  }
});

interface Screen225Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen225: React.FC<Screen225Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(225);
  const playClick = useClickSound(0.2);
  
  const [showCoinDialog, setShowCoinDialog] = useState(false);
  const [coinAmount, setCoinAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState<number>(0);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Calcular moedas disponíveis
  const availableGold = ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);

  const validateCoinAmount = (value: string) => {
    const numValue = parseInt(value);
    if (!value || isNaN(numValue) || numValue <= 0) {
      setError('Digite um valor válido maior que 0');
      return false;
    }
    if (numValue > availableGold) {
      setError(`Você só tem ${availableGold} moedas disponíveis`);
      return false;
    }
    setError('');
    return true;
  };

  const handleUseCoins = () => {
    playClick();
    if (availableGold > 0) {
      setShowCoinDialog(true);
    } else {
      // Sem moedas, vai para tela 199
      onGoToScreen(199);
    }
  };

  const handleConfirmCoins = () => {
    if (!validateCoinAmount(coinAmount)) return;
    
    const amount = parseInt(coinAmount);
    setCoinsToUse(amount);
    setShowCoinDialog(false);
    setShowDiceModal(true);
  };

  const handleDiceComplete = (dice: number[], total: number) => {
    const diceResult = dice[0]; // Resultado do dado (1 a 6)
    
    setShowDiceModal(false);

    // Remover moedas usadas do inventário
    const moedasItem = ficha.bolsa.find(item => item.tipo === 'ouro');
    if (moedasItem) {
      const novaQuantidade = Math.max(0, (moedasItem.quantidade || 0) - coinsToUse);
      const fichaAtualizada = atualizarQuantidade(ficha, moedasItem.id, novaQuantidade);
      onUpdateFicha(fichaAtualizada);
    }

    // Salvar quantidade de moedas usadas no localStorage para mostrar alerta nas telas 57 e 389
    try {
      localStorage.setItem('cavaleiro:moedasUsadas225', String(coinsToUse));
    } catch (error) {
      console.error('❌ [Screen225] Erro ao salvar moedas usadas no localStorage:', error);
    }

    // Comparar resultado do dado com número de moedas
    // Se resultado > moedas -> tela 389
    // Se resultado <= moedas -> tela 57
    if (diceResult > coinsToUse) {
      onGoToScreen(389);
    } else {
      onGoToScreen(57);
    }
  };

  const handleNoCoins = () => {
    playClick();
    onGoToScreen(199);
  };

  const handleLocationHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: pracaMasonicImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleLocationLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleLocationMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleLocationClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-225">
      <VolumeControl />

      {currentGroup && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => { playClick(); togglePlay?.(); }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <DiceRollModal3D
        open={showDiceModal}
        numDice={1}
        onComplete={handleDiceComplete}
        bonus={0}
      />

      <StyledDialog 
        open={showCoinDialog} 
        onClose={() => setShowCoinDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <StyledDialogTitle>
          Quantas moedas usar?
        </StyledDialogTitle>
        <DialogContent>
          <Typography sx={{ 
            fontFamily: '"Spectral", serif',
            color: '#3d2817',
            marginBottom: '16px'
          }}>
            Você tem {availableGold} moeda{availableGold !== 1 ? 's' : ''} de ouro disponível{availableGold !== 1 ? 'eis' : ''}.
            <br/>
            Digite quantas moedas deseja usar para distrair os guardas.
          </Typography>
          <BetInput
            label="Quantidade de moedas"
            type="number"
            value={coinAmount}
            onChange={(e) => {
              setCoinAmount(e.target.value);
              if (error) setError('');
            }}
            onBlur={() => validateCoinAmount(coinAmount)}
            error={!!error}
            helperText={error}
            inputProps={{ min: 1, max: availableGold }}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: '8px' }}>
          <Button
            onClick={() => {
              playClick();
              setShowCoinDialog(false);
              setCoinAmount('');
              setError('');
            }}
            sx={{
              fontFamily: '"Cinzel", serif',
              color: '#8B4513'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmCoins}
            disabled={!coinAmount || !!error || parseInt(coinAmount) <= 0 || parseInt(coinAmount) > availableGold}
            variant="contained"
            sx={{
              fontFamily: '"Cinzel", serif',
              background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
              color: '#F5DEB3',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </StyledDialog>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Você acaba de entrar em uma das maiores atrações turísticas de Royal Lendle — a{' '}
            <LocationLink
              onMouseEnter={handleLocationHover}
              onMouseLeave={handleLocationLeave}
              onMouseMove={handleLocationMove}
              onClick={handleLocationClick}
            >
              Praça Masonic
            </LocationLink>
            , conhecida pelas barracas de mercadores e pelos edifícios ao redor, entre os quais se destacam os trabalhos em baixo-relevo e esculturas retratando a vida de Orjan, o Construtor. Há quem diga que as medidas, os ângulos e as proporções da praça têm um significado místico.
            <br/><br/>
            Mas o que importa agora são os guardas que estão lá vigiando as saídas. Por enquanto não estão procurando por você, mas não vai levar muito até que isso aconteça — e pior, até que apareçam os outros guardas que estão no seu encalço.
            <br/><br/>
            Você precisa de uma manobra de distração; por exemplo, jogar Moedas de Ouro para o alto.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={handleUseCoins}>
              Usar moedas para distrair os guardas
            </ChoiceButton>
            <ChoiceButton onClick={handleNoCoins}>
              Não tem moedas ou não quero usar as moedas
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="Praça Masonic" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={pracaMasonicImg}
        imageAlt="Praça Masonic"
      />
    </Container>
  );
};

export default Screen225;
