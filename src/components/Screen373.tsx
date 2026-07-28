import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';
import { atualizarQuantidade, totalOuro } from '../utils/inventory';

type Phase = 'offer' | 'readyToRoll' | 'accepted' | 'rejected';

interface Screen373Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen373: React.FC<Screen373Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(373);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(373);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const accentColor = theme.locationLink.color;
  const borderColor = theme.cardWrap.border.includes('solid')
    ? theme.cardWrap.border.split(' ').slice(-1)[0]
    : accentColor;

  const BetInput = useMemo(
    () => styled(TextField)({
      '& .MuiOutlinedInput-root': {
        fontFamily: '"Cinzel", serif',
        fontSize: '16px',
        color: theme.narrativeText.color,
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderRadius: '8px',
        '& fieldset': {
          borderColor,
          borderWidth: '2px',
        },
        '&:hover fieldset': {
          borderColor: accentColor,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.choiceButton.hoverBorderColor,
        },
      },
      '& .MuiInputLabel-root': {
        fontFamily: '"Cinzel", serif',
        color: accentColor,
        fontWeight: 600,
      },
      '& .MuiFormHelperText-root': {
        fontFamily: '"Spectral", serif',
      },
    }),
    [theme, accentColor, borderColor],
  );

  const [phase, setPhase] = useState<Phase>('offer');
  const [showCoinDialog, setShowCoinDialog] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [error, setError] = useState('');
  const [coinsOffered, setCoinsOffered] = useState(0);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [showGoldAlert, setShowGoldAlert] = useState(false);

  const availableGold = totalOuro(ficha);

  const validateCoinAmount = (value: string) => {
    const numValue = parseInt(value, 10);
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

  const handleOpenOffer = () => {
    playClick();
    if (availableGold <= 0) {
      setError('Você não tem Moedas de Ouro');
      return;
    }
    setShowCoinDialog(true);
  };

  const handleConfirmOffer = () => {
    if (!validateCoinAmount(coinAmount)) return;
    playClick();
    const amount = parseInt(coinAmount, 10);
    setCoinsOffered(amount);
    setShowCoinDialog(false);
    setPhase('readyToRoll');
  };

  const handleRollDice = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceComplete = useCallback((_dice: number[], total: number) => {
    setShowDiceModal(false);
    setDiceResult(total);

    if (total <= coinsOffered) {
      const moedasItem = ficha.bolsa.find((item) => item.tipo === 'ouro');
      if (moedasItem) {
        const novaQuantidade = Math.max(0, (moedasItem.quantidade || 0) - coinsOffered);
        onUpdateFicha(atualizarQuantidade(ficha, moedasItem.id, novaQuantidade));
        setShowGoldAlert(true);
        setTimeout(() => setShowGoldAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }
      setPhase('accepted');
    } else {
      setPhase('rejected');
    }
  }, [coinsOffered, ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-373">
      <GameAlert sx={{ top: '120px' }} visible={showGoldAlert} onClose={() => setShowGoldAlert(false)}>
        💰 Você pagou {coinsOffered} Moeda{coinsOffered !== 1 ? 's' : ''} de Ouro!
      </GameAlert>

      <VolumeControl />

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
              onClick={() => {
                playClick();
                togglePlay();
              }}
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
                  cursor: 'not-allowed',
                },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <DiceRollModal3D
        open={showDiceModal}
        numDice={1}
        onComplete={handleDiceComplete}
        bonus={0}
      />

      <Dialog
        open={showCoinDialog}
        onClose={() => setShowCoinDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.cardWrap.background,
            border: theme.cardWrap.border,
            borderRadius: theme.cardWrap.borderRadius,
            boxShadow: theme.cardWrap.boxShadow,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Cinzel", serif',
            color: theme.narrativeText.color,
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          Quantas moedas oferecer?
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: '"Spectral", serif',
              color: theme.narrativeText.color,
              marginBottom: '16px',
            }}
          >
            Você tem {availableGold} moeda{availableGold !== 1 ? 's' : ''} de ouro disponível{availableGold !== 1 ? 'eis' : ''}.
            <br />
            Digite quantas Moedas de Ouro deseja oferecer ao bandido.
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
              color: accentColor,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmOffer}
            disabled={!coinAmount || !!error || parseInt(coinAmount, 10) <= 0 || parseInt(coinAmount, 10) > availableGold}
            variant="contained"
            sx={{
              fontFamily: '"Cinzel", serif',
              background: theme.choiceButton.background,
              color: theme.choiceButton.color,
              border: theme.choiceButton.border,
              '&:hover': {
                background: theme.choiceButton.hoverBackground,
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Decida quantas Moedas de Ouro deseja oferecer ao bandido.
          </NarrativeText>

          {phase === 'offer' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ChoiceButton onClick={handleOpenOffer}>
                Oferecer Moedas de Ouro
              </ChoiceButton>
            </Box>
          )}

          {phase === 'readyToRoll' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography
                sx={{
                  fontFamily: '"Spectral", serif',
                  color: theme.narrativeText.color,
                  textAlign: 'center',
                  marginBottom: '8px',
                }}
              >
                Você ofereceu {coinsOffered} Moeda{coinsOffered !== 1 ? 's' : ''} de Ouro.
                <br />
                Role 1 dado. Se o resultado for menor ou igual à oferta, o bandido aceita.
              </Typography>
              <ChoiceButton onClick={handleRollDice}>
                Role 1 dado
              </ChoiceButton>
            </Box>
          )}

          {phase === 'accepted' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography
                sx={{
                  color: '#2E7D32',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: '"Cinzel", serif',
                  fontSize: '18px',
                  marginBottom: '8px',
                }}
              >
                ✅ O bandido aceitou a oferta!
                {diceResult !== null && (
                  <>
                    <br />
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: '"Spectral", serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        color: theme.narrativeText.color,
                      }}
                    >
                      (Dado: {diceResult} ≤ {coinsOffered} moedas)
                    </Typography>
                  </>
                )}
              </Typography>

              <ChoiceButton onClick={() => { playClick(); onGoToScreen(349); }}>
                Seguir para o norte, em busca do eremita, que o bandido afirma estar morto
              </ChoiceButton>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(44); }}>
                Voltar para o sul, caso ache que já perdeu tempo demais por aqui
              </ChoiceButton>
            </Box>
          )}

          {phase === 'rejected' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography
                sx={{
                  color: '#D32F2F',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: '"Cinzel", serif',
                  fontSize: '18px',
                  marginBottom: '8px',
                }}
              >
                ❌ O bandido rejeitou a oferta!
                {diceResult !== null && (
                  <>
                    <br />
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: '"Spectral", serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        color: theme.narrativeText.color,
                      }}
                    >
                      (Dado: {diceResult} &gt; {coinsOffered} moedas)
                    </Typography>
                  </>
                )}
              </Typography>

              <ChoiceButton onClick={() => { playClick(); onGoToScreen(92); }}>
                O bandido rejeitou a oferta
              </ChoiceButton>
            </Box>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen373;
