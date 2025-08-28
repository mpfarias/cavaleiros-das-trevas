import { useCallback, useEffect, useState } from 'react';
import { useAudio } from './useAudio';

// Imports dos arquivos de áudio
import peopleSound from '../assets/sounds/people.mp3';
import bgmPiano from '../assets/sounds/bgm-piano.mp3';
import bgmFicha from '../assets/sounds/bgm-ficha.mp3';
import bgmModal from '../assets/sounds/bgm-modal.mp3';
import mapMusic from '../assets/sounds/nature-sound-map.mp3';
import bgmIntro from '../assets/sounds/bgm-intro.mp3';
import bgmTavern from '../assets/sounds/bgm-tavern-sound.mp3';
import bgmPrison from '../assets/sounds/bgm-taken-to-prison.mp3';
import bgmRunning from '../assets/sounds/bgm-running.mp3';

// Definição dos grupos de áudio
export type AudioGroup = 
  | 'royal-lendle'    // people.mp3 - Cidade, mercado
  | 'bartolph-game'   // bgm-piano.mp3 - Jogo de dados
  | 'tavern'          // bgm-tavern-sound.mp3 - Taverna, Royal Lendle
  | 'character-sheet' // bgm-ficha.mp3 - Preparação
  | 'home-intro'      // bgm-modal.mp3 - Menu, introdução
  | 'map'             // nature-sound-map.mp3 - Exploração
  | 'prison'          // bgm-taken-to-prison.mp3 - Prisão, masmorras
  | 'chase'           // bgm-running.mp3 - Perseguição, fuga
  | 'cinematic';      // bgm-intro.mp3, rainning.mp3 - Cinemática

// Mapeamento de grupos para arquivos de áudio
const AUDIO_GROUP_MAP: Record<AudioGroup, string> = {
  'royal-lendle': peopleSound,
  'bartolph-game': bgmPiano,
  'tavern': bgmTavern,
  'character-sheet': bgmFicha,
  'home-intro': bgmModal,
  'map': mapMusic,
  'prison': bgmPrison,
  'chase': bgmRunning,
  'cinematic': bgmIntro
};

// Mapeamento de telas para grupos
export const SCREEN_AUDIO_GROUPS: Record<number | string, AudioGroup> = {
  // Royal Lendle e área da cidade
  'royal': 'tavern',             // Royal Lendle (rota /royal) - bgm-tavern-sound.mp3
  30: 'royal-lendle',           // Mercado (rota /game/30) - people.mp3
  82: 'royal-lendle',           // Mercado Leste (rota /game/82) - people.mp3
  66: 'royal-lendle',           // Mercado Oeste (rota /game/66) - people.mp3
  321: 'royal-lendle',          // Confronto com guardas (rota /game/321) - people.mp3
  299: 'royal-lendle',          // Tentativa de suborno (rota /game/299) - people.mp3
  
  // Bartolph e jogo de dados - TODAS com som de taverna
  86: 'tavern',                  // Bartolph (rota /game/86) - bgm-tavern-sound.mp3
  94: 'tavern',                  // Apostas (rota /game/94) - bgm-tavern-sound.mp3
  54: 'tavern',                  // Ganhou (rota /game/54) - bgm-tavern-sound.mp3
  43: 'tavern',                  // Perdeu (rota /game/43) - bgm-tavern-sound.mp3
  140: 'tavern',                 // Falha no teste (rota /game/140) - bgm-tavern-sound.mp3
  151: 'tavern',                 // Nova chance (rota /game/151) - bgm-tavern-sound.mp3
  162: 'tavern',                 // Última chance (rota /game/162) - bgm-tavern-sound.mp3
  115: 'tavern',                 // Testar a Sorte (rota /game/115) - bgm-tavern-sound.mp3
  222: 'tavern',                 // Sucesso no teste (rota /game/222) - bgm-tavern-sound.mp3
  
  // Prisão e masmorras
  199: 'prison',                 // Prisão (rota /game/199) - bgm-taken-to-prison.mp3
  
  // Character Sheet
  'sheet': 'character-sheet',   // Character Sheet (rota /sheet)
  
  // Home e introdução
  'home': 'home-intro',         // Home (rota /)
  'intro': 'home-intro',        // Intro Cinematic (rota /intro)
  
  // Map (independente)
  'map': 'map',                 // Map Screen (rota /map)
  338: 'chase',                 // Chase (rota /game/338) - bgm-running.mp3
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
      console.log(`🎵 [AudioGroup] Inicializando áudio para grupo: ${groupId}`);
      
      const audioFile = AUDIO_GROUP_MAP[groupId];
      
      // Garantir que o áudio anterior seja parado antes de mudar
      // O changeTrack já faz isso automaticamente, mas vamos ser explícitos
      console.log(`🎵 [AudioGroup] Mudando para: ${audioFile}`);
      
      await changeTrack(audioFile);
      tryStartMusic();
      setCurrentGroup(groupId);
      
      console.log(`🎵 [AudioGroup] Áudio inicializado com sucesso para grupo: ${groupId}`);
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
      console.log('🎵 [AudioGroup] Nenhum grupo de áudio definido para:', screenId);
      return;
    }

    console.log(`🎵 [AudioGroup] Inicializando áudio para tela ${screenId} com grupo ${groupId}`);

    // Se deve continuar a música atual
    if (shouldContinueMusic(groupId)) {
      console.log(`🎵 [AudioGroup] Continuando música atual para grupo ${groupId}`);
      setCurrentGroup(groupId);
      return;
    }

    // Se deve mudar para novo grupo
    console.log(`🎵 [AudioGroup] Mudando para novo grupo: ${groupId}`);
    
    // Parar música atual antes de mudar (evita sobreposição)
    if (currentTrack && isPlaying) {
      console.log(`🎵 [AudioGroup] Parando música atual antes de mudar para ${groupId}`);
      // Usar a função pause do useAudio para parar corretamente
      // O changeTrack já faz isso automaticamente, mas vamos garantir
    }
    
    initializeGroupAudio(groupId);
    
    // Cleanup quando a tela for desmontada
    return () => {
      console.log(`🎵 [AudioGroup] Cleanup para tela ${screenId} com grupo ${groupId}`);
      // Não pausar aqui, deixar a próxima tela gerenciar o áudio
      // Isso evita que o áudio pare quando não deveria
    };
  }, [screenId, getAudioGroup, shouldContinueMusic, initializeGroupAudio, currentTrack, isPlaying]);

  // Função customizada que marca quando o usuário pausa manualmente
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Usuário está pausando
      setUserPaused(true);

    } else {
      // Usuário está tocando
      setUserPaused(false);

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
