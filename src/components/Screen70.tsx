import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { playDamageScream } from '../hooks/useDamageScreamSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import slygoreImg from '../assets/images/personagens/slygore.png';

interface Screen70Props {
  onGoToScreen: (screenId: number) => void;
  ficha: any;
  onUpdateFicha: (ficha: any) => void;
}

const Screen70: React.FC<Screen70Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(70);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(70);
  const { Container, CardWrap, NarrativeText, ChoiceButton } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
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
      playDamageScream();
      setShowForceAlert(true);
      setTimeout(() => setShowForceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
    }

    // Remover arma em mãos (primeira de tipo 'arma')
    if (updated.bolsa && Array.isArray(updated.bolsa)) {
      const idx = updated.bolsa.findIndex((item: any) => item?.tipo === 'arma');
      if (idx !== -1) {
        const removed = updated.bolsa[idx];
        updated.bolsa.splice(idx, 1);
        setWeaponLost(removed?.nome || 'sua arma');
        setShowWeaponAlert(true);
        setTimeout(() => setShowWeaponAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
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
                  border: theme.hoverImage.border,
                  boxShadow: theme.hoverImage.boxShadow
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


