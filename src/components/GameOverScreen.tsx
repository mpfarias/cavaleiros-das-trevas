import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useClickSound } from '../hooks/useClickSound';
import { useAudio } from '../hooks/useAudio';

// Animações para a tela de game over
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const textGlow = keyframes`
  0% { textShadow: 0 0 3px #333333, 0 0 6px #333333; }
  50% { textShadow: 0 0 6px #666666, 0 0 12px #666666; }
  100% { textShadow: 0 0 3px #333333, 0 0 6px #333333; }
`;

// Container principal da tela de game over
const GameOverContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,10,10,0.7) 25%, rgba(0,0,0,0.8) 50%, rgba(10,10,10,0.7) 75%, rgba(0,0,0,0.8) 100%),
    url('/src/assets/images/skull-game-over.png') center center / cover no-repeat,
    radial-gradient(circle at 50% 50%, rgba(20,20,20,0.4) 0%, transparent 70%)
  `,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  zIndex: 9999,
  animation: `${fadeIn} 2s ease-out`
});

// Título principal
const GameOverTitle = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: 'clamp(32px, 6vw, 64px)',
  fontWeight: 900,
  color: '#CCCCCC',
  textAlign: 'center',
  marginBottom: '32px',
  textShadow: '0 4px 8px rgba(0,0,0,0.9)',
  animation: `${textGlow} 3s ease-in-out infinite`,
  letterSpacing: '6px',
  textTransform: 'uppercase',
  opacity: 0.9
});

// Subtítulo
const GameOverSubtitle = styled(Typography)({
  fontFamily: '"Spectral", serif',
  fontSize: 'clamp(16px, 2.5vw, 20px)',
  color: '#999999',
  textAlign: 'center',
  marginBottom: '48px',
  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  maxWidth: '600px',
  lineHeight: 1.6,
  opacity: 0.8
});

// Container para caveira real (agora vazio pois a caveira é fundo)
const SkullContainer = styled(Box)({
  marginBottom: '32px',
  // Container vazio - caveira é imagem de fundo
});

// Botões de ação
const ActionButton = styled(Button)({
  padding: '16px 32px',
  margin: '8px',
  background: 'linear-gradient(135deg, rgba(40,40,40,0.9) 0%, rgba(60,60,60,0.8) 100%)',
  color: '#CCCCCC',
  border: '2px solid #333333',
  borderRadius: '12px',
  fontSize: '18px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 700,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  textShadow: '0 1px 2px rgba(0,0,0,0.9)',
  boxShadow: '0 8px 25px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
  '&:focus-visible': {
    outline: '2px solid #666666',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(60,60,60,0.9) 0%, rgba(40,40,40,0.8) 100%)',
    borderColor: '#666666',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)'
  }
});

// Botão de continuar aventura (carregar jogo)
const ContinueButton = styled(ActionButton)({
  background: 'linear-gradient(135deg, rgba(20,40,20,0.9) 0%, rgba(40,60,40,0.8) 100%)',
  borderColor: '#2a4a2a',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(40,60,40,0.9) 0%, rgba(20,40,20,0.8) 100%)',
    borderColor: '#4a6a4a'
  }
});

// Estatísticas da morte
const DeathStats = styled(Box)({
  background: 'rgba(20,20,20,0.4)',
  border: '2px solid rgba(60,60,60,0.6)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px',
  maxWidth: '500px',
  textAlign: 'center'
});

const StatText = styled(Typography)({
  fontFamily: '"Cinzel", serif',
  fontSize: '16px',
  color: '#888888',
  marginBottom: '8px',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
});

interface GameOverScreenProps {
  onRestart: () => void;
  onContinue: () => void;
  deathReason?: string;
  deathLocation?: string;
  characterStats?: {
    nome: string;
    pericia: { inicial: number; atual: number };
    forca: { inicial: number; atual: number };
    sorte: { inicial: number; atual: number };
  };
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  onRestart,
  onContinue,
  deathReason = 'Você foi derrotado em combate',
  deathLocation = 'Desconhecido',
  characterStats
}) => {
  const playClick = useClickSound(0.3);
  const [showStats, setShowStats] = useState(false);
  const { changeTrack, tryStartMusic, pause } = useAudio();
  const hasStartedMusic = useRef(false);

  // Tocar música de fundo assustadora
  useEffect(() => {
    console.log('🎵 [GameOverScreen] useEffect INICIADO!');
    
    // Evitar execução múltipla
    if (hasStartedMusic.current) {
      console.log('🎵 [GameOverScreen] Música já foi iniciada, pulando...');
      return;
    }
    
    hasStartedMusic.current = true;
    let isMounted = true;
    let audioElement: HTMLAudioElement | null = null;
    
    console.log('🎵 [GameOverScreen] Configurando música automática...');
    
    const playScaryMusic = async () => {
      if (!isMounted) {
        console.log('🎵 [GameOverScreen] Componente desmontado, parando...');
        return;
      }
      
      try {
        console.log('🎵 [GameOverScreen] Iniciando sequência de áudio...');
        
        // Forçar parada da música atual
        console.log('🎵 [GameOverScreen] Forçando parada da música atual...');
        pause();
        
        // Aguardar menos tempo para evitar desmontagem
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) {
          console.log('🎵 [GameOverScreen] Componente desmontado após pause, parando...');
          return;
        }
        
        console.log('🎵 [GameOverScreen] Criando áudio direto para bgm-scary.mp3...');
        
        try {
          // Criar áudio imediatamente
          audioElement = new Audio('/src/assets/sounds/bgm-scary.mp3');
          audioElement.volume = 0.7;
          audioElement.loop = true;
          
          // Tentar tocar imediatamente (pode falhar, mas é mais rápido)
          try {
            await audioElement.play();
            console.log('✅ [GameOverScreen] Música assustadora tocando imediatamente!');
          } catch (playError) {
            console.log('🎵 [GameOverScreen] Play imediato falhou, aguardando carregamento...');
            
            // Fallback: aguardar carregamento
            audioElement.addEventListener('canplaythrough', () => {
              if (!isMounted || !audioElement) {
                console.log('🎵 [GameOverScreen] Componente desmontado durante carregamento, parando...');
                return;
              }
              console.log('✅ [GameOverScreen] Áudio assustador carregado!');
              audioElement.play()
                .then(() => {
                  console.log('✅ [GameOverScreen] Música assustadora tocando!');
                })
                .catch((error) => {
                  console.error('❌ [GameOverScreen] Erro ao tocar áudio assustador:', error);
                });
            }, { once: true });
          }
          
          audioElement.addEventListener('error', (error) => {
            console.error('❌ [GameOverScreen] Erro no áudio assustador:', error);
          });
          
          console.log('🎵 [GameOverScreen] Áudio assustador criado!');
        } catch (trackError) {
          console.error('❌ [GameOverScreen] Erro ao criar áudio assustador:', trackError);
          throw trackError;
        }
        
        console.log('🎵 [GameOverScreen] Música assustadora configurada com sucesso!');
      } catch (error) {
        if (isMounted) {
          console.error('❌ [GameOverScreen] Erro ao tocar música:', error);
          console.error('❌ [GameOverScreen] Detalhes do erro:', String(error));
        }
      }
    };
    
    console.log('🎵 [GameOverScreen] Executando playScaryMusic...');
    playScaryMusic();
    
    // Cleanup para evitar vazamentos de memória
    return () => {
      console.log('🎵 [GameOverScreen] Cleanup do useEffect executado');
      isMounted = false;
      
      // Parar o áudio se existir
      if (audioElement) {
        try {
          audioElement.pause();
          audioElement.currentTime = 0;
          console.log('🎵 [GameOverScreen] Áudio parado no cleanup');
        } catch (error) {
          console.error('❌ [GameOverScreen] Erro ao parar áudio no cleanup:', error);
        }
      }
    };
  }, []); // Array vazio para executar apenas uma vez

  // Mostrar estatísticas após um delay
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Log único para evitar spam
  useEffect(() => {
    console.log('🎮 [GameOverScreen] Componente montado - ID único:', Math.random().toString(36).substr(2, 9));
  }, []);

  return (
    <GameOverContainer>
      {/* Container para caveira real */}
      <SkullContainer>
        {/* Caveira agora é imagem de fundo */}
      </SkullContainer>

      {/* Título principal */}
      <GameOverTitle>
        GAME OVER
      </GameOverTitle>

      {/* Subtítulo com motivo da morte */}
      <GameOverSubtitle>
        {deathReason}
        <br />
        <span style={{ fontSize: '0.8em', color: '#666666' }}>
          Local: {deathLocation}
        </span>
      </GameOverSubtitle>

      {/* Estatísticas do personagem (aparecem após delay) */}
      {showStats && characterStats && (
        <DeathStats>
          <Typography variant="h6" sx={{ 
            color: '#FF0000', 
            marginBottom: '16px',
            fontFamily: '"Cinzel", serif',
            fontWeight: 'bold'
          }}>
            Estatísticas Finais de {characterStats.nome}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <StatText>PERÍCIA</StatText>
              <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {characterStats.pericia.atual}/{characterStats.pericia.inicial}
              </Typography>
            </Box>
            <Box>
              <StatText>FORÇA</StatText>
              <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {characterStats.forca.atual}/{characterStats.forca.inicial}
              </Typography>
            </Box>
            <Box>
              <StatText>SORTE</StatText>
              <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {characterStats.sorte.atual}/{characterStats.sorte.inicial}
              </Typography>
            </Box>
          </Box>
        </DeathStats>
      )}

      {/* Botões de ação */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <ActionButton 
          onClick={() => {
            playClick();
            onRestart();
          }}
        >
          🔄 Reiniciar Aventura
        </ActionButton>
        
        <ContinueButton 
          onClick={() => {
            playClick();
            onContinue();
          }}
        >
          📁 Continuar Aventura
        </ContinueButton>
      </Box>

      {/* Mensagem de consolo */}
      <Typography variant="body2" sx={{ 
        color: '#FF8A8A',
        textAlign: 'center',
        marginTop: '32px',
        fontStyle: 'italic',
        fontSize: '14px',
        opacity: 0.8
      }}>
        "A morte não é o fim da aventura, mas o começo de uma nova jornada..."
      </Typography>
    </GameOverContainer>
  );
};

export default GameOverScreen;
