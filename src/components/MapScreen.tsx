import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Import da imagem do mapa
import mapaImage from '../assets/images/mapa.jpg';
// Import do áudio do mapa
import mapMusic from '../assets/sounds/nature-sound-map.mp3';

// Animações
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5),
                0 0 10px rgba(255, 215, 0, 0.3),
                0 0 15px rgba(255, 215, 0, 0.2);
  }
  50% { 
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.8),
                0 0 20px rgba(255, 215, 0, 0.6),
                0 0 30px rgba(255, 215, 0, 0.4);
  }
`;

const mapReveal = keyframes`
  0% { 
    filter: sepia(0.8) contrast(0.8) brightness(0.7);
    transform: scale(0.95);
  }
  100% { 
    filter: sepia(0.3) contrast(1.1) brightness(1.05);
    transform: scale(1);
  }
`;

const MapContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: `
    linear-gradient(45deg, #5d2914 0%, #8B4513 20%, #D2B48C 40%, #F5DEB3 60%, #DEB887 80%, #CD853F 100%),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><defs><pattern id="parchment" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill="rgba(139,69,19,0.1)"/></pattern></defs><rect width="60" height="60" fill="url(%23parchment)"/></svg>')
  `,
  backgroundSize: '100% 100%, 65px 60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between', // Mudado para space-between
  padding: '20px', // Adicionado padding
  overflow: 'hidden',
  animation: `${fadeIn} 1s ease-out`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 30%, rgba(139,69,19,0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(160,82,45,0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 20%, rgba(205,133,63,0.15) 0%, transparent 40%),
      linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
    `,
    pointerEvents: 'none'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)',
    pointerEvents: 'none'
  }
});

const MapImageContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  maxWidth: '800px', // Tamanho máximo definido
  height: 'auto',
  flex: '1', // Cresce para ocupar espaço disponível
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '8px solid #8B4513',
  borderRadius: '12px',
  boxShadow: `
    inset 0 0 20px rgba(0,0,0,0.4),
    0 8px 32px rgba(0,0,0,0.5),
    0 0 0 2px #D2B48C,
    0 0 0 4px #8B4513,
    0 0 40px rgba(139,69,19,0.3)
  `,
  background: `
    linear-gradient(135deg, #F5E6D3 0%, #EDD5BE 50%, #E8CFA9 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.1) 0%, transparent 50%)
  `,
  overflow: 'hidden',
  animation: `${fadeIn} 1.2s ease-out 0.3s both`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    right: '-5px',
    bottom: '-5px',
    background: 'linear-gradient(45deg, rgba(139,69,19,0.2), rgba(222,184,135,0.2), rgba(139,69,19,0.2))',
    borderRadius: '16px',
    zIndex: -1,
    animation: `${pulseGlow} 3s ease-in-out infinite`
  }
});

const MapImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '80vh', // Altura máxima para deixar espaço para título e legenda
  objectFit: 'contain',
  animation: `${mapReveal} 2s ease-out 0.8s both`,
  transition: 'filter 0.3s ease'
});

// Botões estilizados
const AudioPlayButton = styled('button')({
  padding: '12px 16px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.95) 0%, rgba(160,82,45,0.9) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.95) 0%, rgba(139,0,0,0.9) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'scale(1.05)'
  },
  '&:active': {
    transform: 'scale(0.98)'
  }
});

const LocationButton = styled('button')<{ accessible: boolean }>(({ accessible }) => ({
  position: 'absolute',
  color: '#Faa123',
  border: 'none',
  fontSize: accessible ? '16px' : '12px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  cursor: accessible ? 'pointer' : 'not-allowed',
  outline: 'none',
  background: 'none',
  transform: 'translate(-50%, -50%) rotate(-25deg)',
  transition: 'transform 0.2s ease',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': accessible ? {
    transform: 'translate(-50%, -50%) scale(1) rotate(-25deg)'
  } : {},
  '&:active': accessible ? {
    transform: 'translate(-50%, -50%) scale(0.98) rotate(-25deg)'
  } : {}
}));

const MapTitle = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: 'clamp(24px, 4vw, 48px)',
  fontWeight: '900',
  color: '#4a2c00',
  textShadow: `
    2px 2px 4px rgba(0,0,0,0.5), 
    0 0 8px rgba(245,222,179,0.8),
    0 0 16px rgba(139,69,19,0.4)
  `,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  textAlign: 'center',
  marginBottom: '20px',
  position: 'relative',
  zIndex: 10,
  animation: `${fadeIn} 1.5s ease-out 0.5s both`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120%',
    height: '120%',
    background: 'radial-gradient(ellipse, rgba(245,222,179,0.1) 0%, transparent 70%)',
    zIndex: -1
  }
});

