import { useCallback, useEffect, useState } from 'react';
import { useAudio } from './useAudio';

// Imports dos arquivos de áudio
import peopleSound from '../assets/sounds/people.mp3';
import bgmPiano from '../assets/sounds/bgm-piano.mp3';
import bgmFicha from '../assets/sounds/bgm-ficha.mp3';
import bgmModal from '../assets/sounds/bgm-modal.mp3';
import mapMusic from '../assets/sounds/nature-sound-map.mp3';
import bgmIntro from '../assets/sounds/bgm-intro.mp3';

// Definição dos grupos de áudio
export type AudioGroup = 
  | 'royal-lendle'    // people.mp3 - Cidade, mercado
  | 'bartolph-game'   // bgm-piano.mp3 - Jogo de dados
  | 'character-sheet' // bgm-ficha.mp3 - Preparação
  | 'home-intro'      // bgm-modal.mp3 - Menu, introdução
  | 'map'             // nature-sound-map.mp3 - Exploração
  | 'cinematic';      // bgm-intro.mp3, rainning.mp3 - Cinemática

// Mapeamento de grupos para arquivos de áudio
const AUDIO_GROUP_MAP: Record<AudioGroup, string> = {
  'royal-lendle': peopleSound,
  'bartolph-game': bgmPiano,
  'character-sheet': bgmFicha,
  'home-intro': bgmModal,
  'map': mapMusic,
  'cinematic': bgmIntro
};

// Mapeamento de telas para grupos
export const SCREEN_AUDIO_GROUPS: Record<number | string, AudioGroup> = {
  // Royal Lendle e área da cidade
  'royal': 'royal-lendle',      // Royal Lendle (rota /royal)
  30: 'royal-lendle',           // Mercado (rota /game/30)
  
  // Bartolph e jogo de dados
  86: 'bartolph-game',          // Bartolph (rota /game/86)
  54: 'bartolph-game',          // Ganhou (rota /game/54)
  43: 'bartolph-game',          // Perdeu (rota /game/43)
  
  // Character Sheet
  'sheet': 'character-sheet',   // Character Sheet (rota /sheet)
  
  // Home e introdução
  'home': 'home-intro',         // Home (rota /)
  'intro': 'home-intro',        // Intro Cinematic (rota /intro)
  
  // Map (independente)
  'map': 'map',                 // Map Screen (rota /map)
  
  // Screen 115 (Testar a Sorte)
  115: 'bartolph-game',         // Continua música do jogo de dados
  
  // Screen 222 (Bartolph descoberto como trapaceiro)
  222: 'bartolph-game',         // Continua música do jogo de dados
};

export const useAudioGroup = (screenId: number | string) => {
  const { changeTrack, tryStartMusic, isPlaying, togglePlay, currentTrack } = useAudio();
  const [currentGroup, setCurrentGroup] = useState<AudioGroup | null>(null);
  const [userPaused, setUserPaused] = useState(false);

  // Determina o grupo de áudio para a tela atual
  const getAudioGroup = useCallback((id: number | string): AudioGroup | null => {
    return SCREEN_AUDIO_GROUPS[id] || null;
  }, []);

  // Inicializa o áudio do grupo quando a tela carrega
  const initializeGroupAudio = useCallback(async (groupId: AudioGroup) => {
    try {
      const audioFile = AUDIO_GROUP_MAP[groupId];
      console.log(`🎵 [AudioGroup] Iniciando grupo: ${groupId} com ${audioFile}`);
      
      await changeTrack(audioFile);
      tryStartMusic();
      setCurrentGroup(groupId);
    } catch (error) {
      console.error(`🎵 [AudioGroup] Erro ao inicializar grupo ${groupId}:`, error);
    }
  }, [changeTrack, tryStartMusic]);

  // Verifica se deve continuar a música atual ou mudar
  const shouldContinueMusic = useCallback((groupId: AudioGroup): boolean => {
    // Se o usuário pausou manualmente, não deve reiniciar
    if (userPaused) return true;
    
    // Se não há música tocando, deve inicializar
    if (!currentTrack || !isPlaying) return false;
    
    // Se a música atual é do mesmo grupo, deve continuar
    const expectedAudio = AUDIO_GROUP_MAP[groupId];
    return currentTrack === expectedAudio;
  }, [currentTrack, isPlaying, userPaused]);

  // Efeito principal para gerenciar áudio do grupo
  useEffect(() => {
    const groupId = getAudioGroup(screenId);
    
    if (!groupId) {
      console.log(`🎵 [AudioGroup] Tela ${screenId} não tem grupo de áudio definido`);
      return;
    }

    // Se deve continuar a música atual
    if (shouldContinueMusic(groupId)) {
      console.log(`🎵 [AudioGroup] Tela ${screenId} continua música do grupo ${groupId}`);
      setCurrentGroup(groupId);
      return;
    }

    // Se deve mudar para novo grupo
    console.log(`🎵 [AudioGroup] Tela ${screenId} mudando para grupo ${groupId}`);
    initializeGroupAudio(groupId);
  }, [screenId, getAudioGroup, shouldContinueMusic, initializeGroupAudio]);

  // Função customizada que marca quando o usuário pausa manualmente
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Usuário está pausando
      setUserPaused(true);
      console.log('🎵 [AudioGroup] Usuário pausou manualmente, marcando como pausado pelo usuário');
    } else {
      // Usuário está tocando
      setUserPaused(false);
      console.log('🎵 [AudioGroup] Usuário tocou manualmente, removendo marca de pausado pelo usuário');
    }
    togglePlay();
  }, [isPlaying, togglePlay]);

  return {
    currentGroup,
    isPlaying,
    togglePlay: handleTogglePlay,
    currentTrack,
    // Função para forçar mudança de grupo (útil para transições)
    forceGroupChange: (groupId: AudioGroup) => {
      setUserPaused(false); // Reset da marca quando força mudança
      initializeGroupAudio(groupId);
    }
  };
};
