import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import slygoreImg from '../assets/images/personagens/slygore.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #0d3d0d 25%, #1a3d1a 50%, #0d1a0d 75%, #000000 100%),
    radial-gradient(circle at 30% 30%, rgba(0,100,0,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(50,50,50,0.3) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.4)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)'
});

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

const HoverImage = styled('img')({
  position: 'fixed',
  maxWidth: '400px',
  maxHeight: '400px',
  borderRadius: '8px',
  border: '3px solid #8B4513',
  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
  zIndex: 9999,
  pointerEvents: 'none',
  animation: `${fadeIn} 0.2s ease-out`
});

const MonsterName = styled('strong')({
  fontWeight: 'bold',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: '#8B0000',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#FF0000'
  }
});

interface Screen375Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen375: React.FC<Screen375Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(375);
  const playClick = useClickSound(0.2);
  const [hoverImage, setHoverImage] = useState<{ x: number; y: number } | null>(null);

  const hasFoguete = useMemo(() => {
    try {
      return Array.isArray(ficha?.bolsa) && ficha.bolsa.some((item: any) => item?.nome?.toLowerCase().includes('foguete'));
    } catch {
      return false;
    }
  }, [ficha]);

  const hasCandeia = useMemo(() => {
    try {
      return Array.isArray(ficha?.bolsa) && ficha.bolsa.some((item: any) => item?.id === 'candeia-azeite' || item?.nome?.toLowerCase().includes('candeia'));
    } catch {
      return false;
    }
  }, [ficha]);

  const handleSlygoreHover = (event: React.MouseEvent) => {
    setHoverImage({
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  };

  const handleSlygoreMove = (event: React.MouseEvent) => {
    if (hoverImage) {
      setHoverImage({
        x: event.clientX + 20,
        y: event.clientY - 20
      });
    }
  };

  const handleSlygoreLeave = () => {
    setHoverImage(null);
  };

  return (
    <Container data-screen="screen-375">
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
            Você levanta a tampa de ferro e desce para os esgotos.
            <br/><br/>
            Embora ninguém o siga, você corre por túneis imundos, tomados por um fedor insuportável.
            <br/><br/>
            Mas o pior ainda está por vir.
            <br/><br/>
            Das profundezas, ouve-se um gemido grotesco, e logo suas piores suspeitas se confirmam —
            <br/><br/>
            um temível{' '}
            <MonsterName
              onMouseEnter={handleSlygoreHover}
              onMouseMove={handleSlygoreMove}
              onMouseLeave={handleSlygoreLeave}
            >
              Slygore
            </MonsterName>{' '}
            ergue-se das águas diante de você.
            <br/><br/>
            Dizem que essas criaturas são fruto das loucuras de alquimistas e feiticeiros, que despejam nos esgotos os restos de suas experiências místicas.
            <br/><br/>
            Esses detritos, reagindo entre si, deram origem ao Slygore — um amontoado de imundície viva.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Ações padrão (Atacar primeiro) */}
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(70); }}>
              Atacar a criatura
            </ChoiceButton>

            {/* Ações especiais condicionais */}
            {hasFoguete && (
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(317); }}>
                Usar o foguete
              </ChoiceButton>
            )}

            {hasCandeia && (
              <ChoiceButton onClick={() => { playClick(); onGoToScreen(170); }}>
                Usar a candeia com azeite
              </ChoiceButton>
            )}

            {/* Ação padrão de fuga */}
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(356); }}>
              Fugir
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Imagem de hover do Slygore */}
      {hoverImage && (
        <HoverImage
          src={slygoreImg}
          alt="Slygore"
          style={{
            left: `${hoverImage.x}px`,
            top: `${hoverImage.y}px`
          }}
        />
      )}
    </Container>
  );
};

export default Screen375;

