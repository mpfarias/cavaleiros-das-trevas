import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import type { Ficha } from '../types';

interface Screen58Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

type Bonuses = {
  pericia: number;
  sorte: number;
  forca: number;
  description: string;
};

const RESULT_EFFECTS: Record<number, Bonuses> = {
  1: { pericia: 0, sorte: 0, forca: 0, description: 'Nada acontece.' },
  2: { pericia: 0, sorte: 0, forca: 2, description: 'Você ganha 2 pontos de FORÇA.' },
  3: { pericia: 0, sorte: 1, forca: 2, description: 'Você ganha 1 ponto de SORTE e 2 de FORÇA.' },
  4: { pericia: 0, sorte: 1, forca: 4, description: 'Você ganha 1 ponto de SORTE e 4 de FORÇA.' },
  5: { pericia: 0, sorte: 2, forca: 4, description: 'Você ganha 2 pontos de SORTE e 4 de FORÇA.' },
  6: { pericia: 1, sorte: 2, forca: 4, description: 'Você ganha 1 ponto de PERÍCIA, 2 de SORTE e 4 de FORÇA.' },
};

const Screen58: React.FC<Screen58Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(58);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(58);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const savedResult = ficha.flags?.wizardWellResult;
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(savedResult ?? null);
  const [showResultAlert, setShowResultAlert] = useState(false);

  const handleRollDice = () => {
    if (diceResult !== null) return;
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceComplete = useCallback((_dice: number[], total: number) => {
    setShowDiceModal(false);

    if (ficha.flags?.wizardWellResult !== undefined) {
      setDiceResult(ficha.flags.wizardWellResult);
      return;
    }

    const effect = RESULT_EFFECTS[total];
    const updatedFicha: Ficha = {
      ...ficha,
      pericia: {
        ...ficha.pericia,
        atual: Math.min(ficha.pericia.inicial, ficha.pericia.atual + effect.pericia),
      },
      sorte: {
        ...ficha.sorte,
        atual: Math.min(ficha.sorte.inicial, ficha.sorte.atual + effect.sorte),
      },
      forca: {
        ...ficha.forca,
        atual: Math.min(ficha.forca.inicial, ficha.forca.atual + effect.forca),
      },
      flags: {
        ...ficha.flags,
        wizardWellResult: total,
      },
    };

    setDiceResult(total);
    onUpdateFicha(updatedFicha);
    setShowResultAlert(true);
    setTimeout(() => setShowResultAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, [ficha, onUpdateFicha]);

  const resultEffect = diceResult !== null ? RESULT_EFFECTS[diceResult] : null;
  const accentColor = theme.locationLink.color;
  const borderColor = theme.cardWrap.border.includes('solid')
    ? theme.cardWrap.border.split(' ').slice(-1)[0]
    : accentColor;

  return (
    <Container data-screen="screen-58">
      <GameAlert
        sx={{ top: '120px' }}
        visible={showResultAlert}
        onClose={() => setShowResultAlert(false)}
      >
        🎲 Resultado {diceResult}: {resultEffect?.description}
      </GameAlert>

      <VolumeControl />

      <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
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
                '&:disabled': { cursor: 'not-allowed' },
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

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Você junta as mãos em concha e leva a água aos lábios.
            <br /><br />
            O líquido mágico faz efeito imediatamente, deixando sua cabeça girando.
            <br /><br />
            Você irá rolar 1 dado, e a tabela abaixo mostra o efeito de cada resultado:
          </NarrativeText>

          <TableContainer
            sx={{
              margin: '24px 0',
              border: `2px solid ${borderColor}`,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
            }}
          >
            <Table size="small" aria-label="Efeitos da água do Poço do Feiticeiro">
              <TableHead>
                <TableRow sx={{ background: 'rgba(0,0,0,0.12)' }}>
                  <TableCell
                    sx={{
                      color: theme.narrativeText.color,
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      textAlign: 'center',
                      borderColor,
                    }}
                  >
                    Resultado
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.narrativeText.color,
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      borderColor,
                    }}
                  >
                    Efeito
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(RESULT_EFFECTS).map(([result, effect]) => (
                  <TableRow
                    key={result}
                    sx={diceResult === Number(result) ? { background: 'rgba(218,165,32,0.28)' } : undefined}
                  >
                    <TableCell
                      sx={{
                        color: theme.narrativeText.color,
                        fontFamily: '"Cinzel", serif',
                        fontWeight: 700,
                        textAlign: 'center',
                        borderColor,
                      }}
                    >
                      {result}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.narrativeText.color,
                        fontFamily: '"Spectral", serif',
                        borderColor,
                      }}
                    >
                      {effect.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            sx={{
              color: theme.narrativeText.color,
              fontFamily: '"Spectral", serif',
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Você só pode beber da água uma única vez.
          </Typography>

          {diceResult === null ? (
            <ChoiceButton onClick={handleRollDice}>
              Rolar 1 dado
            </ChoiceButton>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Typography
                sx={{
                  color: accentColor,
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: '18px',
                }}
              >
                🎲 Resultado: {diceResult} — {resultEffect?.description}
              </Typography>

              <ChoiceButton onClick={() => { playClick(); onGoToScreen(349); }}>
                Ir para o norte
              </ChoiceButton>

              <ChoiceButton onClick={() => { playClick(); onGoToScreen(44); }}>
                Ir para o sul
              </ChoiceButton>
            </Box>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen58;
