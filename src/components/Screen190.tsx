import React, { useState, useEffect, useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
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

interface Screen190Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen190: React.FC<Screen190Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(190);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(190);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [showDamageAlert, setShowDamageAlert] = useState(false);
  const [damageApplied, setDamageApplied] = useState(false);

  // Aplicar dano de 4 pontos de FORÇA quando a tela carregar
  useEffect(() => {
    if (!damageApplied) {
      const novaForca = ficha.forca.atual - 4;
      const fichaAtualizada: Ficha = {
        ...ficha,
        forca: {
          ...ficha.forca,
          atual: Math.max(0, novaForca)
        }
      };
      
      onUpdateFicha(fichaAtualizada);
      setDamageApplied(true);
      
      // Mostrar alert de dano
      setShowDamageAlert(true);
      setTimeout(() => setShowDamageAlert(false), NOTIFICATION_CONFIG.autoHideDuration);

      if (novaForca <= 0) {
        onGoToScreen(999);
      }
    }
  }, [damageApplied, ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-190">
      {/* Alert de dano */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showDamageAlert}>
        ⚔️ Você perdeu 4 pontos de FORÇA!
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
            Apesar de você empregar toda a sua força para se defender, não há como resistir contra criaturas tão malignas. Eles o derrubam, deixando você caído na terra fria.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(306);
            }}>
              Fingir-se de morto
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(346);
            }}>
              Se levantar e tentar lutar novamente
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(28);
            }}>
              Se levantar e fugir
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen190;

