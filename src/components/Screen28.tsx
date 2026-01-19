import React, { useMemo, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

interface Screen28Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen28: React.FC<Screen28Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(28);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(145);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [showDiceModal, setShowDiceModal] = useState(false);

  const handleRolarDado = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (dice: number[], total: number) => {
    setShowDiceModal(false);
    
    const resultado = dice[0]; // Pegar apenas o primeiro dado
    
    // Mapear resultado para tela de destino
    const destinoMap: Record<number, number> = {
      1: 8,
      2: 394,
      3: 259,
      4: 183,
      5: 245
    };
    
    // Se for 6, rolar novamente (não fazer nada, o modal já fechou)
    if (resultado === 6) {
      // Reabrir o modal para rolar novamente
      setTimeout(() => setShowDiceModal(true), 500);
      return;
    }
    
    // Navegar para a tela correspondente
    const telaDestino = destinoMap[resultado];
    if (telaDestino) {
      setTimeout(() => onGoToScreen(telaDestino), 1000);
    }
  };

  return (
    <Container data-screen="screen-28">
      {/* Modal de Dados */}
      <DiceRollModal3D
        open={showDiceModal}
        onComplete={handleDiceRoll}
        numDice={1}
      />

      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de Música */}
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
            Sabendo que não tem condições de enfrentar os cinco Cavaleiros das Trevas ao mesmo tempo, você dá meia-volta e corre para o norte. Felizmente, adiante o caminho se estreita, forçando os Cavaleiros a avançarem em fila. Apenas um deles consegue se aproximar o bastante para tentar capturá-lo.
            <br/><br/>
            Você terá que enfrentá-lo e derrotá-lo antes que os demais alcancem você.
            <br/><br/>
            Role 1 dado para descobrir qual dos cinco Cavaleiros você enfrentará.
          </NarrativeText>

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <ChoiceButton onClick={handleRolarDado}>
              Rolar Dado
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen28;

