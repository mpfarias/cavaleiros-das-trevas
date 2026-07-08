import React, { useState, useEffect, useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { playDamageScream } from '../hooks/useDamageScreamSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen279Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen279: React.FC<Screen279Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(279);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(279);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [showDamageAlert, setShowDamageAlert] = useState(false);
  const [damageApplied, setDamageApplied] = useState(false);

  // Aplicar dano de 2 pontos de FORÇA quando a tela carregar
  useEffect(() => {
    if (!damageApplied) {
      const novaForca = Math.max(0, ficha.forca.atual - 2);
      const fichaAtualizada: Ficha = {
        ...ficha,
        forca: {
          ...ficha.forca,
          atual: novaForca
        }
      };
      
      onUpdateFicha(fichaAtualizada);
      setDamageApplied(true);
      playDamageScream();
      
      // Mostrar alert de dano
      setShowDamageAlert(true);
      setTimeout(() => setShowDamageAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }
  }, [damageApplied, ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-279">
      {/* Alert de dano */}
      <GameAlert sx={{ top: '120px' }} visible={showDamageAlert} onClose={() => setShowDamageAlert(false)}>
        ⚔️ Você perdeu 2 pontos de FORÇA!
      </GameAlert>

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
            Um dos Cavaleiros crava a espada em sua perna e fica observando friamente a sua reação.
            <br/><br/>
            Apesar da dor lancinante que consome seu corpo, você não demonstra fraqueza — nem um tremor, nem um gemido.
            <br/><br/>
            Aliviado por acreditar que o ferimento foi suficiente para abatê-lo, o Cavaleiro vira as costas e se afasta.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(102);
            }}>
              Seguir
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen279;

