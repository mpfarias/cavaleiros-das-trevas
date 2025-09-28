import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import { useDiceSound } from '../hooks/useDiceSound';
import VolumeControl from './ui/VolumeControl';
import DiceRollModal3D from './ui/DiceRollModal3D';
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

interface Screen301Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
  onAdjustSorte: (delta: number) => void;
}

const Screen301: React.FC<Screen301Props> = ({ onGoToScreen, ficha, onUpdateFicha, onAdjustSorte }) => {
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(301);
  const playClick = useClickSound(0.2);
  const playDiceSound = useDiceSound();
  
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [foguetesUsados, setFoguetesUsados] = useState(0);

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

  const handleTesteSorte = () => {
    playClick();
    setShowDiceModal(true);
  };

  const handleDiceRoll = (result: number) => {
    playDiceSound();
    
    // Aplicar modificador dos foguetes
    const resultadoFinal = result - foguetesUsados;
    
    // Subtrair pontos de sorte
    onAdjustSorte(-1);
    
    // Remover foguetes usados
    if (foguetesUsados > 0) {
      const fichaAtualizada = { ...ficha };
      let foguetesRemovidos = 0;
      
      fichaAtualizada.bolsa = fichaAtualizada.bolsa.filter(item => {
        if (item.nome.toLowerCase().includes('foguete') && foguetesRemovidos < foguetesUsados) {
          foguetesRemovidos++;
          return false;
        }
        return true;
      });
      
      onUpdateFicha(fichaAtualizada);
    }
    
    // Navegar baseado no resultado
    if (resultadoFinal <= ficha.sorte.atual) {
      onGoToScreen(145); // Sucesso
    } else {
      onGoToScreen(208); // Falha
    }
  };

  return (
    <Container data-screen="screen-301">
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
                <ChoiceButton onClick={handleTesteSorte}>
                  Testar a Sorte para passar despercebido
                </ChoiceButton>

                {/* Opção para usar foguetes se tiver */}
                {temFoguetes && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <Typography variant="body2" sx={{ color: '#3d2817', textAlign: 'center', fontFamily: '"Spectral", serif' }}>
                      Você tem {quantidadeFoguetes} foguete(s). Quantos deseja usar para distrair os guardas?
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {Array.from({ length: Math.min(quantidadeFoguetes, 3) }, (_, i) => i + 1).map(num => (
                        <ChoiceButton 
                          key={num}
                          onClick={() => {
                            playClick();
                            setFoguetesUsados(num);
                          }}
                          style={{ 
                            minWidth: '60px',
                            backgroundColor: foguetesUsados === num ? '#B31212' : 'rgba(139, 69, 19, 0.8)',
                          }}
                        >
                          {num}
                        </ChoiceButton>
                      ))}
                    </Box>
                    
                    {foguetesUsados > 0 && (
                      <Typography variant="body2" sx={{ color: '#4CAF50', textAlign: 'center', fontFamily: '"Spectral", serif' }}>
                        Usando {foguetesUsados} foguete(s) - Resultado do teste será reduzido em {foguetesUsados}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </CardWrap>

      {/* Modal de dados */}
      <DiceRollModal3D
        open={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        onRollComplete={handleDiceRoll}
        diceCount={2}
        title="Teste de Sorte"
        description={`Role 2d6. Se o resultado for menor ou igual a ${ficha.sorte.atual}${foguetesUsados > 0 ? ` (reduzido em ${foguetesUsados} pelos foguetes)` : ''}, você terá sucesso.`}
      />
    </Container>
  );
};

export default Screen301;