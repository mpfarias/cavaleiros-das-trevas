import { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
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
  textShadow: '1px 1px 2px rgba(245,222,179,0.8)'
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

// Estilo para os alertas de perda
const LossAlert = styled(Box)<{ $isVisible: boolean }>(({ $isVisible }) => ({
  position: 'fixed',
  right: '16px',
  padding: '12px 16px',
  background: 'rgba(179,18,18,0.95)',
  color: '#FFFFFF',
  border: '2px solid #8B0000',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  zIndex: 1500,
  userSelect: 'none',
  opacity: $isVisible ? 1 : 0,
  transform: $isVisible ? 'translateX(0)' : 'translateX(100%)',
  transition: 'all 0.5s ease-in-out',
  animation: $isVisible ? 'slideInRight 0.5s ease-out' : 'none',
  '@keyframes slideInRight': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1
    }
  }
}));

interface Screen140Props {
  onGoToScreen: (id: number) => void;
  ficha: Ficha;
  onUpdateFicha: (ficha: Ficha) => void;
}

const Screen140: React.FC<Screen140Props> = ({ onGoToScreen, ficha, onUpdateFicha }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'bartolph-game'
  const { isPlaying, togglePlay, currentTrack } = useAudioGroup(140);
  
  // Estado para controlar os alertas de perda
  const [showForceAlert, setShowForceAlert] = useState(false);
  const [showMoneyAlert, setShowMoneyAlert] = useState(false);
  const [moedasPerdidas, setMoedasPerdidas] = useState(0);
  
  // Ref para garantir que as perdas sejam aplicadas apenas uma vez
  const perdasAplicadasRef = useRef(false);

  // Aplicar perdas automaticamente quando a tela carrega
  useEffect(() => {
    // Proteção para evitar aplicar perdas múltiplas vezes
    if (perdasAplicadasRef.current) {
      return;
    }

    // Proteção para verificar se a ficha existe e tem a estrutura correta
    if (!ficha || !ficha.forca || !ficha.forca.atual || !ficha.bolsa) {
      console.error('❌ [Screen140] Ficha inválida ou incompleta:', ficha);
      return;
    }

    const aplicarPerdas = () => {
      try {
        const fichaAtualizada = { ...ficha };
        
        console.log('🔍 [Screen140] Aplicando perdas para ficha:', fichaAtualizada);
        
        // 1. Perder 1 ponto de força (da força atual, não inicial)
        const forcaAnterior = fichaAtualizada.forca.atual;
        if (fichaAtualizada.forca.atual > 1) {
          fichaAtualizada.forca.atual -= 1;
        } else {
          fichaAtualizada.forca.atual = 1; // Mínimo de 1
        }
        console.log(`⚔️ [Screen140] Força alterada: ${forcaAnterior} → ${fichaAtualizada.forca.atual}`);
        
        // 2. Perder dinheiro (o que ganhou + o que apostou)
        const apostaAnterior = localStorage.getItem('cavaleiro:apostaBartolph');
        const valorApostado = apostaAnterior ? parseInt(apostaAnterior) : 0;
        
        // O jogador perde: as moedas que ganhou (valorApostado) + as moedas que eram dele (valorApostado)
        // Total: valorApostado * 2
        const moedasParaPerder = valorApostado * 2;
        
        // Armazenar no estado para mostrar no alert
        setMoedasPerdidas(moedasParaPerder);
        
        console.log(`💰 [Screen140] Aposta anterior: ${valorApostado}`);
        console.log(`💰 [Screen140] Moedas que ganhou: ${valorApostado}`);
        console.log(`💰 [Screen140] Moedas que eram dele: ${valorApostado}`);
        console.log(`💰 [Screen140] Total a perder: ${moedasParaPerder}`);
        
        // Remover moedas da bolsa
        const moedasOuro = fichaAtualizada.bolsa.find(item => item.tipo === 'ouro');
        if (moedasOuro && moedasOuro.quantidade) {
          const moedasAnteriores = moedasOuro.quantidade;
          const novaQuantidade = Math.max(0, moedasOuro.quantidade - moedasParaPerder);
          moedasOuro.quantidade = novaQuantidade;
          console.log(`🪙 [Screen140] Moedas alteradas: ${moedasAnteriores} → ${novaQuantidade}`);
        } else {
          console.log('⚠️ [Screen140] Nenhuma moeda encontrada na bolsa');
        }
        
        // Limpar o localStorage da aposta
        localStorage.removeItem('cavaleiro:apostaBartolph');
        console.log('🗑️ [Screen140] localStorage da aposta limpo');
        
        // Atualizar a ficha
        onUpdateFicha(fichaAtualizada);
        console.log('✅ [Screen140] Ficha atualizada com sucesso');
        
        // Marcar que as perdas foram aplicadas
        perdasAplicadasRef.current = true;
        
        // Mostrar alertas de perda com delay e ocultar após 5 segundos
        setTimeout(() => {
          setShowForceAlert(true);
          // Ocultar após 5 segundos
          setTimeout(() => setShowForceAlert(false), 5000);
        }, 500);
        
        // Verificar se veio da tela 43 para suprimir alert de moedas
        const veioDaTela43 = localStorage.getItem('cavaleiro:veioDaTela43') === 'true';
        
        if (!veioDaTela43) {
          // Só mostra alert de moedas se NÃO veio da tela 43
          setTimeout(() => {
            setShowMoneyAlert(true);
            // Ocultar após 5 segundos
            setTimeout(() => setShowMoneyAlert(false), 5000);
          }, 1500);
        } else {
          console.log('🔗 [Screen140] Jogador veio da tela 43 - alert de moedas suprimido');
          // Limpar a marca de origem
          localStorage.removeItem('cavaleiro:veioDaTela43');
        }
        
      } catch (error) {
        console.error('❌ [Screen140] Erro ao aplicar perdas:', error);
      }
    };

    aplicarPerdas();
  }, []); // Executar apenas uma vez quando a tela carrega

  return (
    <Container data-screen="screen-140">
      {/* Alertas de perda */}
      <LossAlert sx={{ top: '120px' }} $isVisible={showForceAlert}>
        ⚔️ -1 Ponto de Força perdido!
      </LossAlert>
      
      <LossAlert sx={{ top: '180px' }} $isVisible={showMoneyAlert}>
        💰 {moedasPerdidas > 0 ? `${moedasPerdidas} moedas perdidas!` : 'Moedas perdidas na aposta!'}
      </LossAlert>

      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'fixed', // Mudado de 'absolute' para 'fixed' para ficar sempre visível
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentTrack ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <IconButton
            onClick={togglePlay}
            disabled={!currentTrack}
            sx={{
              color: currentTrack ? (isPlaying ? '#B31212' : '#E0DFDB') : '#666',
              background: 'rgba(15,17,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              opacity: currentTrack ? 1 : 0.5,
              '&:hover': currentTrack ? {
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
            Bartolph se contorce de medo quando você aperta seu pulso com toda a força, mas logo tenta se mostrar furioso quando o acusa de trapaça. Você não tem certeza se a raiva dele é verdadeira, mas a encenação surte efeito.
            <br /><br />
            Um dos frequentadores da taverna se adianta:
            <br />
            — Perdeu, aceita! — diz ele, firme.
            <br />
            Outro completa, com tom ameaçador:
            <br />
            — Aqui não tem espaço pra quem não sabe perder.
            <br /><br />
            Antes que perceba, mãos fortes o agarram e, num piscar de olhos, você é arremessado para fora da taverna. Quando recupera os sentidos, está caído sobre as pedras da calçada, dolorido e com a poeira grudando na roupa.
            <br /><br />
            A raiva ferve dentro de você, e por um instante a ideia de sacar a espada e voltar lá para dentro parece tentadora... Mas, pensando bem, talvez seja melhor deixar para lá.
          </NarrativeText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => onGoToScreen(30)}>
              Ir embora
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>
    </Container>
  );
};

export default Screen140;
