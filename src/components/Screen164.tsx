import React, { useState, useCallback, useMemo } from 'react';
import { Box, CardContent, IconButton, Tooltip } from '@mui/material';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useScreenTheme } from '../hooks/useScreenTheme';
import { createThemedComponents } from './common/ScreenThemedComponents';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';
import temploGeomagosImg from '../assets/images/locais/templo-geomagos.png';

interface Screen164Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen164: React.FC<Screen164Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(164);
  const playClick = useClickSound(0.2);
  const theme = useScreenTheme(164);
  const { Container, CardWrap, NarrativeText, ChoiceButton, LocationLink, HoverImage } = useMemo(
    () => createThemedComponents(theme),
    [theme]
  );
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleLocationHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: temploGeomagosImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleLocationLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleLocationMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleLocationClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  return (
    <Container data-screen="screen-164">
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

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Em vez de subir pelo muro, você prefere entrar pelo portão de ferro forjado em forma de folhas. Lá dentro, a grama é exuberante e as árvores estão carregadas de frutos, ainda por conta da colheita recente. Os guardas param, incapazes de continuar a perseguição.
            <br/><br/>
            Diante de você há um edifício simples — o{' '}
            <LocationLink
              onMouseEnter={handleLocationHover}
              onMouseLeave={handleLocationLeave}
              onMouseMove={handleLocationMove}
              onClick={handleLocationClick}
            >
              Templo dos Geomagos
            </LocationLink>
            {' '}— sacerdotes que veneram Titã e respeitam a natureza em todas as suas formas; constituem uma força misteriosa e poderosa em Royal Lendle, muito temida por não seguirem cegamente as leis da terra.
            <br/><br/>
            Sua intenção é alcançar a rua que fica para além do templo, mas o caminho está bloqueado por uma cerca viva alta, que divide a propriedade ao meio. A única passagem é através de outro portão, cujas maçanetas são duas placas: uma representando o Sol, a outra a Lua.
            <br/><br/>
            Acima do portão lê-se uma adivinha:
            <br/><br/>
            <em>"Reflete e refletido; um escurece e o outro ao passar."</em>
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(254); }}>
              Abrir a Maçaneta do Sol
            </ChoiceButton>
            <ChoiceButton onClick={() => { playClick(); onGoToScreen(264); }}>
              Abrir a Maçaneta da Lua
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="Templo dos Geomagos" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={temploGeomagosImg}
        imageAlt="Templo dos Geomagos"
      />
    </Container>
  );
};

export default Screen164;
