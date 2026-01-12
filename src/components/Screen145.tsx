import React, { useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Screen145Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen145: React.FC<Screen145Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(145);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(145);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );

  return (
    <Container data-screen="screen-145">
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
            Mendokan e seus dois companheiros aguardam por você no ponto combinado.
            <br/><br/>
            Um deles é bastante idoso e tem dificuldade para se locomover, o que obriga o grupo a viajar apenas durante a noite para compensar o ritmo mais lento.
            <br/><br/>
            Quando finalmente alcançam o estreito de Magyaar, todos estão exaustos.
            <br/><br/>
            Essa é a parte mais estreita da Estrada do Comércio, um trilho de pedras que se estende à esquerda, junto a um enorme rochedo.
            <br/><br/>
            À direita, há uma ravina de seis metros de largura e cerca de trinta metros de profundidade.
            <br/><br/>
            Do outro lado, é possível avistar um caminho, usado por aqueles que viajam em direção a Lendle.
            <br/><br/>
            De repente, um grito terrível ecoa pelo ar, seguido por outro, e mais outro ainda. Os aldeões se encolhem de medo, enquanto você se prepara para a luta.
            <br/><br/>
            É então que você os vê vindo direto em sua direção: cinco cavaleiros montados em criaturas assustadoras, cujos cascos fazem o chão tremer a cada passo. Apesar das máscaras metálicas que usam, você consegue ver como têm a pele velha e ressecada, e olhos que parecem buracos negros sem fundo.
            <br/><br/>
            Mendokan empalidece:
            <br/><br/>
            — É o nosso fim! Os Cavaleiros das Trevas vieram nos pegar!
            <br/><br/>
            Os outros aldeões correm, mas é inútil. Logo se percebe que as espadas dos Cavaleiros são bem reais.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(190);
            }}>
              Enfrentá-los
            </ChoiceButton>

            <ChoiceButton onClick={() => {
              playClick();
              onGoToScreen(28);
            }}>
              Prefere fugir, ainda com pouca esperança de sobreviver
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen145;

