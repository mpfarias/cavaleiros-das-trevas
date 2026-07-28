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
import { atualizarQuantidade } from '../utils/inventory';

interface Screen344Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen344: React.FC<Screen344Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(344);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(344);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme],
  );

  const [showGoldAlert, setShowGoldAlert] = useState(false);
  const paymentAppliedRef = useRef(false);

  useEffect(() => {
    if (paymentAppliedRef.current) return;
    paymentAppliedRef.current = true;

    const moedasItem = ficha.bolsa.find((item) => item.tipo === 'ouro');
    if (!moedasItem || (moedasItem.quantidade || 0) < 1) return;

    const fichaAtualizada = atualizarQuantidade(
      ficha,
      moedasItem.id,
      (moedasItem.quantidade || 0) - 1,
    );
    onUpdateFicha(fichaAtualizada);
    setShowGoldAlert(true);
    setTimeout(() => setShowGoldAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
  }, [ficha, onUpdateFicha]);

  return (
    <Container data-screen="screen-344">
      <GameAlert sx={{ top: '120px' }} visible={showGoldAlert} onClose={() => setShowGoldAlert(false)}>
        💰 Você pagou 1 Moeda de Ouro!
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
            Você lança um olhar desconfiado para a cabana do velho, mas acaba seguindo-o até um cômodo nos fundos... sem nenhuma saída.
            <br /><br />
            — Espere aqui até eu avisar que o caminho está livre — recomenda ele.
            <br /><br />
            Você faz exatamente isso.
            <br /><br />
            Alguns minutos depois, a porta se escancara e sete guardas invadem o cômodo.
            <br /><br />
            Atrás deles, o velho vigarista sorri satisfeito enquanto brinca com uma segunda Moeda de Ouro.
            <br /><br />
            O dinheiro realmente compra qualquer coisa...
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(199); }}>
              Você foi preso!
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen344;
