import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { GameAlert } from './ui/GameAlert';
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
    linear-gradient(135deg, #0c1b13 0%, #143222 25%, #0f261b 50%, #0c1b13 75%, #07120c 100%),
    radial-gradient(circle at 30% 30%, rgba(20,80,50,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(15,60,40,0.15) 0%, transparent 50%)
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

interface Screen70Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen70: React.FC<Screen70Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(70);
  const playClick = useClickSound(0.2);
  const appliedRef = useRef(false);
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [showWeaponAlert, setShowWeaponAlert] = useState(false);
  const [weaponLost, setWeaponLost] = useState('');

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

  // Usa automaticamente o grupo 'sewers' mapeado em useAudioGroup(70)

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (!ficha) return;

    const updated = { ...ficha };

    // -2 FORÇA
    if (updated.forca && typeof updated.forca.atual === 'number') {
      updated.forca.atual = Math.max(0, updated.forca.atual - 2);
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), 4000);
    }

    // Remover arma em mãos (primeira de tipo 'arma')
    if (updated.bolsa && Array.isArray(updated.bolsa)) {
      const idx = updated.bolsa.findIndex((item: any) => item?.tipo === 'arma');
      if (idx !== -1) {
        const removed = updated.bolsa[idx];
        updated.bolsa.splice(idx, 1);
        setWeaponLost(removed?.nome || 'sua arma');
        setShowWeaponAlert(true);
        setTimeout(() => setShowWeaponAlert(false), 5000);
      }
    }

    onUpdateFicha(updated);
  }, [ficha, onUpdateFicha]);

  return (
    <>
      <VolumeControl />

      {currentGroup && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
            <span>
              <IconButton
                onClick={() => { playClick(); togglePlay?.(); }}
                sx={{
                  color: isPlaying ? '#B31212' : '#E0DFDB',
                  background: 'rgba(15,17,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(179,18,18,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      <Container data-screen="screen-70">
        <CardWrap>
          <CardContent sx={{ padding: '40px' }}>
            <NarrativeText>
              Na escuridão dos esgotos, você mal consegue distinguir a forma do Slygore, uma criatura sombria e malévola.
              <br/><br/>
              Quando atinge sua “pele”, ela sibila e libera vapores ácidos que corroem sua arma.
              <br/><br/>
              Pior ainda — um líquido viscoso e escuro sobe por sua mão e a queima, fazendo você gritar de dor.
              <br/><br/>
              O Slygore então solta um uivo tenebroso e começa a se erguer novamente, preparando-se para atacar.
            </NarrativeText>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <img 
                src={slygoreImg}
                alt="Slygore"
                style={{
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '2px solid #8B4513'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
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

              <ChoiceButton onClick={() => { playClick(); onGoToScreen(356); }}>
                Fugir
              </ChoiceButton>
            </Box>
          </CardContent>
        </CardWrap>
      </Container>

      {/* Alerts padrão */}
      {showForceAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
          Você perdeu 2 pontos de FORÇA!
        </GameAlert>
      )}

      {showWeaponAlert && (
        <GameAlert sx={{ top: '180px' }} $isVisible={showWeaponAlert}>
          Sua arma foi corroída! Você perdeu {weaponLost}.
        </GameAlert>
      )}
    </>
  );
};

export default Screen70;


