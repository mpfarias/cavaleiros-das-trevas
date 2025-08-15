import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Home from './components/Home';
import CharacterSheet from './components/CharacterSheet';
import IntroCinematic from './components/IntroCinematic';
import MapScreen from './components/MapScreen';
import RoyalLendleScreen from './components/RoyalLendleScreen';
import BartolphGameScreen from './components/BartolphGameScreen';
import PreparationScreen from './components/PreparationScreen';
import type { Ficha } from './types';
import { FichaSchema, createEmptyFicha } from './types';
import { AudioProvider } from './contexts/AudioContext';
import './index.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B31212',
    },
    secondary: {
      main: '#B67B03',
    },
    background: {
      default: '#0B0B0D',
      paper: '#0f1114',
    },
    text: {
      primary: '#E0DFDB',
      secondary: '#a3a3a3',
    },
  },
  typography: {
    fontFamily: '"Spectral", serif',
    allVariants: {
      fontFamily: '"Spectral", serif',
    },
    button: {
      fontFamily: '"Cinzel", "Spectral", serif',
    },
    h1: {
      fontFamily: '"Cinzel", "Spectral", serif',
      fontWeight: 900,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Cinzel", "Spectral", serif',
      fontWeight: 700,
      letterSpacing: '0.04em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Spectral", serif',
        },
        'input, textarea, button, select': {
          fontFamily: 'inherit',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontFamily: '"Spectral", serif',
        },
        root: {
          fontFamily: '"Spectral", serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Spectral", serif',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Spectral", serif',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Spectral", serif',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Spectral", serif',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Spectral", serif',
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '999px',
          fontFamily: '"Cinzel", "Spectral", serif',
          letterSpacing: '0.04em',
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        },
      },
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'sheet' | 'cinematic' | 'map' | 'royallendle' | 'bartolph' | 'preparation'>('home');
  const [ficha, setFicha] = useState<Ficha>(createEmptyFicha());
  const [currentLocation, setCurrentLocation] = useState<string>('');

  useEffect(() => {
    const savedData = localStorage.getItem('cavaleiro:ficha');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const validated = FichaSchema.safeParse(parsed);
        if (validated.success) {
          setFicha({ ...createEmptyFicha(), ...validated.data });
        } else {
          console.warn('Ficha salva inválida. Usando defaults.');
        }
      } catch (error) {
        console.error('Erro ao carregar ficha:', error);
      }
    }
  }, []);

  const handleStartAdventure = () => {
    setCurrentView('sheet');
  };

  const handleFichaChange = (newFicha: Ficha) => {
    setFicha(newFicha);
    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(newFicha));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  };

  const handleLocationSelect = (location: string) => {
    console.log(`🗺️ Navegando para: ${location}`);
    setCurrentLocation(location);
    
    // Roteamento baseado na localização
    switch (location) {
      case 'Royal':
        setCurrentView('royallendle');
        break;
      case 'Karnstein':
        // TODO: Implementar tela de Karnstein
        console.log('🏰 Karnstein ainda não implementado');
        break;
      default:
        console.log(`📍 Localização ${location} ainda não implementada`);
    }
  };

  const handleGameChoice = (choice: string) => {
    console.log(`🎲 Escolha feita: ${choice} em ${currentLocation}`);
    
    // Lógica específica baseada na escolha
    switch (choice) {
      case 'aceitar_jogo':
        console.log('🎲 Jogador aceitou o jogo de Bartolph');
        setCurrentView('bartolph');
        break;
      case 'recusar_jogo':
        console.log('🚶 Jogador recusou o jogo e vai se preparar');
        setCurrentView('preparation');
        break;
      default:
        console.log(`❓ Escolha não reconhecida: ${choice}`);
    }
  };

  const handleGameResult = (won: boolean, goldChange: number) => {
    console.log(`🎲 Resultado do jogo: ${won ? 'Vitória' : 'Derrota'}, Mudança de ouro: ${goldChange}`);
    
    // Atualizar ouro na ficha
    const updatedFicha = { ...ficha };
    const goldItemIndex = updatedFicha.bolsa.findIndex(item => item.tipo === 'ouro');
    
    if (goldItemIndex !== -1) {
      const currentGold = updatedFicha.bolsa[goldItemIndex].quantidade || 0;
      updatedFicha.bolsa[goldItemIndex].quantidade = Math.max(0, currentGold + goldChange);
    }
    
    setFicha(updatedFicha);
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(updatedFicha));
    
    // Voltar para o mapa após o jogo
    setCurrentView('map');
  };

  const handlePurchase = (item: any) => {
    console.log(`🛒 Comprando: ${item.nome} por ${item.preco} moedas`);
    
    // Atualizar ficha com nova compra
    const updatedFicha = { ...ficha };
    
    // Reduzir ouro
    const goldItemIndex = updatedFicha.bolsa.findIndex(item => item.tipo === 'ouro');
    if (goldItemIndex !== -1) {
      const currentGold = updatedFicha.bolsa[goldItemIndex].quantidade || 0;
      updatedFicha.bolsa[goldItemIndex].quantidade = currentGold - item.preco;
    }
    
    // Adicionar item comprado
    const newItem = {
      id: `${item.id}_${Date.now()}`,
      nome: item.nome,
      tipo: item.tipo,
      quantidade: 1,
      descricao: item.descricao,
      adquiridoEm: 'Royal Lendle - Mercador'
    };
    
    updatedFicha.bolsa.push(newItem);
    
    setFicha(updatedFicha);
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(updatedFicha));
  };

  const handleFinishPreparation = () => {
    console.log('✅ Preparação concluída - Partindo para Karnstein');
    // Voltar para o mapa após preparação
    setCurrentView('map');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AudioProvider>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'transparent',
            color: '#E0DFDB',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
        {/* Backdrop */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(1200px 600px at 70% 10%, rgba(179,18,18,0.18), transparent 60%),
                radial-gradient(800px 400px at 20% 80%, rgba(182,123,3,0.12), transparent 60%),
                linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 70%)
              `,
              filter: 'blur(12px) saturate(0.9) contrast(1.1) brightness(0.65)',
              transform: 'scale(1.05)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'black',
              backgroundImage: `image-set(
                url('/images/img01.avif') type('image/avif') 1x,
                url('/images/img01.webp') type('image/webp') 1x,
                url('/images/img01.png') type('image/png') 1x
              )`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              animation: 'fadePulse 5s ease-in-out infinite alternate',
              willChange: 'opacity',
            },
            '@keyframes fadePulse': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&::after': {
                animation: 'none',
              },
            },
          }}
          aria-hidden="true"
        />

        {currentView === 'home' ? (
          <Home onStart={handleStartAdventure} />
        ) : currentView === 'sheet' ? (
          <CharacterSheet 
            ficha={ficha} 
            onFichaChange={handleFichaChange} 
            onVoltar={() => setCurrentView('home')}
            onStartCinematic={() => setCurrentView('cinematic')}
          />
        ) : currentView === 'cinematic' ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              '&::after': {
                display: 'none !important'
              }
            }}
          >
            <IntroCinematic 
              onFinish={() => setCurrentView('map')} 
            />
          </Box>
                ) : currentView === 'map' ? (
          <MapScreen
            onLocationSelect={handleLocationSelect}
          />
        ) : currentView === 'royallendle' ? (
          <RoyalLendleScreen
            onChoice={handleGameChoice}
            onBackToMap={() => setCurrentView('map')}
            ficha={ficha}
          />
        ) : currentView === 'bartolph' ? (
          <BartolphGameScreen
            ficha={ficha}
            onGameResult={handleGameResult}
            onBackToRoyal={() => setCurrentView('royallendle')}
          />
        ) : currentView === 'preparation' ? (
          <PreparationScreen
            ficha={ficha}
            onPurchase={handlePurchase}
            onFinishPreparation={handleFinishPreparation}
            onBackToRoyal={() => setCurrentView('royallendle')}
          />
        ) : (
          <Box>
            <h1>Tela do Jogo - {ficha.nome} em {currentLocation}</h1>
            <button onClick={() => setCurrentView('map')}>Voltar ao Mapa</button>
          </Box>
        )}
        </Box>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;