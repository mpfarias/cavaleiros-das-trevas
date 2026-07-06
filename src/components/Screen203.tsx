import React, { useMemo, useState, useCallback } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
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

interface Screen203Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen203: React.FC<Screen203Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(203);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(203);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceRolled, setDiceRolled] = useState(false);
  const [survived, setSurvived] = useState(false);
  const [forceLost, setForceLost] = useState(0);
  const [showForceAlert, setShowForceAlert] = useState(false);

  const handleRollDice = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceComplete = useCallback((_dice: number[], total: number) => {
    setShowDiceModal(false);

    const damage = total;
    const novaForca = Math.max(0, ficha.forca.atual - damage);

    const fichaAtualizada: Ficha = {
      ...ficha,
      forca: {
        ...ficha.forca,
        atual: novaForca,
      },
    };

    onUpdateFicha(fichaAtualizada);
    setForceLost(damage);
    setDiceRolled(true);
    setSurvived(novaForca > 0);

    setShowForceAlert(true);
    setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);

    if (novaForca <= 0) {
      setTimeout(() => onGoToScreen(999), 2000);
    }
  }, [ficha, onUpdateFicha, onGoToScreen]);

  const showChoices = diceRolled && survived;

  return (
    <Container data-screen="screen-203">
      <DiceRollModal3D
        open={showDiceModal}
        numDice={1}
        onComplete={handleDiceComplete}
        bonus={0}
      />

      <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
        ⚔️ Você perdeu {forceLost} ponto{forceLost !== 1 ? 's' : ''} de FORÇA!
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
            Só quando você se espatifa no chão percebe que calculou mal a distância até o cavalo.
            <br /><br />
            Assustado com sua queda, o animal desfere um coice e dispara em meio a uma nuvem de poeira.
            <br /><br />
            Machucado, você se levanta e, mancando, segue até uma rua larga cercada por casas em ruínas. De repente, a porta de uma delas se abre e um velho coloca a cabeça para fora.
            <br /><br />
            — Psiu! Ei, garoto! Esconda-se aqui por uma Moeda de Ouro.
            <br /><br />
            Você olha à frente e vê uma pequena praça cheia de gente.
            <br /><br />
            Você caiu no chão, e perdeu FORÇA por isso. Role os dados. O resultado será subtraído do seu total da FORÇA.
          </NarrativeText>

          {!diceRolled && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ChoiceButton onClick={handleRollDice}>
                Role os dados
              </ChoiceButton>
            </Box>
          )}

          {showChoices && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(344); }}>
                Aceita a oferta do velho
              </ChoiceButton>
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(225); }}>
                Ignora o convite e segue para a praça
              </ChoiceButton>
            </Box>
          )}
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen203;
