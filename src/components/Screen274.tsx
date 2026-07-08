import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import { NOTIFICATION_CONFIG } from '../constants/character';

interface Screen274Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen274: React.FC<Screen274Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(274);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(274);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  const [showGoldAlert, setShowGoldAlert] = useState(false);
  const [showProvisionsAlert, setShowProvisionsAlert] = useState(false);
  const rewardsAppliedRef = useRef(false);

  useEffect(() => {
    if (rewardsAppliedRef.current) return;
    rewardsAppliedRef.current = true;

    const fichaAtualizada = { ...ficha, bolsa: [...ficha.bolsa] };

    const moedasOuro = fichaAtualizada.bolsa.find((item) => item.tipo === 'ouro');
    if (moedasOuro) {
      moedasOuro.quantidade = (moedasOuro.quantidade || 0) + 2;
    } else {
      fichaAtualizada.bolsa.push({
        id: `ouro_bandido_${Date.now()}`,
        nome: 'Moedas de Ouro',
        tipo: 'ouro',
        quantidade: 2,
        descricao: 'Moedas encontradas no corpo do bandido',
        adquiridoEm: 'Revistar corpo do bandido',
      });
    }

    const provisoesExistentes = fichaAtualizada.bolsa.find((item) => item.tipo === 'provisao');
    if (provisoesExistentes) {
      provisoesExistentes.quantidade = (provisoesExistentes.quantidade || 0) + 1;
    } else {
      fichaAtualizada.bolsa.push({
        id: `provisao_${Date.now()}`,
        tipo: 'provisao',
        quantidade: 1,
        nome: 'Provisões',
        adquiridoEm: 'Revistar corpo do bandido',
      });
    }

    onUpdateFicha(fichaAtualizada);

    setTimeout(() => {
      setShowGoldAlert(true);
      setTimeout(() => setShowGoldAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }, 500);

    setTimeout(() => {
      setShowProvisionsAlert(true);
      setTimeout(() => setShowProvisionsAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }, 1500);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-274">
      <GameAlert sx={{ top: '120px' }} visible={showGoldAlert} onClose={() => setShowGoldAlert(false)}>
        💰 +2 Moedas de Ouro adicionadas!
      </GameAlert>

      <GameAlert sx={{ top: '180px' }} visible={showProvisionsAlert} onClose={() => setShowProvisionsAlert(false)}>
        🍞 +1 Provisão adicionada à bolsa!
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

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Depois da luta, você revira o corpo do bandido e encontra 2 Moedas de Ouro e Provisões suficientes para 1 refeição.
            <br /><br />
            Agora você pode:
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(58); }}>
              Beber da água do Poço do Feiticeiro
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(349); }}>
              Seguir para o norte em busca do eremita &quot;morto&quot;
            </ChoiceButton>

            <ChoiceButton onClick={() => { playClick(); onGoToScreen(44); }}>
              Retornar para o sul
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen274;
