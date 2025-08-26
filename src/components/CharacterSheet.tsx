import { useState, useEffect, useCallback, useMemo } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Casino as CasinoIcon,

  Upload as UploadIcon,
  Delete as DeleteIcon,

  Inventory as InventoryIcon,
  Shield as ShieldIcon,
  LocalOffer as LocalOfferIcon,
  Restaurant as RestaurantIcon,
  Build as BuildIcon,
  Close as CloseIcon,

} from '@mui/icons-material';
import type { Ficha, Item } from '../types';
import { createTrulyEmptyFicha } from '../types';
import { adicionarItem, totalOuro } from '../utils/inventory';
import { DICE_FORMULAS, ITEM_COLORS } from '../constants/character';

// Hooks
import { useAudio } from '../hooks/useAudio';
import { useNotification } from '../hooks/useNotification';
import { useCharacterValidation } from '../hooks/useCharacterValidation';
import { useDiceRoller } from '../hooks/useDiceRoller';
import { useFileOperations } from '../hooks/useFileOperations';

// Components
import AudioControls from './AudioControls';
import AttributeCard from './character/AttributeCard';
import CustomCheckbox from './ui/CustomCheckbox';
import NotificationToast from './ui/NotificationToast';
import DiceRollModal3D from './ui/DiceRollModal3D';


import bgmFicha from '../assets/sounds/bgm-ficha.mp3';
import screamWoman from '../assets/sounds/scream-woman.mp3';
import { useBagSound } from '../hooks/useBagSound';
import { useCoinSound } from '../hooks/useCoinsSound';
import { useDiceSound } from '../hooks/useDiceSound';
import { useClickSound } from '../hooks/useClickSound';


// Input estilizado para o nome, movido para fora do componente para evitar recriação a cada render
const StyledInput = styled('input')({
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
	'&:focus': {
		border: '1px solid rgba(179,18,18,0.5)',
		background: 'rgba(255,255,255,0.08)'
	}
});

