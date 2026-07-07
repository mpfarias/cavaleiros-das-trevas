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
import { FichaSchema, createTrulyEmptyFicha } from './types';
import { AudioProvider } from './contexts/AudioContext';
import './index.css';
import InventoryModal from './components/InventoryModal';
import { styled } from '@mui/material/styles';
import { totalOuro, validarBolsa } from './utils/inventory';
import { useItemEffects } from './hooks/useItemEffects';
import { useBagSound } from './hooks/useBagSound';
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
  const playBag = useBagSound(3.0);
  
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
        // Ficha carregada do localStorage
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
    setFicha(prev => (typeof newFicha === 'function' ? newFicha(prev) : newFicha));
  }, []);

  const [globalInventoryOpen, setGlobalInventoryOpen] = useState(false);
  const showGlobalStatus = !['/', '/sheet', '/intro'].includes(location.pathname);

  // 📍 Sistema de rastreamento de tela atual e redirecionamento para jogos salvos
  useEffect(() => {
    if (location.pathname !== '/') {
      try {
        localStorage.setItem('cavaleiro:lastScreen', location.pathname);
        // Salvando tela atual
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
          // Redirecionando para última tela
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
          // Carregando ficha salva da sessão ativa
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
  }, [setFichaWithLog]);

  const handleStartAdventure = () => {
    // Novo jogo: ir para a tela de criação de personagem (ficha). Depois o jogador segue: /sheet → /intro → /map → /game/...
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
    
    // Aplicar modificadores dos itens aos atributos
    const fichaComModificadores = applyModifiersToAttributes(fichaValidada);
    
    // IMPORTANTE: Salvar no localStorage ANTES de setState para garantir consistência
    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(fichaComModificadores));
    } catch (e) {
      console.error('🎲 [App] Falha ao salvar no localStorage:', e);
    }
    
    setFichaWithLog(fichaComModificadores);
  };

  const handleGameOverRestart = () => {
    const emptyFicha = createTrulyEmptyFicha();
    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(emptyFicha));
      localStorage.removeItem('cavaleiro:lastScreen');
      localStorage.removeItem('cavaleiro:screenId');
      localStorage.removeItem('cavaleiro:checkpoint');
    } catch (e) {
      console.warn('Erro ao resetar progresso:', e);
    }
    setFichaWithLog(emptyFicha);
    navigate('/sheet');
  };

  const handleLoadGame = (saveData: { ficha: Ficha; lastScreen?: string }) => {
    const validated = FichaSchema.safeParse(saveData.ficha);
    if (!validated.success) {
      alert('Arquivo de save inválido ou corrompido.');
      return;
    }

    const restoredFicha = validarBolsa(validated.data);
    const targetScreen = saveData.lastScreen || '/map';

    try {
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(restoredFicha));
      localStorage.setItem('cavaleiro:lastScreen', targetScreen);
    } catch (e) {
      console.warn('Erro ao carregar save:', e);
    }

    setFichaWithLog(restoredFicha);
    navigate(targetScreen);
  };

  const handleLocationSelect = (location: string) => {
          // Navegando para localização

    // Roteamento baseado na localização
    switch (location) {
      case 'Royal':
        // Navegando para Royal Lendle
        navigate('/royal');
        break;
      case 'Karnstein':
        // Navegando para Karnstein (não implementado)
        // TODO: Implementar tela de Karnstein
        break;
      default:
        console.warn('⚠️ [App] Localização desconhecida:', location);
    }
  };

  const handleGameChoice = (choice: string) => {
          // Escolha do jogo

    // Roteamento baseado na escolha
    switch (choice) {
      case 'aceitar_jogo':
        // Jogador aceitou o jogo, navegando para tela 86
        try { 
          localStorage.setItem('cavaleiro:screenId', '86');
          localStorage.setItem('cavaleiro:aceitouBartolph', 'true');
        } catch (error) {
          console.warn('⚠️ [App] Falha ao salvar escolha do jogo:', error);
        }
        navigate('/game/86');
        break;
      case 'recusar_jogo':
        // Jogador recusou o jogo, navegando para tela 30
        try { 
          localStorage.setItem('cavaleiro:screenId', '30');
          localStorage.setItem('cavaleiro:aceitouBartolph', 'false');
        } catch (error) {
          console.warn('⚠️ [App] Falha ao salvar escolha do jogo:', error);
        }
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
      console.warn('⚠️ [App] Item de ouro não encontrado na bolsa:', { goldChange });
    }
    

    
    // Verificação adicional antes de salvar
    if (updatedFicha.bolsa && Array.isArray(updatedFicha.bolsa)) {
      handleFichaChange(updatedFicha);
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
            <GlobalPlayerStatus onClick={() => {
              playBag();
              setGlobalInventoryOpen(true);
            }}>
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
          <Route path="/" element={<Home onStart={handleStartAdventure} onLoadGame={handleLoadGame} />} />
          <Route path="/sheet" element={<CharacterSheet ficha={ficha} onFichaChange={handleFichaChange} onVoltar={() => navigate('/')} onStartCinematic={() => {
            // Navegando para tela de introdução
            try {
              navigate('/intro');
              // Navegação para introdução bem-sucedida
            } catch (error) {
              console.error('❌ [App] Erro ao navegar para introdução:', error);
              // Fallback: tentar novamente
              setTimeout(() => navigate('/intro'), 100);
            }
          }} />} />
          <Route path="/intro" element={<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, '&::after': { display: 'none !important' } }}><IntroCinematic onFinish={() => {
            // Introdução finalizada, navegando para mapa
            navigate('/map');
          }} /></Box>} />
          <Route path="/map" element={<MapScreen onLocationSelect={handleLocationSelect} />} />
          <Route path="/royal" element={<RoyalLendleScreen onChoice={handleGameChoice} onBackToMap={() => {
            // Usuário voltando do Royal para o Mapa
            navigate('/map');
          }} ficha={ficha} />} />

          <Route path="/game/:id" element={<ScreenRouter ficha={ficha} onGameResult={handleGameResult} onGameOverRestart={handleGameOverRestart} onAdjustSorte={(delta:number)=>{
            // Ler do localStorage para garantir a ficha mais atualizada
            let fichaAtualizada: Ficha;
            try {
              const saved = localStorage.getItem('cavaleiro:ficha');
              if (saved) {
                fichaAtualizada = JSON.parse(saved);
              } else {
                fichaAtualizada = { ...ficha };
              }
            } catch (error) {
              console.warn('⚠️ [App] Falha ao ler ficha salva:', error);
              fichaAtualizada = { ...ficha };
            }
            
            const inicial = fichaAtualizada.sorte.inicial;
            const novoAtual = Math.max(0, Math.min(inicial, fichaAtualizada.sorte.atual + delta));
            fichaAtualizada.sorte = { ...fichaAtualizada.sorte, atual: novoAtual };
            handleFichaChange(fichaAtualizada);
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
  return inRouter ? content : (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {content}
    </BrowserRouter>
  );
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
