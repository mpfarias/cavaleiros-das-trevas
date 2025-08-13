import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Casino as CasinoIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Inventory as InventoryIcon,
  Shield as ShieldIcon,
  LocalOffer as LocalOfferIcon,
  Restaurant as RestaurantIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { Ficha, Item } from '../types';
import { adicionarItem, totalOuro } from '../utils/inventory';

import AudioControls from './AudioControls';
import { useAudio } from '../hooks/useAudio';
import bgmFicha from '../assets/sounds/bgm-ficha.mp3';

interface CharacterSheetProps {
  ficha: Ficha;
  onFichaChange: (ficha: Ficha) => void;
  onVoltar: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ ficha, onFichaChange, onVoltar }) => {
  type Severity = 'success' | 'info' | 'warning' | 'error';
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<Severity>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bolsaModalOpen, setBolsaModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [usarMeusDados, setUsarMeusDados] = useState(false);
  
  const { changeTrack } = useAudio();

  // Carrega a música específica da ficha quando o componente monta
  useEffect(() => {
    const loadMusic = async () => {
      try {
        await changeTrack(bgmFicha);
        console.log('Música de fundo carregada para a ficha do personagem');
      } catch (error) {
        console.log('Erro ao carregar música da ficha:', error);
      }
    };
    
    loadMusic();
  }, []); // Executa apenas uma vez quando o componente monta

  const d6 = () => Math.floor(Math.random() * 6) + 1;

  const updateFicha = (updates: Partial<Ficha>) => {
    const newFicha = { ...ficha, ...updates };
    onFichaChange(newFicha);
  };

  const rolarPericia = () => {
    const valor = d6() + 6;
    updateFicha({
      pericia: { inicial: valor, atual: valor },
    });
  };

  const rolarForca = () => {
    const dado1 = d6();
    const dado2 = d6();
    const valor = dado1 + dado2 + 12;
    updateFicha({
      forca: { inicial: valor, atual: valor },
    });
  };

  const rolarSorte = () => {
    const valor = d6() + 6;
    updateFicha({
      sorte: { inicial: valor, atual: valor },
    });
  };

  const handleAtributoChange = (attr: 'pericia' | 'forca' | 'sorte', valor: number) => {
    // Validação dos limites
    let valorValidado = valor;
    if (attr === 'pericia' && valor > 12) valorValidado = 12;
    if (attr === 'forca' && valor > 24) valorValidado = 24;
    if (attr === 'sorte' && valor > 12) valorValidado = 12;
    if (valorValidado < 0) valorValidado = 0;

    updateFicha({
      [attr]: { inicial: valorValidado, atual: valorValidado },
    });
  };

  const rolarMoedasOuro = () => {
    const dado1 = d6();
    const dado2 = d6();
    const valor = dado1 + dado2 + 12;
    
    // Adiciona as moedas de ouro à bolsa
    let novaFicha = ficha;
    novaFicha = adicionarItem(novaFicha, {
      nome: 'Moedas de Ouro',
      tipo: 'ouro',
      quantidade: valor,
      descricao: 'Moedas de ouro iniciais do personagem',
      adquiridoEm: 'Criação do Personagem'
    });
    
    // Atualiza a ficha com as moedas na bolsa
    updateFicha(novaFicha);
    
    setSnackbarMessage(`Moedas de ouro roladas: ${dado1} + ${dado2} + 12 = ${valor} moedas adicionadas à bolsa!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const salvar = () => {
    if (!ficha.nome.trim()) {
      setSnackbarMessage('Digite um nome para o personagem antes de salvar.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(ficha));
    const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ficha.nome.trim()}.cavaleiro.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSnackbarMessage(`Ficha de ${ficha.nome} salva e baixada como arquivo.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const resetar = () => {
    setConfirmOpen(true);
  };

  const comecarAventura = () => {
    if (!ficha.nome.trim()) {
      setSnackbarMessage('Digite um nome para o personagem antes de começar.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    if (!ficha.pericia.inicial || !ficha.forca.inicial || !ficha.sorte.inicial) {
      setSnackbarMessage('Role PERÍCIA, FORÇA e SORTE antes de começar.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    const moedasOuro = ficha.bolsa.find(item => item.nome === 'Moedas de Ouro');
    if (!moedasOuro) {
      setSnackbarMessage('Role as MOEDAS DE OURO antes de começar.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setSnackbarMessage(`Aventura de ${ficha.nome} iniciada! (Próximo passo: leitor de seções e motor de combate.)`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };




  const StatCard = ({ 
    title, 
    attr, 
    onRoll, 
    rollText 
  }: { 
    title: string; 
    attr: 'pericia' | 'forca' | 'sorte'; 
    onRoll: () => void; 
    rollText: string;
  }) => {
    const getMaxValue = () => {
      switch (attr) {
        case 'pericia': return 12;
        case 'forca': return 24;
        case 'sorte': return 12;
        default: return 12;
      }
    };

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
            <Typography variant="h6" component="strong">
              {title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={ficha[attr].atual || '–'}
                sx={{ minWidth: 64, fontWeight: 700 }}
              />
              <Typography variant="caption" color="text.secondary">
                Inicial:
              </Typography>
              <Chip
                label={ficha[attr].inicial || '–'}
                sx={{ minWidth: 64, fontWeight: 700 }}
              />
            </Box>
          </Box>
          
          {usarMeusDados ? (
            /* Campo editável quando checkbox está marcado */
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Digite um valor entre 0 e {getMaxValue()}:
              </Typography>
                             <input
                 type="number"
                 min="0"
                 max={getMaxValue()}
                 defaultValue={ficha[attr].inicial || ''}
                 onBlur={(e) => {
                   const valor = parseInt(e.target.value) || 0;
                   handleAtributoChange(attr, valor);
                   e.target.style.border = '1px solid rgba(179,18,18,0.4)';
                   e.target.style.background = 'rgba(255,255,255,0.08)';
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     const valor = parseInt(e.currentTarget.value) || 0;
                     handleAtributoChange(attr, valor);
                     e.currentTarget.blur();
                   }
                 }}
                 style={{
                   width: '100%',
                   padding: '8px 12px',
                   fontSize: '14px',
                   fontFamily: '"Spectral", serif',
                   background: 'rgba(255,255,255,0.08)',
                   border: '1px solid rgba(179,18,18,0.4)',
                   borderRadius: '6px',
                   color: '#E0DFDB',
                   outline: 'none',
                   transition: 'all 0.2s ease',
                 }}
                 onFocus={(e) => {
                   e.target.style.border = '1px solid rgba(179,18,18,0.7)';
                   e.target.style.background = 'rgba(255,255,255,0.12)';
                 }}
               />
            </Box>
          ) : (
            /* Botão de rolar quando checkbox não está marcado */
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onRoll}
                startIcon={<CasinoIcon />}
              >
                {rollText}
              </Button>
            </Stack>
          )}
          
          <Typography variant="caption" color="text.secondary">
            {attr === 'pericia' && 'Representa sua habilidade em combate.'}
            {attr === 'forca' && 'Resistência física e capacidade de sobreviver.'}
            {attr === 'sorte' && 'Quanto a fortuna costuma estar do seu lado.'}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const getItemIcon = (tipo: Item['tipo']) => {
    switch (tipo) {
      case 'arma': return <LocalOfferIcon />;
      case 'armadura': return <ShieldIcon />;
      case 'ouro': return <LocalOfferIcon />;
      case 'provisao': return <RestaurantIcon />;
      case 'equipamento': return <BuildIcon />;
      default: return <InventoryIcon />;
    }
  };

  const getItemColor = (tipo: Item['tipo']) => {
    switch (tipo) {
      case 'arma': return '#B31212';
      case 'armadura': return '#B67B03';
      case 'ouro': return '#dFc810';
      case 'provisao': return '#4CAF50';
      case 'equipamento': return '#2196F3';
      default: return '#757575';
    }
  };

  const BolsaCard = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            <Typography variant="h6" component="strong">
              Bolsa do Personagem
            </Typography>
          </Box>
          
          {ficha.bolsa.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBolsaModalOpen(true)}
              startIcon={<InventoryIcon />}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'text.primary',
                }
              }}
            >
              Abrir a Bolsa
            </Button>
          )}
        </Box>
        
        {ficha.bolsa.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Sua bolsa está vazia. Os itens serão adicionados automaticamente durante a aventura.
          </Typography>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {ficha.bolsa.length} item(s) na bolsa
            </Typography>
            {/* Mostra os 2 primeiros itens */}
            <List dense sx={{ mb: 2 }}>
              {ficha.bolsa.slice(0, 2).map((item, index) => (
                <Box key={item.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getItemIcon(item.tipo)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" component="span">
                            {item.nome}
                          </Typography>
                          {item.quantidade && item.quantidade > 1 && (
                            <Chip
                              label={`x${item.quantidade}`}
                              size="small"
                              sx={{ 
                                backgroundColor: getItemColor(item.tipo),
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                          </Typography>
                          {item.descricao && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {item.descricao}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < Math.min(2, ficha.bolsa.length) - 1 && <Divider />}
                </Box>
              ))}
            </List>
            
            {ficha.bolsa.length > 2 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                +{ficha.bolsa.length - 2} item(s) restante(s)
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const handleConfirmReset = () => {
    setConfirmOpen(false);
    localStorage.removeItem('cavaleiro:ficha');
    window.location.reload();
  };

  const handleCancelReset = () => {
    setConfirmOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Timer automático para fechar notificações
  useEffect(() => {
    if (snackbarOpen) {
      const timer = setTimeout(() => {
        setSnackbarOpen(false);
      }, 4000); // 4 segundos

      return () => clearTimeout(timer);
    }
  }, [snackbarOpen]);

  return (
    <Box
      sx={{
        maxWidth: 1100,
        margin: '6vh auto',
        padding: { xs: '20px', sm: '32px', md: '48px' },
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), rgba(15,17,20,0.55)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 120px rgba(255,255,255,0.03)',
        borderRadius: '24px',
        backdropFilter: 'blur(3px)',
        fontFamily: '"Spectral", serif',
      }}
    >
      {/* Notificação Personalizada */}
      <Fade in={snackbarOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            display: snackbarOpen ? 'flex' : 'none',
            alignItems: 'center',
            gap: 2,
            padding: '16px 24px',
            background: 'linear-gradient(135deg, rgba(15,17,20,0.95), rgba(25,27,30,0.95))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            minWidth: '300px',
            maxWidth: '500px',
            animation: snackbarOpen ? 'notificationSlideIn 0.3s ease-out' : 'none',
            '@keyframes notificationSlideIn': {
              '0%': {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.8)',
              },
              '100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)',
              },
            },
          }}
        >
          {/* Ícone baseado no tipo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: () => {
                switch (snackbarSeverity) {
                  case 'success': return 'linear-gradient(135deg, #4CAF50, #45a049)';
                  case 'info': return 'linear-gradient(135deg, #2196F3, #1976D2)';
                  case 'warning': return 'linear-gradient(135deg, #FF9800, #F57C00)';
                  case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
                  default: return 'linear-gradient(135deg, #757575, #616161)';
                }
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {snackbarSeverity === 'success' && <CheckCircleIcon sx={{ color: 'white', fontSize: '24px' }} />}
            {snackbarSeverity === 'info' && <InfoIcon sx={{ color: 'white', fontSize: '24px' }} />}
            {snackbarSeverity === 'warning' && <WarningIcon sx={{ color: 'white', fontSize: '24px' }} />}
            {snackbarSeverity === 'error' && <ErrorIcon sx={{ color: 'white', fontSize: '24px' }} />}
          </Box>

          {/* Mensagem */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              flex: 1,
              textAlign: 'center',
              fontSize: '16px',
            }}
          >
            {snackbarMessage}
          </Typography>

          {/* Botão de fechar */}
          <IconButton
            onClick={handleSnackbarClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Fade>

      <Typography variant="h2" sx={{ mb: 2 }}>
        Ficha do Personagem
      </Typography>

                    {/* Campo Nome do Personagem */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="label" sx={{ minWidth: '120px' }}>
                Nome:
              </Typography>
              <input
                type="text"
                value={ficha.nome}
                onChange={(e) => updateFicha({ nome: e.target.value })}
                placeholder="Digite o nome do personagem"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontFamily: '"Spectral", serif',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#E0DFDB',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(179,18,18,0.5)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Checkbox Usar Meus Dados - Separado do campo nome */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                onClick={() => setUsarMeusDados(!usarMeusDados)}
                sx={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(179,18,18,0.6)',
                  borderRadius: '4px',
                  background: usarMeusDados ? 'rgba(179,18,18,0.8)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'rgba(179,18,18,0.8)',
                    background: usarMeusDados ? 'rgba(179,18,18,0.9)' : 'rgba(179,18,18,0.1)',
                  },
                }}
              >
                {usarMeusDados && (
                  <Box
                    sx={{
                      width: '12px',
                      height: '12px',
                      background: 'white',
                      borderRadius: '2px',
                      transform: 'rotate(45deg)',
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { color: 'text.primary' }
                }}
                onClick={() => setUsarMeusDados(!usarMeusDados)}
              >
                Usar meus dados (inserir valores manualmente)
              </Typography>
            </Box>
          </CardContent>
        </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard
          title="PERÍCIA"
          attr="pericia"
          onRoll={rolarPericia}
          rollText="1 D6 + 6"
        />
        <StatCard
          title="FORÇA"
          attr="forca"
          onRoll={rolarForca}
          rollText="2 D6 + 12"
        />
        <StatCard
          title="SORTE"
          attr="sorte"
          onRoll={rolarSorte}
          rollText="1 D6 + 6"
        />
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
              <Typography variant="h6" component="strong">
                Moedas de Ouro
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={ficha.bolsa.find(item => item.nome === 'Moedas de Ouro')?.quantidade || '–'}
                  sx={{ minWidth: 64, fontWeight: 700, backgroundColor: '#eAD700', color: 'black' }}
                />
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={rolarMoedasOuro}
                startIcon={<CasinoIcon />}
                disabled={!!ficha.bolsa.find(item => item.nome === 'Moedas de Ouro')}
                sx={{
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }
                }}
              >
                2 D6 + 12
              </Button>
            </Stack>
            
            <Typography variant="caption" color="text.secondary">
              Moedas iniciais do personagem. Role apenas uma vez.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 3 }}>
        <BolsaCard />

      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          
          <Button
            variant="contained"
            color="success"
            onClick={salvar}
            startIcon={<SaveIcon />}
            sx={{ background: '#123b26', borderColor: '#216547' }}
          >
            Salvar
          </Button>

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Continuar Aventura
            <input
              type="file"
              accept="application/json,.json,.cavaleiro.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(String(reader.result || '{}'));
                    updateFicha(data);
                    setSnackbarMessage('Ficha importada do arquivo.');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                  } catch {
                    setSnackbarMessage('Arquivo inválido.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  }
                };
                reader.readAsText(file);
                e.currentTarget.value = '';
              }}
            />
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={resetar}
            startIcon={<DeleteIcon />}
            sx={{ background: '#3b1212', borderColor: '#6b1c1c' }}
          >
            Limpar
          </Button>
          <Button
            variant="outlined"
            onClick={onVoltar}
            sx={{ 
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'text.primary',
              }
            }}
          >
            Voltar
          </Button>
          
        </Stack>
        
        <Button
          variant="contained"
          size="large"
          onClick={comecarAventura}
          startIcon={<PlayArrowIcon />}
          sx={{
            background: 'linear-gradient(180deg, rgba(179,18,18,0.85), rgba(179,18,18,0.7))',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: '14px 22px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 28px rgba(179,18,18,0.35)',
            transition: 'transform 0.12s, box-shadow 0.2s, background 0.2s',
            '&:hover': {
              transform: 'translateY(-1px)',
              background: 'linear-gradient(180deg, rgba(182,123,3,0.95), rgba(179,18,18,0.85))',
              boxShadow: '0 12px 36px rgba(182,123,3,0.35)',
            },
          }}
        >
          Começar
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={handleCancelReset}>
        <DialogTitle>Apagar ficha?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esta ação removerá sua ficha salva do dispositivo. Deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReset}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmReset} startIcon={<DeleteIcon />}>
            Apagar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal da Bolsa */}
      <Dialog 
        open={bolsaModalOpen} 
        onClose={() => setBolsaModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon />
              <Typography variant="h6">
                Bolsa do Personagem
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${totalOuro(ficha)} moedas de ouro`}
                sx={{ 
                  backgroundColor: '#FFD700', 
                  color: 'black',
                  fontWeight: 700
                }}
              />
              <IconButton
                onClick={() => setBolsaModalOpen(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={abaAtiva} 
              onChange={(_, newValue) => setAbaAtiva(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Armas" />
              <Tab label="Armaduras" />
              <Tab label="Equipamentos" />
              <Tab label="Provisões" />
              <Tab label="Ouro" />
            </Tabs>
          </Box>
          
          {/* Conteúdo das abas */}
          {abaAtiva === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#B31212' }}>
                🗡️ Armas
              </Typography>
              {ficha.bolsa.filter(item => item.tipo === 'arma').length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhuma arma na bolsa.
                </Typography>
              ) : (
                <List>
                  {ficha.bolsa.filter(item => item.tipo === 'arma').map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getItemIcon(item.tipo)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.nome}
                          secondary={
                            <Box>
                              {item.descricao && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.descricao}
                                </Typography>
                              )}
                              {item.adquiridoEm && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Obtido em: {item.adquiridoEm}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < ficha.bolsa.filter(item => item.tipo === 'arma').length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {abaAtiva === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#B67B03' }}>
                🛡️ Armaduras
              </Typography>
              {ficha.bolsa.filter(item => item.tipo === 'armadura').length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhuma armadura na bolsa.
                </Typography>
              ) : (
                <List>
                  {ficha.bolsa.filter(item => item.tipo === 'armadura').map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getItemIcon(item.tipo)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.nome}
                          secondary={
                            <Box>
                              {item.descricao && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.descricao}
                                </Typography>
                              )}
                              {item.adquiridoEm && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Obtido em: {item.adquiridoEm}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < ficha.bolsa.filter(item => item.tipo === 'armadura').length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {abaAtiva === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#2196F3' }}>
                🛠️ Equipamentos
              </Typography>
              {ficha.bolsa.filter(item => item.tipo === 'equipamento').length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum equipamento na bolsa.
                </Typography>
              ) : (
                <List>
                  {ficha.bolsa.filter(item => item.tipo === 'equipamento').map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getItemIcon(item.tipo)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.nome}
                          secondary={
                            <Box>
                              {item.descricao && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.descricao}
                                </Typography>
                              )}
                              {item.adquiridoEm && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Obtido em: {item.adquiridoEm}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < ficha.bolsa.filter(item => item.tipo === 'equipamento').length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {abaAtiva === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                🍖 Provisões
              </Typography>
              {ficha.bolsa.filter(item => item.tipo === 'provisao').length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhuma provisão na bolsa.
                </Typography>
              ) : (
                <List>
                  {ficha.bolsa.filter(item => item.tipo === 'provisao').map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getItemIcon(item.tipo)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                {item.nome}
                              </Typography>
                              {item.quantidade && item.quantidade > 1 && (
                                <Chip
                                  label={`x${item.quantidade}`}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {item.descricao && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.descricao}
                                </Typography>
                              )}
                              {item.adquiridoEm && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Obtido em: {item.adquiridoEm}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < ficha.bolsa.filter(item => item.tipo === 'provisao').length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {abaAtiva === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                💰 Ouro
              </Typography>
              {ficha.bolsa.filter(item => item.tipo === 'ouro').length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum ouro na bolsa.
                </Typography>
              ) : (
                <List>
                  {ficha.bolsa.filter(item => item.tipo === 'ouro').map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getItemIcon(item.tipo)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                {item.nome}
                              </Typography>
                              {item.quantidade && item.quantidade > 1 && (
                                <Chip
                                  label={`x${item.quantidade}`}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#FFD700',
                                    color: 'black',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {item.descricao && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.descricao}
                                </Typography>
                              )}
                              {item.adquiridoEm && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Obtido em: {item.adquiridoEm}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < ficha.bolsa.filter(item => item.tipo === 'ouro').length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setBolsaModalOpen(false)}>
            Fechar
          </Button>
                 </DialogActions>
       </Dialog>

        {/* Controles de música */}
        <AudioControls />
     </Box>
   );
 };

export default CharacterSheet;