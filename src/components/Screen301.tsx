import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
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

const ChoiceButton = styled('button')({
  padding: '16px 24px',
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '12px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  width: '100%',
  '&:focus-visible': {
    outline: '2px solid #FFD700',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 100%)',
    border: '3px solid #8B4513',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    minWidth: '400px',
    padding: '20px'
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: '"Cinzel", serif',
  fontSize: '24px',
  fontWeight: 700,
  color: '#4a2c00',
  textAlign: 'center',
  padding: '16px 24px'
});

const StyledDialogContent = styled(DialogContent)({
  fontFamily: '"Spectral", serif',
  fontSize: '18px',
  color: '#3d2817',
  textAlign: 'center',
  padding: '24px'
});

const StyledButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
  color: '#F5DEB3',
  border: '2px solid #D2B48C',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  padding: '10px 24px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    borderColor: '#FFD700',
    color: '#FFFFFF'
  }
});

interface Screen301Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onAdjustSorte: (delta: number) => void;
}

const Screen301: React.FC<Screen301Props> = ({ onGoToScreen, ficha, onUpdateFicha, onAdjustSorte }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(301);
  const playClick = useClickSound(0.2);
  
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [foguetesParaUsar, setFoguetesParaUsar] = useState<number | null>(null);
  const [inputFoguetes, setInputFoguetes] = useState<string>('');
  const [showFoguetesAlert, setShowFoguetesAlert] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [teveSorte, setTeveSorte] = useState(false);
  const [diceResult, setDiceResult] = useState<{ dice: number[], total: number } | null>(null);

  // Verificar se tem Documento de Perdão Cívico
  const temDocumentoPerdao = ficha.bolsa.some(item => 
    item.nome.toLowerCase().includes('documento') && 
    item.nome.toLowerCase().includes('perdão')
  );

  // Verificar se está escondido no carrinho de lixo (vem da tela 126)
  const estaNoCarrinhoLixo = localStorage.getItem('cavaleiro:noCarrinhoLixo') === 'true';

  // Verificar se tem Foguetes
  const temFoguetes = ficha.bolsa.some(item => 
    item.nome.toLowerCase().includes('foguete')
  );

  // Contar quantos foguetes tem
  const quantidadeFoguetes = ficha.bolsa.filter(item => 
    item.nome.toLowerCase().includes('foguete')
  ).length;

  const handleNaoUsarFoguetes = () => {
    playClick();
    setFoguetesParaUsar(0);
    setInputFoguetes('');
  };

  const handleInputChange = (valor: string) => {
    // Permitir apenas números
    if (valor === '' || /^\d+$/.test(valor)) {
      const num = valor === '' ? 0 : parseInt(valor, 10);
      
      // Validar limites
      if (num >= 1 && num <= quantidadeFoguetes) {
        setInputFoguetes(valor);
        setFoguetesParaUsar(num);
      } else if (valor === '') {
        setInputFoguetes('');
        setFoguetesParaUsar(null);
      }
    }
  };

  const handleTesteSorte = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (dice: number[], total: number) => {
    // Fechar modal de dados
    setShowDiceModal(false);
    
    // Salvar resultado dos dados
    setDiceResult({ dice, total });
    
    // Aplicar modificador dos foguetes (cada foguete reduz 1 ponto)
    const foguetesUsados = foguetesParaUsar || 0;
    const resultadoFinal = total - foguetesUsados;
    
    // Remover os foguetes usados da bolsa
    if (foguetesUsados > 0) {
      let removidos = 0;
      
      // Criar nova bolsa sem os foguetes usados
      const novaBolsa = ficha.bolsa.filter(item => {
        if (item.nome.toLowerCase().includes('foguete') && removidos < foguetesUsados) {
          removidos++;
          return false;
        }
        return true;
      });
      
      // Criar nova ficha com a bolsa atualizada
      const fichaAtualizada: Ficha = {
        ...ficha,
        bolsa: novaBolsa
      };
      
      onUpdateFicha(fichaAtualizada);
      
      // Mostrar alerta de foguetes usados
      setShowFoguetesAlert(true);
      setTimeout(() => setShowFoguetesAlert(false), 3000);
    }
    
    // Subtrair pontos de sorte
    onAdjustSorte(-1);
    
    // Verificar resultado
    const sucesso = resultadoFinal <= ficha.sorte.atual;
    setTeveSorte(sucesso);
    
    // Mostrar dialog de resultado
    setShowResultDialog(true);
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    
    // Navegar IMEDIATAMENTE - o localStorage já foi atualizado
    if (teveSorte) {
      onGoToScreen(145); // Sucesso
    } else {
      onGoToScreen(208); // Falha
    }
  };

  return (
    <Container data-screen="screen-301">
      {/* Alerta de foguetes usados */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showFoguetesAlert}>
        🎆 {foguetesParaUsar} foguete(s) usado(s) para distrair os guardas!
      </GameAlert>
      
      {/* Controle de Volume */}
      <VolumeControl />
      
      {/* Controle de Música */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <span>
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
          </span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            A Porta Leste de Royal Lendle se ergue diante de você.
            <br/><br/>
            É formada por duas enormes portas de aço reforçado. A muralha da qual faz parte é tão larga que abriga túneis e vigias em seu interior.
            <br/><br/>
            Para sua surpresa, Quinsberry e cinco de seus lacaios montam guarda, à espreita.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Opção condicional: Se tem Documento de Perdão Cívico OU está no carrinho de lixo */}
            {(temDocumentoPerdao || estaNoCarrinhoLixo) && (
              <ChoiceButton onClick={() => {
                playClick();
                // Limpar flag do carrinho de lixo se estava usando
                if (estaNoCarrinhoLixo) {
                  localStorage.removeItem('cavaleiro:noCarrinhoLixo');
                }
                onGoToScreen(145);
              }}>
                Seguir adiante
              </ChoiceButton>
            )}

            {/* Se não tem documento E não está no carrinho de lixo, precisa fazer teste de sorte */}
            {!temDocumentoPerdao && !estaNoCarrinhoLixo && (
              <>
                {/* Mostrar seletor de foguetes se tiver */}
                {temFoguetes && (
                  <Box sx={{ 
                    background: 'rgba(139,69,19,0.1)', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid rgba(139,69,19,0.3)'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: '#3d2817', 
                      textAlign: 'center', 
                      fontFamily: '"Spectral", serif', 
                      marginBottom: '16px',
                      fontWeight: 600 
                    }}>
                      Você possui {quantidadeFoguetes} foguete(s) de distração. Quantos deseja usar para distrair os guardas?
                      <br/>
                      <span style={{ fontSize: '14px', fontWeight: 400 }}>
                        (Cada foguete reduz 1 ponto do resultado do teste de sorte)
                      </span>
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: '12px', 
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginBottom: '12px' 
                    }}>
                      {/* Botão para não usar foguetes */}
                      <ChoiceButton 
                        onClick={handleNaoUsarFoguetes}
                        style={{ 
                          minWidth: '120px',
                          maxWidth: '140px',
                          padding: '12px 16px',
                          background: foguetesParaUsar === 0 
                            ? 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)' 
                            : 'linear-gradient(135deg, rgba(139,69,19,0.7) 0%, rgba(160,82,45,0.6) 100%)',
                          borderColor: foguetesParaUsar === 0 ? '#FFD700' : '#D2B48C'
                        }}
                      >
                        Não usar
                      </ChoiceButton>
                      
                      {/* Separador */}
                      <Typography sx={{ color: '#3d2817', fontFamily: '"Spectral", serif', fontWeight: 600 }}>
                        ou
                      </Typography>
                      
                      {/* Input para quantidade de foguetes */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography sx={{ color: '#3d2817', fontFamily: '"Spectral", serif', fontWeight: 600 }}>
                          Usar:
                        </Typography>
                        <input
                          type="number"
                          min="1"
                          max={quantidadeFoguetes}
                          value={inputFoguetes}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder="0"
                          style={{
                            width: '70px',
                            padding: '12px',
                            fontSize: '16px',
                            fontFamily: '"Spectral", serif',
                            fontWeight: 600,
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.8)',
                            border: '2px solid #8B4513',
                            borderRadius: '8px',
                            color: '#3d2817',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#B31212';
                            e.target.style.background = 'rgba(255,255,255,0.95)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#8B4513';
                            e.target.style.background = 'rgba(255,255,255,0.8)';
                          }}
                        />
                        <Typography sx={{ color: '#3d2817', fontFamily: '"Spectral", serif' }}>
                          (máx. {quantidadeFoguetes})
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Mostrar resumo da seleção */}
                    {foguetesParaUsar !== null && (
                      <Typography variant="body2" sx={{ 
                        color: foguetesParaUsar > 0 ? '#2e7d32' : '#3d2817', 
                        textAlign: 'center', 
                        fontFamily: '"Spectral", serif',
                        fontWeight: 600,
                        marginTop: '8px'
                      }}>
                        {foguetesParaUsar > 0 
                          ? `✓ Você vai usar ${foguetesParaUsar} foguete(s) - Redução de ${foguetesParaUsar} ponto(s) no teste`
                          : '✓ Você não vai usar foguetes - Teste sem redução'
                        }
                      </Typography>
                    )}
                  </Box>
                )}

                <ChoiceButton 
                  onClick={handleTesteSorte}
                  disabled={temFoguetes && foguetesParaUsar === null}
                  style={{
                    opacity: (temFoguetes && foguetesParaUsar === null) ? 0.5 : 1,
                    cursor: (temFoguetes && foguetesParaUsar === null) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {temFoguetes && foguetesParaUsar === null 
                    ? 'Escolha quantos foguetes usar primeiro'
                    : 'Testar a Sorte para passar despercebido'
                  }
                </ChoiceButton>
              </>
            )}
          </Box>
        </CardContent>
      </CardWrap>

      {/* Modal de dados */}
      <DiceRollModal3D
        open={showDiceModal}
        numDice={2}
        onComplete={handleDiceRoll}
        bonus={0}
      />

      {/* Dialog de resultado do teste de sorte */}
      <StyledDialog open={showResultDialog} onClose={undefined} maxWidth="xs">
        <StyledDialogTitle>
          {teveSorte ? 'Você teve sorte' : 'Você não teve sorte'}
        </StyledDialogTitle>
        <StyledDialogContent>
          {diceResult && (
            <>
              <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#3d2817', marginBottom: '8px' }}>
                Dados: {diceResult.dice.join(' + ')} = {diceResult.total}
              </Typography>
              {foguetesParaUsar && foguetesParaUsar > 0 && (
                <>
                  <Typography sx={{ fontSize: '16px', color: '#8B4513', marginTop: '8px' }}>
                    Foguetes usados: -{foguetesParaUsar}
                  </Typography>
                  <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32', marginTop: '8px' }}>
                    Resultado final: {diceResult.total - foguetesParaUsar}
                  </Typography>
                </>
              )}
            </>
          )}
        </StyledDialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingBottom: '24px' }}>
          <StyledButton onClick={handleCloseResultDialog}>
            Ir
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default Screen301;
