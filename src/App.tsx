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
import { totalOuro, validarBolsa } from './utils/inventory';
import { useItemEffects } from './hooks/useItemEffects';
import SaveGameButton from './components/SaveGameButton';

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

  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hook para gerenciar efeitos dos itens - deve estar no nível superior
  const { applyModifiersToAttributes } = useItemEffects();
  
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
    ],
    modificadoresAtivos: {
      pericia: 0,
      forca: 0,
      sorte: 0,
      ataque: 0
    }
  });

  const [ficha, setFicha] = useState<Ficha>(() => {
    // Tentar carregar ficha salva do localStorage
    try {
      const savedFicha = localStorage.getItem('cavaleiro:ficha');
      if (savedFicha) {
        const parsed = JSON.parse(savedFicha);
        console.log('🔄 [App] Ficha carregada do localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.warn('⚠️ [App] Erro ao carregar ficha do localStorage:', error);
    }
    
    // Estado inicial vazio se não houver ficha salva
    return createEmptyFichaWithoutGold();
  });

  // Wrapper para setFicha com logs de debug
  const setFichaWithLog = useCallback((newFicha: Ficha | ((prev: Ficha) => Ficha)) => {

    if (typeof newFicha === 'function') {
      const prevFicha = ficha;
      const nextFicha = newFicha(prevFicha);

      setFicha(nextFicha);
    } else {

      setFicha(newFicha);
    }
  }, [ficha]);

  const [globalInventoryOpen, setGlobalInventoryOpen] = useState(false);
  const showGlobalStatus = !['/', '/sheet', '/intro'].includes(location.pathname);

  // 📍 Sistema de rastreamento de tela atual e redirecionamento para jogos salvos
  useEffect(() => {
    if (location.pathname !== '/') {
      try {
        localStorage.setItem('cavaleiro:lastScreen', location.pathname);
        console.log('📍 [App] Salvando tela atual:', location.pathname);
      } catch (e) {
        console.warn('📍 [App] Erro ao salvar tela atual:', e);
      }
    }
  }, [location.pathname]);

  // 🔄 Redirecionar para última tela quando carregar jogo salvo
  useEffect(() => {
    // Se estamos na home e há uma ficha carregada, verificar se deve redirecionar
    if (location.pathname === '/' && ficha.nome) {
      try {
        const lastScreen = localStorage.getItem('cavaleiro:lastScreen');
        if (lastScreen && lastScreen !== '/') {
          console.log('🔄 [App] Redirecionando para última tela:', lastScreen);
          setTimeout(() => {
            navigate(lastScreen);
          }, 100);
        }
      } catch (e) {
        console.warn('⚠️ [App] Erro ao verificar última tela:', e);
      }
    }
  }, [location.pathname, ficha.nome, navigate]);

  useEffect(() => {
    // 🎯 FASE 1 IMPLEMENTADA: Home sempre limpa localStorage
    // 🎮 Carregar dados salvos (refresh, navegação, etc.)
    const savedData = localStorage.getItem('cavaleiro:ficha');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const validated = FichaSchema.safeParse(parsed);
        if (validated.success) {
          console.log('🎮 [App] Carregando ficha salva da sessão ativa');
          setFichaWithLog(validated.data);
        } else {
          console.warn('🎲 [App] Ficha salva inválida. Usando defaults.');
          const fallbackFicha = createEmptyFichaWithoutGold();
          setFichaWithLog(fallbackFicha);
        }
      } catch (error) {
        console.error('🎲 [App] Erro ao carregar ficha:', error);
        const fallbackFicha = createEmptyFichaWithoutGold();
        setFichaWithLog(fallbackFicha);
      }
    } else {
      const defaultFicha = createEmptyFichaWithoutGold();
      setFichaWithLog(defaultFicha);
    }
    
    // screenId salvo é usado apenas para retomar via rota /game/:id
  }, []);

  const handleStartAdventure = () => {
    navigate('/sheet');
  };



  const handleFichaChange = (newFicha: Ficha) => {
    // Verificação de segurança
    if (!newFicha || !newFicha.bolsa || !Array.isArray(newFicha.bolsa)) {
      console.error('🎲 [App] ERRO: Tentativa de salvar ficha inválida em handleFichaChange');
      return;
    }
    
    // 🔧 Validar e corrigir a bolsa automaticamente
    const fichaValidada = validarBolsa(newFicha);
    
    // Se houve correções, logar para debug
    if (fichaValidada.bolsa.length !== newFicha.bolsa.length) {
      console.log('🔧 [App] Bolsa corrigida automaticamente - removidas duplicatas');
    }
    
    // Aplicar modificadores dos itens aos atributos
    const fichaComModificadores = applyModifiersToAttributes(fichaValidada);
    
    setFichaWithLog(fichaComModificadores);
    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(fichaComModificadores));
    } catch (e) {
      console.error('🎲 [App] Falha ao salvar no localStorage:', e);
    }
  };

  const handleLocationSelect = (location: string) => {
    console.log(`🗺️ [App] Navegando para localização: ${location}`);

    // Roteamento baseado na localização
    switch (location) {
      case 'Royal':
        console.log('🏰 [App] Navegando para Royal Lendle');
        navigate('/royal');
        break;
      case 'Karnstein':
        console.log('🏰 [App] Navegando para Karnstein (não implementado)');
        // TODO: Implementar tela de Karnstein
        break;
      default:
        console.warn('⚠️ [App] Localização desconhecida:', location);
    }
  };

  const handleGameChoice = (choice: string) => {
    console.log(`🎲 [App] Escolha do jogo: ${choice}`);

    // Roteamento baseado na escolha
    switch (choice) {
      case 'aceitar_jogo':
        console.log('✅ [App] Jogador aceitou o jogo, navegando para tela 86');
        try { 
          localStorage.setItem('cavaleiro:screenId', '86');
          localStorage.setItem('cavaleiro:aceitouBartolph', 'true');
        } catch {}
        navigate('/game/86');
        break;
      case 'recusar_jogo':
        console.log('❌ [App] Jogador recusou o jogo, navegando para tela 30');
        try { 
          localStorage.setItem('cavaleiro:screenId', '30');
          localStorage.setItem('cavaleiro:aceitouBartolph', 'false');
        } catch {}
        navigate('/game/30');
        break;
      default:
        console.warn('⚠️ [App] Escolha desconhecida:', choice);
    }
  };

  const handleGameResult = (_won: boolean, goldChange: number) => {

    
    // Verificação de segurança
    if (!ficha || !ficha.bolsa || !Array.isArray(ficha.bolsa)) {
      console.error('🎲 [App] ERRO: Ficha inválida em handleGameResult');
      return;
    }
    
    // Atualizar ouro na ficha
    const updatedFicha = { ...ficha };
    const goldItemIndex = updatedFicha.bolsa.findIndex(item => item.tipo === 'ouro');
    
    
    
    if (goldItemIndex !== -1) {
      const currentGold = updatedFicha.bolsa[goldItemIndex].quantidade || 0;
      const newGold = Math.max(0, currentGold + goldChange);
      updatedFicha.bolsa[goldItemIndex].quantidade = newGold;
      
      
    } else {

    }
    

    
    // Verificação adicional antes de salvar
    if (updatedFicha.bolsa && Array.isArray(updatedFicha.bolsa)) {
      setFichaWithLog(updatedFicha);
      
              try {
          localStorage.setItem('cavaleiro:ficha', JSON.stringify(updatedFicha));
  
          

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
            {/* Botão de salvamento sempre visível durante o jogo */}
            <SaveGameButton ficha={ficha} />
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
          <Route path="/sheet" element={<CharacterSheet ficha={ficha} onFichaChange={handleFichaChange} onVoltar={() => navigate('/')} onStartCinematic={() => {
            console.log('🎬 [App] Navegando para tela de introdução...');
            try {
              navigate('/intro');
              console.log('✅ [App] Navegação para introdução bem-sucedida');
            } catch (error) {
              console.error('❌ [App] Erro ao navegar para introdução:', error);
              // Fallback: tentar novamente
              setTimeout(() => navigate('/intro'), 100);
            }
          }} />} />
          <Route path="/intro" element={<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, '&::after': { display: 'none !important' } }}><IntroCinematic onFinish={() => {
            console.log('🎬 [App] Introdução finalizada, navegando para mapa...');
            navigate('/map');
          }} /></Box>} />
          <Route path="/map" element={<MapScreen onLocationSelect={handleLocationSelect} />} />
          <Route path="/royal" element={<RoyalLendleScreen onChoice={handleGameChoice} onBackToMap={() => {
            console.log('🗺️ [App] Usuário voltando do Royal para o Mapa');
            navigate('/map');
          }} ficha={ficha} />} />

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