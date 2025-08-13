import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
  Snackbar,
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
} from '@mui/material';
import {
  Casino as CasinoIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Inventory as InventoryIcon,
  Shield as ShieldIcon,
  LocalOffer as LocalOfferIcon,
  Restaurant as RestaurantIcon,
  Build as BuildIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { Ficha, Item } from '../types';
import { adicionarItem, exemplosItens, totalOuro } from '../utils/inventory';

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
    const valor = d6() + d6() + 12;
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

  const rolarMoedasOuro = () => {
    const valor = d6() + d6() + 12;
    
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
    
    setSnackbarMessage(`Moedas de ouro roladas: ${valor} moedas adicionadas à bolsa!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const adicionarItensExemplo = () => {
    let novaFicha = ficha;
    
    // Adiciona espada obrigatória à bolsa
    novaFicha = adicionarItem(novaFicha, {
      nome: 'Espada de Aço',
      tipo: 'arma',
      descricao: 'Espada básica de aço, arma padrão de todo cavaleiro',
      adquiridoEm: 'Criação do Personagem'
    });
    
    // Adiciona alguns itens de exemplo para demonstrar a funcionalidade
    novaFicha = adicionarItem(novaFicha, {
      ...exemplosItens.armaduras[0],
      adquiridoEm: 'Seção 1 - Início da Aventura'
    });
    
    novaFicha = adicionarItem(novaFicha, {
      ...exemplosItens.equipamentos[0],
      adquiridoEm: 'Seção 1 - Início da Aventura'
    });
    
    novaFicha = adicionarItem(novaFicha, {
      ...exemplosItens.ouro[0],
      adquiridoEm: 'Seção 1 - Início da Aventura'
    });
    
    novaFicha = adicionarItem(novaFicha, {
      ...exemplosItens.provisoes[0],
      adquiridoEm: 'Seção 1 - Início da Aventura'
    });

    updateFicha(novaFicha);
    setSnackbarMessage('Itens de exemplo adicionados à bolsa! (Incluindo Espada de Aço obrigatória)');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  const salvar = () => {
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(ficha));
    const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personagem.cavaleiro.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSnackbarMessage('Ficha salva e baixada como arquivo.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };



  const resetar = () => {
    setConfirmOpen(true);
  };

  const comecarAventura = () => {
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
    
    const espada = ficha.bolsa.find(item => item.nome === 'Espada de Aço');
    if (!espada) {
      setSnackbarMessage('Adicione itens de exemplo para obter a Espada de Aço obrigatória.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setSnackbarMessage('Aventura iniciada! (Próximo passo: leitor de seções e motor de combate.)');
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
  }) => (
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
        
        <Typography variant="caption" color="text.secondary">
          {attr === 'pericia' && 'Representa sua habilidade em combate.'}
          {attr === 'forca' && 'Resistência física e capacidade de sobreviver.'}
          {attr === 'sorte' && 'Quanto a fortuna costuma estar do seu lado.'}
        </Typography>
      </CardContent>
    </Card>
  );

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {ficha.bolsa.length} item(s) na bolsa
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBolsaModalOpen(true)}
              startIcon={<InventoryIcon />}
              fullWidth
            >
              Ver todos os itens
            </Button>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h2" sx={{ mb: 2 }}>
        Ficha do Personagem
      </Typography>

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
          Começar Aventura
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
    </Box>
  );
};

export default CharacterSheet;