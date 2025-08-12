import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Casino as CasinoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import type { Ficha } from '../types';

interface CharacterSheetProps {
  ficha: Ficha;
  onFichaChange: (ficha: Ficha) => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ ficha, onFichaChange }) => {
  type Severity = 'success' | 'info' | 'warning' | 'error';
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<Severity>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const alterar = (attr: 'pericia' | 'forca' | 'sorte', delta: number) => {
    const obj = ficha[attr];
    const novoValor = Math.max(0, Math.min(obj.inicial, obj.atual + delta));
    updateFicha({
      [attr]: { ...obj, atual: novoValor },
    });
  };

  const setEncontro = (index: number, campo: 'pericia' | 'forca', valor: string) => {
    const novosEncontros = [...ficha.encontros];
    novosEncontros[index] = { ...novosEncontros[index], [campo]: valor.trim() };
    updateFicha({ encontros: novosEncontros });
  };

  const salvar = () => {
    localStorage.setItem('cavaleiro:ficha', JSON.stringify(ficha));
    setSnackbarMessage('Ficha salva com sucesso!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const carregar = () => {
    const data = localStorage.getItem('cavaleiro:ficha');
    if (!data) {
      setSnackbarMessage('Nenhum save encontrado.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const obj = JSON.parse(data);
      updateFicha(obj);
      setSnackbarMessage('Ficha carregada.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Erro ao carregar ficha.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
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
    setSnackbarMessage('A aventura começa! (Próximo passo: leitor de seções e motor de combate.)');
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
          <Button
            variant="outlined"
            size="small"
            onClick={() => alterar(attr, 1)}
            startIcon={<AddIcon />}
          >
            +1
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => alterar(attr, -1)}
            startIcon={<RemoveIcon />}
          >
            -1
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
        <StatCard
          title="PERÍCIA"
          attr="pericia"
          onRoll={rolarPericia}
          rollText="Rolar (1d6 + 6)"
        />
        <StatCard
          title="FORÇA"
          attr="forca"
          onRoll={rolarForca}
          rollText="Rolar (2d6 + 12)"
        />
        <StatCard
          title="SORTE"
          attr="sorte"
          onRoll={rolarSorte}
          rollText="Rolar (1d6 + 6)"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
              Armaduras
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={ficha.armaduras}
              onChange={(e) => updateFicha({ armaduras: e.target.value })}
              placeholder="Ex.: gibão de couro, escudo pequeno"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
              Provisões
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={ficha.provisoes}
              onChange={(e) => updateFicha({ provisoes: Number(e.target.value) || 0 })}
              placeholder="Quantidade"
              inputProps={{ min: 0, step: 1 }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
              Armas
            </Typography>
              <TextField
                fullWidth
                size="small"
                value={ficha.armas}
                onChange={(e) => updateFicha({ armas: e.target.value })}
                placeholder="Ex.: espada de aço"
              />
            </CardContent>
          </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
              Moedas de ouro
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={ficha.ouro}
              onChange={(e) => updateFicha({ ouro: Number(e.target.value) || 0 })}
              placeholder="0"
              inputProps={{ min: 0, step: 1 }}
            />
          </CardContent>
        </Card>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
                Equipamento
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={ficha.equip}
                onChange={(e) => updateFicha({ equip: e.target.value })}
                placeholder="Tocha, corda, chave enferrujada..."
              />
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
                Notas
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={ficha.notas}
                onChange={(e) => updateFicha({ notas: e.target.value })}
                placeholder="Pistas, mapas, NPCs, códigos..."
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" component="strong" sx={{ mb: 1, display: 'block' }}>
            Encontros com Monstros
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1, mb: 1 }}>
            {ficha.encontros.map((encontro, index) => (
              <Box
                key={index}
                sx={{
                  background: '#0e1013',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '10px',
                  minHeight: '72px',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Perícia =
                </Typography>
                <TextField
                  size="small"
                  value={encontro.pericia}
                  onChange={(e) => setEncontro(index, 'pericia', e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ mb: 1, width: '100%' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Força =
                </Typography>
                <TextField
                  size="small"
                  value={encontro.forca}
                  onChange={(e) => setEncontro(index, 'forca', e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ width: '100%' }}
                />
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Use para registrar PERÍCIA e FORÇA de inimigos que enfrentar.
          </Typography>
        </CardContent>
      </Card>

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
            variant="outlined"
            onClick={carregar}
            startIcon={<DownloadIcon />}
          >
            Carregar
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
                    Começar aventura
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
      </Box>
    );
};

export default CharacterSheet;