const MapDescription = styled(Typography)({
  maxWidth: '80%',
  textAlign: 'center',
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(14px, 2vw, 18px)',
  color: '#5a3a2b',
  textShadow: '1px 1px 2px rgba(245,222,179,0.9), 0 0 4px rgba(139,69,19,0.3)',
  lineHeight: 1.6,
  fontStyle: 'italic',
  padding: '12px 24px',
  background: 'rgba(245,222,179,1)',
  borderRadius: '8px',
  border: '1px solid rgba(139,69,19,0.2)',
  backdropFilter: 'blur(2px)',
  transition: 'all 0.3s ease',
  marginTop: '20px',
  position: 'relative',
  zIndex: 10,
  animation: `${fadeIn} 1.8s ease-out 1s both`,
  minHeight: '60px', // Altura mínima para evitar pulos no layout
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

interface MapScreenProps {
  onLocationSelect: (location: string) => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ onLocationSelect }) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  
  // Sistema de áudio independente para o mapa
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Posições dos locais no mapa (em porcentagem)
  const locations = [
    { 
      name: 'Karnstein', 
      x:53, 
      y: 71,
      description: 'KARNSTEIN: Uma cidade sombria onde camponeses relatam avistamentos de criaturas estranhas. Lendas antigas sussurram sobre uma maldição que assombra os moradores.',
      discovered: false
    },
    { 
      name: 'Floresta Sombria', 
      x: 25, 
      y: 60,
      description: 'Árvores retorcidas escondem segredos antigos. Poucos retornam deste lugar maldito.',
      discovered: false // Será desbloqueado após completar Karnstein
    },
    { 
      name: 'Cabana', 
      x: 63, 
      y: 27,
      description: 'Ruínas de um castelo onde ecos do passado ainda ressoam pelos corredores vazios.',
      discovered: false
    },
        { 
      name: 'Royal', 
      x: 40, 
      y: 28,
      description: 'ROYAL LENDLE: Capital de Gallantaria. A cidade que te acolheu. Sua jornada começa aqui.',
      discovered: true
    },
  ];

  // Funções de controle de áudio
  const initMapAudio = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(mapMusic);
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0; // Volume 100%
      
      // Event listeners
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('🗺️ Áudio do mapa carregado');
      });
      
      audioRef.current.addEventListener('play', () => {
        console.log('🗺️ Música do mapa iniciada');
        setAudioBlocked(false);
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log('🗺️ Música do mapa pausada');
      });
    }
  };

  const playMapAudio = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
        setAudioBlocked(false);
      }
    } catch (error) {
      console.log('🗺️ Autoplay bloqueado - usuário precisa interagir');
      setAudioBlocked(true);
    }
  };

  const pauseMapAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Inicializar música do mapa
  useEffect(() => {
    console.log('🗺️ Iniciando sistema de áudio do mapa...');
    initMapAudio().then(() => {
      playMapAudio();
    });

    // Cleanup quando sair do mapa
    return () => {
      console.log('🗺️ Limpando áudio do mapa...');
      pauseMapAudio();
    };
  }, []);

  // Animação inicial de revelação do mapa
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Efeito sonoro ao passar o mouse (simulado com console)
  const playHoverSound = () => {
    console.log('🔊 Som de hover no local');
  };

  const playClickSound = () => {
    console.log('🔊 Som de seleção de local');
  };

  return (
    <MapContainer>
      {/* Botão de música caso autoplay seja bloqueado */}
      {audioBlocked && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            animation: `${fadeIn} 1s ease-out 2s both`
          }}
        >
          <AudioPlayButton onClick={playMapAudio}>🎵 Tocar Música</AudioPlayButton>
        </Box>
      )}

      <MapTitle>
        Gallantaria
      </MapTitle>

      <MapImageContainer>
        <MapImage 
          src={mapaImage} 
          alt="Mapa de Gallantaria"
        />
        
        {locations.map((location) => {
          const isAccessible = location.discovered;
          
          
          return (
            <LocationButton
              key={location.name}
              disabled={!isAccessible}
              accessible={isAccessible}
              onClick={() => {
                if (!isAccessible) return;
                playClickSound();
                onLocationSelect(location.name);
              }}
              onMouseEnter={() => {
                if (!isAccessible) return;
                playHoverSound();
                setHoveredLocation(location.name);
              }}
              onMouseLeave={() => setHoveredLocation(null)}
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`
              }}
            >
              {location.name}
              {!isAccessible && (
                <span style={{ 
                  display: 'block', 
                  fontSize: '10px', 
                  opacity: 0, 
                  marginTop: '2px' 
                }}>
                  ???
                </span>
              )}
            </LocationButton>
          );
        })}
      </MapImageContainer>

      <MapDescription>
        {hoveredLocation 
          ? locations.find(loc => loc.name === hoveredLocation)?.description
          : isRevealed 
            ? "Escolha seu destino. As sombras aguardam aqueles corajosos o suficiente para desafiá-las... Alguns locais permanecerão ocultos até que você prove seu valor."
            : "O mapa está sendo revelado..."
        }
      </MapDescription>
    </MapContainer>
  );
};

export default MapScreen;
