import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen102Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onAdjustSorte: (delta: number) => void;
}

const Screen102: React.FC<Screen102Props> = ({ onGoToScreen, ficha, onUpdateFicha: _onUpdateFicha, onAdjustSorte }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(102);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(102);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showSorteAlert, setShowSorteAlert] = useState(false);
  const sorteAppliedRef = useRef(false);

  // Aplicar 2 pontos de SORTE quando a tela carregar (uma única vez)
  useEffect(() => {
    if (!sorteAppliedRef.current) {
      sorteAppliedRef.current = true;
      
      // Ganhar 2 pontos de SORTE (onAdjustSorte já garante que não ultrapassa o máximo)
      onAdjustSorte(2);
      
      // Mostrar alert de sorte ganha
      setTimeout(() => {
        setShowSorteAlert(true);
        setTimeout(() => setShowSorteAlert(false), 4000);
      }, 500);
    }
  }, [onAdjustSorte]);

  return (
    <Container data-screen="screen-102">
      {/* Alerta de SORTE ganha */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showSorteAlert}>
        ✨ Você ganhou 2 pontos de SORTE!
      </GameAlert>

      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
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
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            A quantia das 200 Moedas de Ouro que lhe prometeram já não tem importância. Mendokan e seu povo estavam sob sua proteção — e você falhou. A força dos Cavaleiros das Trevas é aterrorizante e diferente de tudo o que já enfrentou; se conseguir derrotá-los, vingará todos os inocentes que eles massacraram.
            <br/><br/>
            O dia amanhece quando você alcança a saída sul do estreito de Magyaar, lugar que para sempre lembrará como o cenário da sua pior derrota.
            <br/><br/>
            Você para para descansar e refletir sobre o próximo passo. A estrada para Karnstein segue diretamente para o sul. Até chegar lá, muitos aldeões morrerão e sofrerão todas as noites.
            <br/><br/>
            A leste vive um eremita sábio; talvez ele possa te ensinar algo sobre os aparentemente indestrutíveis Cavaleiros das Trevas.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(113);
            }}>
              Você escolhe ir com ele
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(11);
            }}>
              Prefere seguir para o sul, rumo a Karnstein
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen102;
