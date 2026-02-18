import { useEffect, useState, useRef, useCallback } from 'react';
import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useAudioGroup } from '../hooks/useAudioGroup';
import { useClickSound } from '../hooks/useClickSound';
import VolumeControl from './ui/VolumeControl';
import ImageModal from './ui/ImageModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { GameAlert } from './ui/GameAlert';
import { NOTIFICATION_CONFIG } from '../constants/character';
import type { Ficha, Item } from '../types';
import bartolphImg from '../assets/images/personagens/bartolph.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

const HoverImage = styled(Box)({
  position: 'fixed',
  zIndex: 1500,
  pointerEvents: 'none',
  animation: `${fadeInImage} 0.3s ease-out`,
  '& img': {
    maxWidth: '400px',
    maxHeight: '400px',
    borderRadius: '12px',
    border: '3px solid #8B4513',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backgroundColor: 'transparent'
  }
});

const LocationLink = styled('span')({
  color: '#8B4513',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#A0522D'
  }
});



interface Screen222Props {
  onGoToScreen: (screenId: number) => void;
  ficha: Ficha;
  onFichaChange: (ficha: Ficha) => void;
}

const Screen222: React.FC<Screen222Props> = ({ onGoToScreen, ficha, onFichaChange }) => {
  // Usa o sistema de grupos de áudio - automaticamente gerencia música do grupo 'bartolph-game'
  const { currentGroup, isPlaying, togglePlay } = useAudioGroup(222);
  const playClick = useClickSound(0.2);
  
  // Estado para controlar os alertas de recompensa
  const [showGoldAlert, setShowGoldAlert] = useState(false);
  const [showDiceAlert, setShowDiceAlert] = useState(false);
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Ref para garantir que as recompensas sejam aplicadas apenas uma vez
  const recompensasAplicadasRef = useRef(false);

  // Handlers para Bartolph
  const handleBartolphHover = useCallback((event: React.MouseEvent) => {
    setHoverImage({
      src: bartolphImg,
      x: event.clientX + 20,
      y: event.clientY - 20
    });
  }, []);

  const handleBartolphLeave = useCallback(() => {
    setHoverImage(null);
  }, []);

  const handleBartolphMove = useCallback((event: React.MouseEvent) => {
    setHoverImage(prev => prev ? {
      ...prev,
      x: event.clientX + 20,
      y: event.clientY - 20
    } : null);
  }, []);

  const handleBartolphClick = useCallback(() => {
    playClick();
    setShowImageModal(true);
  }, [playClick]);

  // Aplicar recompensas automaticamente quando a tela carrega
  useEffect(() => {
    // Proteção para evitar aplicar recompensas múltiplas vezes
    if (recompensasAplicadasRef.current) {

      return;
    }

    const aplicarRecompensas = () => {
      const fichaAtualizada = { ...ficha };
      
      // Adicionar 6 Moedas de Ouro à bolsa
      const moedasOuro = fichaAtualizada.bolsa.find(item => item.tipo === 'ouro');
      if (moedasOuro) {
        moedasOuro.quantidade = (moedasOuro.quantidade || 1) + 6;
      } else {
        fichaAtualizada.bolsa.push({
          id: 'moedas_ouro',
          nome: 'Moedas de Ouro',
          tipo: 'ouro',
          quantidade: 7, // 1 inicial + 6 ganhas
          descricao: 'Moedas de ouro para compras e apostas'
        });
      }
      
      // Adicionar Dado Viciado à bolsa
      const dadoViciado: Item = {
        id: 'dado_viciado',
        nome: 'Dado Viciado',
        descricao: 'Dado manipulado que sempre resulta em 1',
        tipo: 'equipamento',
        quantidade: 1,
        adquiridoEm: 'Screen 222 - Bartolph descoberto'
      };
      
      // Verificar se já existe na bolsa
      const equipamentoExistente = fichaAtualizada.bolsa.find(
        item => item.nome === 'Dado Viciado'
      );
      
      if (equipamentoExistente) {
        equipamentoExistente.quantidade = (equipamentoExistente.quantidade || 1) + 1;
      } else {
        fichaAtualizada.bolsa.push(dadoViciado);
      }
      
      // Atualizar a ficha
      onFichaChange(fichaAtualizada);
      
      // Marcar que as recompensas foram aplicadas
      recompensasAplicadasRef.current = true;
      

      
      // Mostrar alertas de recompensa com delay e ocultar após 5 segundos
      setTimeout(() => {
        setShowGoldAlert(true);
        // Ocultar após 5 segundos
        setTimeout(() => setShowGoldAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 500);
      
      setTimeout(() => {
        setShowDiceAlert(true);
        // Ocultar após 5 segundos
        setTimeout(() => setShowDiceAlert(false), NOTIFICATION_CONFIG.autoHideDuration);
      }, 1500);
    };

    aplicarRecompensas();
  }, []); // Executar apenas uma vez quando a tela carrega

  return (
    <Container data-screen="screen-222">
      {/* Controle de Volume */}
      <VolumeControl />
      {/* Alertas de recompensa */}
      <GameAlert sx={{ top: '120px' }} $isVisible={showGoldAlert}>
        🪙 +6 Moedas de Ouro adicionadas!
      </GameAlert>
      
      <GameAlert sx={{ top: '180px' }} $isVisible={showDiceAlert}>
        🎲 Dado Viciado coletado!
      </GameAlert>

      {/* Botão de controle de música */}
      <Box
        sx={{
          position: 'fixed', // Mudado de 'absolute' para 'fixed' para ficar sempre visível
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Tooltip title={currentGroup ? (isPlaying ? 'Pausar música' : 'Tocar música') : 'Nenhuma música carregada'}>
          <span><IconButton
            onClick={togglePlay}
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
          </IconButton></span>
        </Tooltip>
      </Box>

      <CardWrap>
        <CardContent sx={{ padding: '40px' }}>
          <NarrativeText>
            — O quê? Eu, trapacear? — <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink> tenta se defender, mesmo com o aperto firme que você aplica em seu pulso. Ele finge indignação, encenando tão bem que, por um instante, os curiosos ao redor quase acreditam.
            <br/><br/>
            Mas a farsa não dura. Você pega os dados e os joga sete vezes seguidas. Em todas as jogadas, o resultado é o mesmo: 1. O murmúrio da multidão cresce. Fica claro para todos que <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink> não passa de um trapaceiro barato, e não há quem suporte gente assim.
            <br/><br/>
            Alguns homens agarram <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink> pelos ombros e o arrastam em direção ao fundo da taverna, sob vaias e xingamentos. Antes que ele desapareça, você aproveita a confusão para revirar seus bolsos: recupera o ouro que havia perdido e encontra mais 6 Moedas de Ouro escondidas.
            <br/><br/>
            Satisfeito com o rumo dos acontecimentos, você sai da taverna sem dar ouvidos aos gemidos de <LocationLink
              onMouseEnter={handleBartolphHover}
              onMouseLeave={handleBartolphLeave}
              onMouseMove={handleBartolphMove}
              onClick={handleBartolphClick}
            >Bartolph</LocationLink>. Leva consigo o <b>dado viciado</b>, junto com as Moedas de Ouro.
          </NarrativeText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <ChoiceButton onClick={() => onGoToScreen(30)}>
              Ir embora
            </ChoiceButton>
          </Box>
        </CardContent>
      </CardWrap>

      {/* Hover Image */}
      {hoverImage && (
        <HoverImage
          sx={{
            left: hoverImage.x,
            top: hoverImage.y
          }}
        >
          <img src={hoverImage.src} alt="" />
        </HoverImage>
      )}

      {/* Image Modal */}
      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={bartolphImg}
        imageAlt="Bartolph"
      />
    </Container>
  );
};

export default Screen222;

