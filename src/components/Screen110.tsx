import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useDiceSound } from '../hooks/useDiceSound';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
import { GameAlert } from './ui/GameAlert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { Ficha } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
    radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  overflow: 'visible'
});

const CardWrap = styled(Card)({
  maxWidth: '900px',
  width: '100%',
  background: `
    linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
  `,
  border: '3px solid #8B4513',
  borderRadius: '16px',
  boxShadow: `
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 0 0 1px rgba(139,69,19,0.4)
  `,
  position: 'relative',
  animation: `${fadeIn} 1s ease-out`,
  overflow: 'visible'
});

const NarrativeText = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2vw, 18px)',
  lineHeight: 1.8,
  color: '#3d2817',
  textAlign: 'justify',
  marginBottom: '32px',
  textShadow: '0 1px 2px rgba(245,222,179,0.8)'
});

interface Screen110Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen110: React.FC<Screen110Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(110);
  const playClick = useClickSound(0.2);
  const playDice = useDiceSound();
  
  const [rolled, setRolled] = useState<[number, number] | null>(null);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showProvisionsAlert, setShowProvisionsAlert] = useState(false);
  const provisionsAddedRef = useRef(false);
  
  const total = useMemo(() => (rolled ? rolled[0] + rolled[1] : null), [rolled]);
  const periciaAtual = ficha.pericia.atual;
  const tevePericia = useMemo(() => (total != null ? total <= periciaAtual : null), [total, periciaAtual]);

  // Adicionar 2 Provisões quando a tela carrega (apenas uma vez)
  useEffect(() => {
    console.log('🍞 [Screen110] useEffect executado, provisionsAddedRef.current:', provisionsAddedRef.current);
    
    if (provisionsAddedRef.current) {
      console.log('🍞 [Screen110] Provisões já foram adicionadas, pulando...');
      return;
    }
    
    provisionsAddedRef.current = true;
    
    const fichaAtualizada = { ...ficha };
    const provisoesExistentes = fichaAtualizada.bolsa.find(item => item.tipo === 'provisao');
    
    console.log('🍞 [Screen110] Provisões existentes antes:', provisoesExistentes?.quantidade || 0);
    
    if (provisoesExistentes) {
      provisoesExistentes.quantidade = (provisoesExistentes.quantidade || 0) + 2;
      console.log('🍞 [Screen110] Provisões após adição:', provisoesExistentes.quantidade);
    } else {
      fichaAtualizada.bolsa.push({
        id: `provisao_${Date.now()}`,
        tipo: 'provisao',
        quantidade: 2,
        nome: 'Provisões'
      });
      console.log('🍞 [Screen110] Criadas novas Provisões: 2');
    }
    
    console.log('🍞 [Screen110] Chamando onUpdateFicha');
    onUpdateFicha(fichaAtualizada);
    
    // Mostrar alerta após um pequeno delay
    setTimeout(() => {
      setShowProvisionsAlert(true);
      setTimeout(() => setShowProvisionsAlert(false), 5000);
    }, 500);
  }, [ficha, onUpdateFicha]); // Dependências necessárias

  const handleDiceComplete = (dice: number[]) => {
    setRolled([dice[0], dice[1]]);
    // Não subtrai pontos de perícia (diferente do teste de sorte)
    setOpen(true);
    setDiceModalOpen(false);
  };

  const testarPericia = () => {
    playDice(); // Tocar som dos dados
    setDiceModalOpen(true);
  };

  return (
    <Container data-screen="screen-110">
      {/* Alerta de Provisões */}
      {showProvisionsAlert && (
        <GameAlert sx={{ top: '120px' }} $isVisible={showProvisionsAlert}>
          🍞 +2 Provisões adicionadas à bolsa!
        </GameAlert>
      )}
      
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={() => {
              playClick();
              togglePlay();
            }}
            disabled={!currentGroup}
            sx={{
              color: currentGroup ? (isPlaying ? '#B31212' : '#E0DFDB') : '#666',
              background: 'rgba(15,17,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              opacity: currentGroup ? 1 : 0.5,
              '&:hover': currentGroup ? {
                background: 'rgba(179,18,18,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
              } : {},
              '&:disabled': {
                cursor: 'not-allowed'
              }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            Alguns dos carrinhos são leves e se movem com facilidade, mas as bancas maiores são pesadas e exigem mais esforço. Seja qual for o método, o resultado é o mesmo: o caos.
            <br/><br/>
            Os guardas acabam presos no meio da confusão de legumes espalhados, enquanto os comerciantes, furiosos, gritam em seu dialeto característico.
            <br/><br/>
            Você sorri e aproveita para se servir de duas Provisões antes de deixar o local.
            <br/><br/>
            Na saída, porém, tropeça em algumas mangas espalhadas pelo chão.
            <br/><br/>
            Teste sua Perícia.
          </NarrativeText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <Button variant="contained" onClick={testarPericia} sx={{
              background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
              border: '1px solid #D2B48C',
              fontFamily: '"Cinzel", serif',
              fontWeight: 700
            }}>
              Testar a Perícia (2d6)
            </Button>
            <Typography variant="caption" sx={{ color: '#CBBBA0' }}>
              A PERÍCIA atual é {periciaAtual}. Você não perderá pontos ao testar.
            </Typography>
          </Box>

          <DiceRollModal3D
            open={diceModalOpen}
            numDice={2}
            onComplete={handleDiceComplete}
            bonus={0}
          />

          <Dialog open={open} onClose={undefined} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center' }}>
              {tevePericia ? 'Você passou no teste!' : 'Você falhou no teste!'}
            </DialogTitle>
            <DialogContent>
              <Typography align="center" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                Dados: {rolled ? `${rolled[0]} + ${rolled[1]} = ${total}` : ''}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => { 
                setOpen(false); 
                if (tevePericia) {
                  onGoToScreen(78); // Sucesso - tela 78
                } else {
                  onGoToScreen(199); // Falha - tela 199
                }
              }}>
                Ir
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen110;
