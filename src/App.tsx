import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Home from './components/Home';
import CharacterSheet from './components/CharacterSheet';
import type { Ficha } from './types';
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '999px',
          fontFamily: '"Spectral", serif',
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
  const [currentView, setCurrentView] = useState<'home' | 'sheet'>('home');
  const [ficha, setFicha] = useState<Ficha>({
    pericia: { inicial: 0, atual: 0 },
    forca: { inicial: 0, atual: 0 },
    sorte: { inicial: 0, atual: 0 },
    armaduras: '',
    provisoes: 0,
    armas: '',
    ouro: 0,
    equip: '',
    notas: '',
    encontros: Array.from({ length: 12 }, () => ({ pericia: '', forca: '' })),
  });

  useEffect(() => {
    // Carregar ficha salva automaticamente
    const savedData = localStorage.getItem('cavaleiro:ficha');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFicha(parsedData);
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
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(newFicha));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0B0B0D',
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
            zIndex: -2,
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
              background: 'url("/images/img01.svg") center center no-repeat black',
              backgroundSize: 'contain',
              animation: 'pulse 10s ease-in-out infinite alternate',
              willChange: 'opacity',
            },
            '@keyframes pulse': {
              '0%': { opacity: 0.1 },
              '100%': { opacity: 0.9 },
            },
          }}
          aria-hidden="true"
        />

        {currentView === 'home' ? (
          <Home onStart={handleStartAdventure} />
        ) : (
          <CharacterSheet ficha={ficha} onFichaChange={handleFichaChange} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;