interface CharacterSheetProps {
  ficha: Ficha;
  onFichaChange: (ficha: Ficha) => void;
  onVoltar: () => void;
  onStartCinematic: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ ficha, onFichaChange, onVoltar, onStartCinematic }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bolsaModalOpen, setBolsaModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [usarMeusDados, setUsarMeusDados] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [goldDiceModalOpen, setGoldDiceModalOpen] = useState(false);

  // Contador de rolagens para cada atributo (máximo 3 por atributo)
  const [rolagensDados, setRolagensDados] = useState({
    pericia: 0,
    forca: 0,
    sorte: 0
  });

  // Contador de limpezas (máximo 1 vez)
  const [limpezasRealizadas, setLimpezasRealizadas] = useState(0);
  const maxLimpezas = 1;

  // Sincroniza o estado local rolagensDados com os dados da ficha persistida
  useEffect(() => {
    // Só executa uma vez na inicialização do componente
    // Não interfere com rolagens normais em andamento
    
    // Se a ficha tem valores iniciais mas não tem moedas, há inconsistência
    const hasInitialValues = ficha.pericia.inicial && ficha.forca.inicial && ficha.sorte.inicial;
    const hasGold = ficha.bolsa.find(item => item.nome === 'Moedas de Ouro');
    
    // Só corrige se TODOS os atributos estão preenchidos mas NÃO há moedas
    // Isso indica uma inconsistência real, não uma rolagem em andamento
    if (hasInitialValues && !hasGold) {

      
      // Resetar atributos para forçar nova rolagem
      const fichaCorrigida = {
        ...ficha,
        pericia: { inicial: 0, atual: 0 },
        forca: { inicial: 0, atual: 0 },
        sorte: { inicial: 0, atual: 0 }
      };
      
      onFichaChange(fichaCorrigida);
      
      // Resetar contadores locais
      setRolagensDados({
        pericia: 0,
        forca: 0,
        sorte: 0
      });
    } else if (hasInitialValues && hasGold) {
      // Se tem valores E moedas, significa que os dados foram rolados
      // Vamos sincronizar o estado local
      setRolagensDados({
        pericia: 3, // Máximo atingido
        forca: 3,   // Máximo atingido
        sorte: 3    // Máximo atingido
      });
    }
  }, []); // Executa apenas uma vez na montagem do componente

  // Hooks
  const { changeTrack, tryStartMusic, autoplayBlocked, pause } = useAudio();
  const { notification, showNotification, hideNotification } = useNotification();
  const { validateForStart } = useCharacterValidation();
  const { rollWithDetails } = useDiceRoller();
  const { isLoading, loadFromFile, clearLocalStorage } = useFileOperations();
  const playBag = useBagSound(1);
  const playCoin = useCoinSound(1);
  const playDice = useDiceSound(1);
  const playClick = useClickSound(1);



  // Carrega a música específica da ficha quando o componente monta
  useEffect(() => {
    const loadMusic = async () => {
      try {
        await changeTrack(bgmFicha);

      } catch (error) {

      }
    };

    loadMusic();
  }, []); // Executa apenas uma vez quando monta

  // Tenta iniciar música na primeira interação
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (autoplayBlocked) {
        tryStartMusic();
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []); // Sem dependências para evitar loop

  const updateFicha = useCallback((updates: Partial<Ficha>) => {
    const newFicha = { ...ficha, ...updates };
    onFichaChange(newFicha);
  }, [ficha, onFichaChange]);

  const rolarPericia = useCallback((): { dice: number[]; total: number } => {
    playDice();
    const resultado = rollWithDetails('pericia');
    
    setRolagensDados(prev => {
      const newCount = prev.pericia + 1;

      return {
        ...prev,
        pericia: newCount
      };
    });
    
    return resultado; // retorna dados e total para o modal
  }, [rollWithDetails, playDice]);

  const rolarForca = useCallback((): { dice: number[]; total: number } => {
    playDice();
    const resultado = rollWithDetails('forca');

    setRolagensDados(prev => {
      const newCount = prev.forca + 1;

      return {
        ...prev,
        forca: newCount
      };
    });
    
    return resultado; // retorna dados e total para o modal
  }, [rollWithDetails, playDice]);

  const rolarSorte = useCallback((): { dice: number[]; total: number } => {
    playDice();
    const resultado = rollWithDetails('sorte');

    setRolagensDados(prev => {
      const newCount = prev.sorte + 1;

      return {
        ...prev,
        sorte: newCount
      };
    });
    
    return resultado; // retorna dados e total para o modal
  }, [rollWithDetails, playDice]);

  const handleAtributoChange = useCallback((attr: 'pericia' | 'forca' | 'sorte', valor: number) => {
    updateFicha({
      [attr]: { inicial: valor, atual: valor },
    });
  }, [updateFicha]);

  const handleGoldDiceComplete = useCallback((_dice: number[], total: number) => {
    // Adiciona as moedas de ouro à bolsa
    let novaFicha = ficha;
    novaFicha = adicionarItem(novaFicha, {
      nome: 'Moedas de Ouro',
      tipo: 'ouro',
      quantidade: total,
      descricao: 'Moedas de ouro iniciais do personagem',
      adquiridoEm: 'Criação do Personagem'
    });

    // Atualiza a ficha com as moedas na bolsa
    updateFicha(novaFicha);

    setGoldDiceModalOpen(false);
  }, [ficha, updateFicha, showNotification]);



  const resetar = () => {
    if (limpezasRealizadas >= maxLimpezas) {
      showNotification('Você já usou todas as suas 3 limpezas. Limite máximo atingido.', 'warning');
      return;
    }
    setConfirmOpen(true);
  };

  const comecarAventura = useCallback(() => {
    const validation = validateForStart(ficha);
    if (!validation.isValid) {
      showNotification(validation.message!, 'warning');
      return;
    }

    // Abrir modal de confirmação
    setConfirmStartOpen(true);
  }, [ficha, validateForStart, showNotification]);

  const handleStartAdventure = useCallback(async () => {
    try {
      console.log('🎬 [CharacterSheet] Iniciando aventura...');
      
      // Pausar música da ficha
      pause();
      
      // Pequeno delay para garantir que a música foi pausada
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Tocar som de grito
      try {
        const screamAudio = new Audio(screamWoman);
        screamAudio.volume = 0.7;
        await screamAudio.play();
      } catch (error) {
        console.warn('⚠️ [CharacterSheet] Erro ao tocar som de grito:', error);
      }

      // Delay para o som e depois navegar para cinematográfica
      setTimeout(() => {
        console.log('🎬 [CharacterSheet] Navegando para tela de introdução...');
        try {
          onStartCinematic();
          console.log('✅ [CharacterSheet] Navegação para introdução iniciada');
        } catch (error) {
          console.error('❌ [CharacterSheet] Erro ao navegar para introdução:', error);
          // Fallback: tentar novamente
          setTimeout(() => onStartCinematic(), 100);
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ [CharacterSheet] Erro ao iniciar aventura:', error);
      // Fallback: tentar navegar mesmo com erro
      setTimeout(() => onStartCinematic(), 100);
    }
  }, [pause, onStartCinematic]);

  const handleCancelStart = useCallback(() => {
    setConfirmStartOpen(false);
  }, []);




  // Memoized handlers for attribute cards
  const attributeCards = useMemo(() => [
    { title: 'PERÍCIA', attr: 'pericia' as const, onRoll: rolarPericia, rolagensFeitas: rolagensDados.pericia },
    { title: 'FORÇA', attr: 'forca' as const, onRoll: rolarForca, rolagensFeitas: rolagensDados.forca },
    { title: 'SORTE', attr: 'sorte' as const, onRoll: rolarSorte, rolagensFeitas: rolagensDados.sorte },
  ], [rolarPericia, rolarForca, rolarSorte, rolagensDados]);

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

  const getItemColor = useCallback((tipo: Item['tipo']) => {
    return ITEM_COLORS[tipo] || '#757575';
  }, []);

  // StyledInput declarado fora para manter foco entre renders

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
              onClick={() => {
                playBag();
                setBolsaModalOpen(true)
              }}
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
                        <Typography component="div" variant="body2" color="text.secondary">
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
                        </Typography>
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

  const handleConfirmReset = useCallback(() => {
    setConfirmOpen(false);

    // Incrementar contador de limpezas
    setLimpezasRealizadas(prev => prev + 1);

    // Resetar contadores de rolagens
    setRolagensDados({
      pericia: 0,
      forca: 0,
      sorte: 0
    });

    const result = clearLocalStorage();
    showNotification(result.message, result.severity);

    // Não redirecionar mais - apenas limpar a ficha localmente
    if (result.success) {
      // Criar uma ficha realmente vazia (sem moedas)
      const fichaVazia = createTrulyEmptyFicha();

      // Atualizar a ficha com dados vazios
      onFichaChange(fichaVazia);

      // Resetar também o checkbox de "usar meus dados"
      setUsarMeusDados(false);

      const limpezasRestantes = maxLimpezas - (limpezasRealizadas + 1);
      if (limpezasRestantes > 0) {
        showNotification(`Ficha resetada! Você pode limpar mais ${limpezasRestantes} vez.`, 'success');
      } else {
        showNotification('Ficha resetada! Esta foi sua única limpeza disponível.', 'warning');
      }
    }
  }, [clearLocalStorage, showNotification, onFichaChange, limpezasRealizadas, maxLimpezas]);

  const handleCancelReset = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await loadFromFile(file);
    showNotification(result.message, result.severity);

    if (result.success && result.data) {
      updateFicha(result.data);
    }

    // Reset input
    e.currentTarget.value = '';
  }, [loadFromFile, showNotification, updateFicha]);

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
        position: 'relative',
      }}
    >


      {/* Notificação */}
      <NotificationToast
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => {
          playClick();
          hideNotification();
        }}
      />

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
            <StyledInput
              type="text"
              value={ficha.nome}
              onChange={(e) => updateFicha({ nome: e.target.value })}
              placeholder="Digite o nome do personagem"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Checkbox Usar Meus Dados */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <CustomCheckbox
            checked={usarMeusDados}
            onChange={setUsarMeusDados}
            label="Usar meus dados (inserir valores manualmente)"
            id="usar-meus-dados"
          />
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        {attributeCards.map(({ title, attr, rolagensFeitas, onRoll }) => (
          <AttributeCard
            key={attr}
            title={title}
            attr={attr}
            ficha={ficha}
            usarMeusDados={usarMeusDados}
            onAtributoChange={handleAtributoChange}
            rolagensFeitas={rolagensFeitas}
            maxRolagens={3}
            onRoll={onRoll}
          />
        ))}
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
                onClick={() => {
                  playCoin();
                  playDice();
                  setGoldDiceModalOpen(true);
                }}
                startIcon={<CasinoIcon />}
                disabled={!!ficha.bolsa.find(item => item.nome === 'Moedas de Ouro') || isLoading}
                sx={{
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={16} /> : DICE_FORMULAS.ouro.text}
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
            component="label"
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={16} /> : <UploadIcon />}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Continuar Aventura'}
            <input
              type="file"
              accept="application/json,.json,.cavaleiro.json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                playClick();
                resetar()
              }}
              startIcon={<DeleteIcon />}
              disabled={limpezasRealizadas >= maxLimpezas}
              sx={{
                background: '#3b1212',
                borderColor: '#6b1c1c',
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                  background: '#2a0e0e'
                }
              }}
            >
              Limpar
            </Button>
            {limpezasRealizadas > 0 && (
              <Chip
                label={`${limpezasRealizadas}/${maxLimpezas}`}
                size="small"
                color={limpezasRealizadas >= maxLimpezas ? 'error' : 'default'}
                sx={{
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              playClick();
              onVoltar();
            }}
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
          onClick={() => {
            playClick();
            comecarAventura();
          }}
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
              background: 'linear-gradient(180deg, rgba(179,18,18,0.85))',
              boxShadow: '0 12px 36px rgba(179,18,18,0.85)',
              color: 'rgba(245, 111, 111, 0.85)'
            },
          }}
        >
          Começar
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => {
        playClick();
        handleCancelReset();
      }}>
        <DialogTitle>Apagar ficha?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Esta ação removerá sua ficha salva do dispositivo.
          </Typography>
          <Typography variant="body2" color="warning.main">
            Você pode apagar seus atributos apenas {maxLimpezas - limpezasRealizadas} vez. Deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { playClick(); handleCancelReset(); }}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => { playClick(); handleConfirmReset() }} startIcon={<DeleteIcon />}>
            Apagar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal da Bolsa */}
      <Dialog
        open={bolsaModalOpen}
        onClose={() => { playClick(); setBolsaModalOpen(false) }}
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
                onClick={() => { playClick(); setBolsaModalOpen(false) }}
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
          <Button onClick={() => { playClick(); setBolsaModalOpen(false) }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação para começar aventura */}
      <Dialog open={confirmStartOpen} onClose={() => { playClick(); handleCancelStart(); }} maxWidth="sm" fullWidth>
        <Card sx={{ background: "linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", border: "1px solid rgba(255,255,255,.1)", color: "#e8e6e3", bgcolor: "#0a0b0f" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" gutterBottom>Prepare-se!</Typography>
            <Typography variant="body1" sx={{ color: "#d6d4cf", mb: 2 }}>
              Está pronto para começar a aventura, <strong>{ficha.nome}</strong>?
            </Typography>
            <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
              <Button onClick={() => { playClick(); handleCancelStart() }} variant="outlined">
                Não, ainda não
              </Button>
              <Button
                onClick={() => { playClick(); handleStartAdventure() }}
                variant="contained"
                color="error"
                sx={{
                  background: 'linear-gradient(180deg, rgba(179,18,18,0.85), rgba(179,18,18,0.7))',
                  '&:hover': {
                    background: 'linear-gradient(180deg, rgba(201, 115, 115, 0.95), rgba(179,18,18,0.85))',
                  },
                }}
              >
                Sim, começar!
              </Button>
            </DialogActions>
          </CardContent>
        </Card>
      </Dialog>
      {/* Modal 3D para moedas de ouro */}
      <DiceRollModal3D
        open={goldDiceModalOpen}
        numDice={2}
        onComplete={handleGoldDiceComplete}
        bonus={12}
      />

      {/* Controles de música */}
      <AudioControls />


    </Box>
  );
};

export default CharacterSheet;