import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Routes, Route, Navigate, useNavigate, useLocation, useInRouterContext, BrowserRouter } from 'react-router-dom';
import ScreenRouter from './GamePath/ScreenRouter';
import Home from './components/Home';
import CharacterSheet from './components/CharacterSheet';
import IntroCinematic from './components/IntroCinematic';
import MapScreen from './components/MapScreen';
import RoyalLendleScreen from './components/RoyalLendleScreen';

import type { Ficha } from './types';
import { FichaSchema } from './types';
import { AudioProvider } from './contexts/AudioContext';
import './index.css';
import InventoryModal from './components/InventoryModal';
import { styled } from '@mui/material/styles';
import { totalOuro } from './utils/inventory';

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

function AppContent() {
  console.log('🎲 [App] Função AppContent executada!');
  
  const navigate = useNavigate();
  const location = useLocation();
  // Função helper para criar ficha vazia sem moedas
  const createEmptyFichaWithoutGold = (): Ficha => ({
    nome: '',
    pericia: { inicial: 0, atual: 0 },
    forca: { inicial: 0, atual: 0 },
    sorte: { inicial: 0, atual: 0 },
    bolsa: [
      {
        id: 'espada_inicial',
        nome: 'Espada de Aço',
        tipo: 'arma',
        descricao: 'Espada básica de aço, arma padrão de todo cavaleiro',
        adquiridoEm: 'Criação do Personagem'
      }
    ]
  });

  const [ficha, setFicha] = useState<Ficha>(() => {
    // Estado inicial vazio - será preenchido pelo useEffect
    return createEmptyFichaWithoutGold();
  });

  // Wrapper para setFicha com logs de debug
  const setFichaWithLog = useCallback((newFicha: Ficha | ((prev: Ficha) => Ficha)) => {
    console.log('🎲 [App] setFicha sendo chamado com:', newFicha);
    if (typeof newFicha === 'function') {
      const prevFicha = ficha;
      const nextFicha = newFicha(prevFicha);
      console.log('🎲 [App] setFicha (função) - Anterior:', prevFicha);
      console.log('🎲 [App] setFicha (função) - Próximo:', nextFicha);
      setFicha(nextFicha);
    } else {
      console.log('🎲 [App] setFicha (valor) - Anterior:', ficha);
      console.log('🎲 [App] setFicha (valor) - Próximo:', newFicha);
      setFicha(newFicha);
    }
  }, [ficha]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [globalInventoryOpen, setGlobalInventoryOpen] = useState(false);
  const showGlobalStatus = !['/', '/sheet', '/intro'].includes(location.pathname);

  useEffect(() => {
    const timestamp = Date.now();
    console.log('🎲 [App] useEffect de inicialização executado - TIMESTAMP:', timestamp);
    console.log('🎲 [App] Ficha atual no estado antes do useEffect:', ficha);
    
    // Contador para rastrear execuções múltiplas
    const executionCount = (window as any).__useEffectCount = ((window as any).__useEffectCount || 0) + 1;
    console.log('🎲 [App] useEffect executado pela', executionCount, 'vez');
    
    const savedData = localStorage.getItem('cavaleiro:ficha');
    const savedScreenId = localStorage.getItem('cavaleiro:screenId');
    
    console.log('🎲 [App] Dados salvos encontrados:', { savedData: !!savedData, savedScreenId });
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('🎲 [App] Ficha parseada:', parsed);
        
        const validated = FichaSchema.safeParse(parsed);
        if (validated.success) {
          // Se a ficha for válida, usa ela diretamente sem mesclar com createEmptyFicha
          console.log('🎲 [App] Ficha validada com sucesso:', validated.data);
          console.log('🎲 [App] - Nome:', validated.data.nome);
          console.log('🎲 [App] - Perícia:', validated.data.pericia);
          console.log('🎲 [App] - Força:', validated.data.forca);
          console.log('🎲 [App] - Sorte:', validated.data.sorte);
          console.log('🎲 [App] - Bolsa:', validated.data.bolsa);
          
          // Verificar se a ficha atual é diferente da validada
          if (ficha && (ficha.nome !== validated.data.nome || 
                        ficha.pericia.inicial !== validated.data.pericia.inicial ||
                        ficha.forca.inicial !== validated.data.forca.inicial ||
                        ficha.sorte.inicial !== validated.data.sorte.inicial)) {
            console.log('🎲 [App] ATENÇÃO: Ficha atual diferente da validada!');
            console.log('🎲 [App] - Ficha atual:', ficha);
            console.log('🎲 [App] - Ficha validada:', validated.data);
          }
          
          setFichaWithLog(validated.data);
        } else {
          console.warn('🎲 [App] Ficha salva inválida. Usando defaults.');
          console.warn('🎲 [App] Erros de validação:', validated.error);
          // Se a validação falhar, cria uma ficha vazia sem moedas
          const fallbackFicha = createEmptyFichaWithoutGold();
          console.log('🎲 [App] Usando ficha de fallback vazia:', fallbackFicha);
          setFichaWithLog(fallbackFicha);
        }
      } catch (error) {
        console.error('🎲 [App] Erro ao carregar ficha:', error);
        const fallbackFicha = createEmptyFichaWithoutGold();
        console.log('🎲 [App] Erro no parse, usando ficha de fallback vazia:', fallbackFicha);
        setFichaWithLog(fallbackFicha);
      }
    } else {
      console.log('🎲 [App] Nenhuma ficha salva encontrada, usando padrão');
      const defaultFicha = createEmptyFichaWithoutGold();
      console.log('🎲 [App] Ficha padrão criada (sem moedas):', defaultFicha);
      setFichaWithLog(defaultFicha);
    }
    // screenId salvo é usado apenas para retomar via rota /game/:id
  }, []);

  const handleStartAdventure = () => {
    navigate('/sheet');
  };

  const handleFichaChange = (newFicha: Ficha) => {
    console.log('🎲 [App] handleFichaChange chamado com:', newFicha);
    
    // Verificação de segurança
    if (!newFicha || !newFicha.bolsa || !Array.isArray(newFicha.bolsa)) {
      console.error('🎲 [App] ERRO: Tentativa de salvar ficha inválida em handleFichaChange');
      return;
    }
    
    console.log('🎲 [App] - Nome recebido:', newFicha.nome);
    console.log('🎲 [App] - Perícia recebida:', newFicha.pericia);
    console.log('🎲 [App] - Força recebida:', newFicha.forca);
    console.log('🎲 [App] - Sorte recebida:', newFicha.sorte);
    console.log('🎲 [App] - Bolsa recebida:', newFicha.bolsa);
    
    setFichaWithLog(newFicha);
    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(newFicha));
      console.log('🎲 [App] Ficha atualizada e salva com sucesso');
    } catch (e) {
      console.error('🎲 [App] Falha ao salvar no localStorage:', e);
    }
  };

  const handleLocationSelect = (location: string) => {
    console.log(`🗺️ Navegando para: ${location}`);
    setCurrentLocation(location);
    
    // Roteamento baseado na localização
    switch (location) {
      case 'Royal':
        navigate('/royal');
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
    console.log(`Escolha feita: ${choice} em ${currentLocation}`);
    
    // Roteamento baseado na escolha
    switch (choice) {
      case 'aceitar_jogo':
        console.log('Jogador aceitou o jogo de Bartolph');
        try { localStorage.setItem('cavaleiro:screenId', '86'); } catch {}
        navigate('/game/86');
        break;
      case 'recusar_jogo':
        console.log('🚶 Jogador recusou o jogo e vai se preparar');
        try { localStorage.setItem('cavaleiro:screenId', '30'); } catch {}
        navigate('/game/30');
        break;
      default:
        console.log(`❓ Escolha não reconhecida: ${choice}`);
    }
  };

  const handleGameResult = (won: boolean, goldChange: number) => {
    console.log(`🎲 [App] handleGameResult chamado: ${won ? 'Vitória' : 'Derrota'}, Mudança de ouro: ${goldChange}`);
    console.log(`🎲 [App] Ficha antes da atualização:`, ficha);
    
    // Verificação de segurança
    if (!ficha || !ficha.bolsa || !Array.isArray(ficha.bolsa)) {
      console.error('🎲 [App] ERRO: Ficha inválida em handleGameResult');
      return;
    }
    
    // Atualizar ouro na ficha
    const updatedFicha = { ...ficha };
    const goldItemIndex = updatedFicha.bolsa.findIndex(item => item.tipo === 'ouro');
    
    console.log(`🎲 [App] Índice do item de ouro: ${goldItemIndex}`);
    
    if (goldItemIndex !== -1) {
      const currentGold = updatedFicha.bolsa[goldItemIndex].quantidade || 0;
      const newGold = Math.max(0, currentGold + goldChange);
      updatedFicha.bolsa[goldItemIndex].quantidade = newGold;
      
      console.log(`🎲 [App] Ouro atual: ${currentGold}, Mudança: ${goldChange}, Novo ouro: ${newGold}`);
      console.log(`🎲 [App] Item de ouro atualizado:`, updatedFicha.bolsa[goldItemIndex]);
    } else {
      console.log(`🎲 [App] ERRO: Item de ouro não encontrado na bolsa!`);
    }
    
    console.log(`🎲 [App] Ficha após atualização:`, updatedFicha);
    
    // Verificação adicional antes de salvar
    if (updatedFicha.bolsa && Array.isArray(updatedFicha.bolsa)) {
      setFichaWithLog(updatedFicha);
      
              try {
          localStorage.setItem('cavaleiro:ficha', JSON.stringify(updatedFicha));
          console.log(`🎲 [App] Ficha salva no localStorage com sucesso`);
          
          // DEBUG: Verificar o que foi salvo
          const savedData = localStorage.getItem('cavaleiro:ficha');
          console.log(`🎲 [App] DEBUG: Dados salvos no localStorage:`, savedData);
          try {
            const parsed = JSON.parse(savedData || '');
            console.log(`🎲 [App] DEBUG: Ficha parseada do localStorage:`, parsed);
            console.log(`🎲 [App] DEBUG: - Nome salvo:`, parsed.nome);
            console.log(`🎲 [App] DEBUG: - Perícia salva:`, parsed.pericia);
            console.log(`🎲 [App] DEBUG: - Força salva:`, parsed.forca);
            console.log(`🎲 [App] DEBUG: - Sorte salva:`, parsed.sorte);
            console.log(`🎲 [App] DEBUG: - Bolsa salva:`, parsed.bolsa);
          } catch (error) {
            console.error(`🎲 [App] DEBUG: Erro ao parsear dados salvos:`, error);
          }
        } catch (error) {
        console.error(`🎲 [App] ERRO ao salvar no localStorage:`, error);
      }
    } else {
      console.error(`🎲 [App] ERRO: Ficha inválida após atualização`);
    }
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
        {/* Bolsa global visível apenas após início da aventura */}
        {showGlobalStatus && (
          <>
            <GlobalPlayerStatus onClick={() => setGlobalInventoryOpen(true)}>
              {ficha.nome || 'Herói'} | 💰 {totalOuro(ficha)} Moedas de Ouro
            </GlobalPlayerStatus>
            <InventoryModal
              open={globalInventoryOpen}
              onClose={() => setGlobalInventoryOpen(false)}
              ficha={ficha}
            />
          </>
        )}
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

        <Routes>
          <Route path="/" element={<Home onStart={handleStartAdventure} />} />
          <Route path="/sheet" element={<CharacterSheet ficha={ficha} onFichaChange={handleFichaChange} onVoltar={() => navigate('/')} onStartCinematic={() => navigate('/intro')} />} />
          <Route path="/intro" element={<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, '&::after': { display: 'none !important' } }}><IntroCinematic onFinish={() => navigate('/map')} /></Box>} />
          <Route path="/map" element={<MapScreen onLocationSelect={handleLocationSelect} />} />
          <Route path="/royal" element={<RoyalLendleScreen onChoice={handleGameChoice} onBackToMap={() => navigate('/map')} ficha={ficha} />} />

          <Route path="/game/:id" element={<ScreenRouter ficha={ficha} onGameResult={handleGameResult} onAdjustSorte={(delta:number)=>{
            setFichaWithLog(prev=>{
              const next = { ...prev } as Ficha;
              const inicial = next.sorte.inicial;
              const novoAtual = Math.max(0, Math.min(inicial, next.sorte.atual + delta));
              next.sorte = { ...next.sorte, atual: novoAtual };
              try { localStorage.setItem('cavaleiro:ficha', JSON.stringify(next)); } catch {}
              return next;
            });
          }} onFichaChange={handleFichaChange} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Box>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default function App() {
  const inRouter = useInRouterContext();
  const content = <AppContent />;
  return inRouter ? content : <BrowserRouter>{content}</BrowserRouter>;
}

// Componente de status global (bolsa sempre visível)
const GlobalPlayerStatus = styled('div')({
  position: 'fixed',
  top: 16,
  right: 16,
  padding: '10px 14px',
  background: 'rgba(139,69,19,0.85)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  cursor: 'pointer',
  zIndex: 20000,
  userSelect: 'none',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)'
  },
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: 2
  }
});