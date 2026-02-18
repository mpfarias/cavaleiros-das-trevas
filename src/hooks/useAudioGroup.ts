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
import bgmPrisonTaken from '../assets/sounds/bgm-taken-to-prison.mp3';
import bgmHiding from '../assets/sounds/bgm-hiding.mp3';
import bgmRunning from '../assets/sounds/bgm-running.mp3';
import bgmBattle from '../assets/sounds/bgm-battle.mp3';
import bgmCreepy from '../assets/sounds/bgm-creepy.mp3';
import bgmDramatic from '../assets/sounds/bgm-dramatic.mp3';
import bgmSewers from '../assets/sounds/bgm-sewers.mp3';
import bgmArabic from '../assets/sounds/bgm-arabic.mp3';
import bgmTemple from '../assets/sounds/bgm-temple.mp3';
import bgmTatoo from '../assets/sounds/bgm-tatoo.mp3';
import bgmWizardRoom from '../assets/sounds/bgm-wizard-room.mp3';
import bgmForest from '../assets/sounds/forest.mp3';

// Definição dos grupos de áudio
export type AudioGroup = 
  | 'royal-lendle'    // people.mp3 - Cidade, mercado
  | 'bartolph-game'   // bgm-piano.mp3 - Jogo de dados
  | 'tavern'          // bgm-tavern-sound.mp3 - Taverna, Royal Lendle
  | 'character-sheet' // bgm-ficha.mp3 - Preparação
  | 'home-intro'      // bgm-modal.mp3 - Menu, introdução
  | 'map'             // nature-sound-map.mp3 - Exploração
  | 'prison'          // bgm-taken-to-prison.mp3 - Prisão, masmorras
  | 'hiding'          // bgm-hiding.mp3 - Escondendo-se (tela 72)
  | 'chase'           // bgm-running.mp3 - Perseguição, fuga
  | 'battle'          // bgm-battle.mp3 - Combate
  | 'creepy'          // bgm-creepy.mp3 - Cavaleiros das Trevas, terror
  | 'dramatic'        // bgm-dramatic.mp3 - Momentos dramáticos, tensão
  | 'sewers'          // bgm-sewers.mp3 - Esgotos, Slygore
  | 'arabic'          // bgm-arabic.mp3 - Árabe/oriental
  | 'temple'          // bgm-temple.mp3 - Templo
  | 'tattoo'          // bgm-tatoo.mp3 - Loja de tatuagens
  | 'wizard-room'     // bgm-wizard-room.mp3 - Sala do mago
  | 'forest'          // forest.mp3 - Encontro na floresta
  | 'cinematic';      // bgm-intro.mp3, rainning.mp3 - Cinemática

// Mapeamento de grupos para arquivos de áudio
const AUDIO_GROUP_MAP: Record<AudioGroup, string> = {
  'royal-lendle': peopleSound,
  'bartolph-game': bgmPiano,
  'tavern': bgmTavern,
  'character-sheet': bgmFicha,
  'home-intro': bgmModal,
  'map': mapMusic,
  'prison': bgmPrisonTaken,
  'hiding': bgmHiding,
  'chase': bgmRunning,
  'battle': bgmBattle,
  'creepy': bgmCreepy,
  'dramatic': bgmDramatic,
  'sewers': bgmSewers,
  'arabic': bgmArabic,
  'temple': bgmTemple,
  'tattoo': bgmTatoo,
  'wizard-room': bgmWizardRoom,
  'forest': bgmForest,
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
  7: 'prison',                   // Escape da prisão (rota /game/7) - bgm-taken-to-prison.mp3
  26: 'battle',                  // Combate com carcereiro (rota /game/26) - bgm-battle.mp3
  38: 'prison',                  // Teste de sorte na prisão (rota /game/38) - bgm-taken-to-prison.mp3
  74: 'chase',                   // Sucesso no teste de sorte - fuga (rota /game/74) - bgm-running.mp3
  123: 'prison',                 // Falha no teste de sorte (rota /game/123) - bgm-taken-to-prison.mp3
  
  // Character Sheet
  'sheet': 'character-sheet',   // Character Sheet (rota /sheet)
  
  // Home e introdução
  'home': 'home-intro',         // Home (rota /)
  'intro': 'home-intro',        // Intro Cinematic (rota /intro)
  
  // Map (independente)
  'map': 'map',                 // Map Screen (rota /map)
  338: 'chase',                 // Chase (rota /game/338) - bgm-running.mp3
  384: 'chase',                 // Chase continuation (rota /game/384) - bgm-running.mp3
  78: 'chase',                  // Continuar fugindo (rota /game/78) - bgm-running.mp3
  22: 'chase',                  // Continuar pela rua - loja de tatuagens (rota /game/22) - bgm-running.mp3
  211: 'chase',                 // Pegar esfera metálica (rota /game/211) - bgm-running.mp3
  110: 'chase',                 // Derrubar barracas (rota /game/110) - bgm-running.mp3
  60: 'chase',                  // Carrinho de lixo (rota /game/60) - bgm-running.mp3
  126: 'chase',                 // Entrar no carro de lixo (rota /game/126) - bgm-running.mp3
  134: 'chase',                 // Rua estreita à esquerda (rota /game/134) - bgm-running.mp3
  208: 'prison',                // Aguardar carroça das masmorras (rota /game/208) - bgm-taken-to-prison.mp3
  233: 'prison',                // Aceitar negócio com Quinsberry (rota /game/233) - bgm-taken-to-prison.mp3
  272: 'battle',                // Batalha com Homem-Orc (rota /game/272) - bgm-battle.mp3
  4: 'dramatic',                // Ferida mágica do Homem-Orc (rota /game/4) - bgm-dramatic.mp3
  40: 'dramatic',               // Vitória contra Homem-Orc - Chave Preta (rota /game/40) - bgm-dramatic.mp3
  8: 'battle',                  // Batalha com Primeiro Cavaleiro das Trevas (rota /game/8) - bgm-battle.mp3
  259: 'battle',                // Batalha com Terceiro Cavaleiro das Trevas (rota /game/259) - bgm-battle.mp3
  394: 'battle',                // Batalha com Segundo Cavaleiro das Trevas (rota /game/394) - bgm-battle.mp3
  183: 'battle',                // Batalha com Quarto Cavaleiro das Trevas (rota /game/183) - bgm-battle.mp3
  245: 'battle',                // Batalha com Quinto Cavaleiro das Trevas (rota /game/245) - bgm-battle.mp3
  301: 'royal-lendle',          // Porta Leste (rota /game/301) - people.mp3
  18: 'arabic',                 // Saída dos esgotos - rua/praça (rota /game/18) - bgm-arabic.mp3
  225: 'arabic',                // Praça Masonic (rota /game/225) - bgm-arabic.mp3
  389: 'arabic',                // Fuga bem-sucedida após confusão (rota /game/389) - bgm-arabic.mp3
  57: 'arabic',                 // Multidão na Praça Masonic (rota /game/57) - bgm-arabic.mp3
  118: 'royal-lendle',          // Pátio dos Oradores (rota /game/118) - people.mp3
  137: 'royal-lendle',          // Orador em preto - Pátio dos Oradores (rota /game/137) - people.mp3
  164: 'temple',                // Templo dos Geomagos (rota /game/164) - bgm-temple.mp3
  264: 'temple',                // Escolha correta da Lua (rota /game/264) - bgm-temple.mp3
  254: 'temple',                // Desafio da Terra-Mãe (rota /game/254) - bgm-temple.mp3
  100: 'chase',                 // Salto na cerca - teste de perícia (rota /game/100) - bgm-running.mp3
  292: 'chase',                 // Telhado - guarda ofegante (rota /game/292) - bgm-running.mp3
  392: 'chase',                 // Luta com guarda no telhado (rota /game/392) - bgm-running.mp3
  328: 'chase',                 // Cozinha - fuga pela porta dos fundos (rota /game/328) - bgm-running.mp3
  351: 'chase',                 // Rua estreita à esquerda (rota /game/351) - bgm-running.mp3
  145: 'creepy',                // Cavaleiros das Trevas (rota /game/145) - bgm-creepy.mp3
  190: 'creepy',                // Enfrentar Cavaleiros das Trevas (rota /game/190) - bgm-creepy.mp3
  28: 'creepy',                 // Fugir dos Cavaleiros das Trevas (rota /game/28) - bgm-creepy.mp3
  306: 'creepy',                // Fingir-se de morto (rota /game/306) - bgm-creepy.mp3
  279: 'creepy',                // Sucesso ao fingir-se de morto (rota /game/279) - bgm-creepy.mp3
  102: 'map',                   // Saída sul do estreito - reflexão (rota /game/102) - nature-sound-map.mp3
  113: 'map',                   // Ponte/Poço do Feiticeiro (rota /game/113) - herdado de 102
  11: 'forest',                 // João Verdesfolhas (rota /game/11) - forest.mp3
  335: 'creepy',                // Vitória sobre Cavaleiro das Trevas (rota /game/335) - bgm-creepy.mp3
  72: 'hiding',                 // Perseguição reiniciada pelos Cavaleiros (rota /game/72) - bgm-hiding.mp3
  166: 'chase',                 // Casa da velhinha - Fuga dos guardas (rota /game/166) - bgm-running.mp3
  277: 'chase',                 // Casa da velhinha - Fuga dos guardas com sorte (rota /game/277) - bgm-running.mp3
  360: 'chase',                 // Fuga dos guardas pela rua (rota /game/360) - bgm-running.mp3
  216: 'chase',                 // Beco - escolha entre jardim do templo ou viela (rota /game/216) - bgm-running.mp3
  196: 'chase',                 // Viela - portão fechado (rota /game/196) - bgm-running.mp3
  52: 'chase',                  // Teste de perícia no portão (rota /game/52) - herdado de 196
  20: 'chase',                  // Guardas na viela (rota /game/20) - herdado de 196
  243: 'chase',                 // Revistar corpo Bartolph - Fuga dos guardas (rota /game/243) - bgm-running.mp3
  262: 'chase',                 // Beco sem saída - Guarda solitário (rota /game/262) - bgm-running.mp3
  375: 'sewers',                // Esgotos - Encontro com Slygore (rota /game/375) - bgm-sewers.mp3
  356: 'sewers',                // Teste de sorte - Fuga do Slygore (rota /game/356) - bgm-sewers.mp3
  154: 'sewers',                // Slygore cospe - teste de Perícia (rota /game/154) - bgm-sewers.mp3
  70: 'battle',                 // Slygore - áudio de batalha (rota /game/70) - bgm-battle.mp3
  2: 'hiding',                  // Salto na ravina (rota /game/2) - usa o mesmo da tela 72
  24: 'hiding',                 // Alcançar o trilho após salto (rota /game/24) - bgm-hiding.mp3
  317: 'battle',                // Após usar foguete contra Slygore (rota /game/317) - bgm-battle.mp3
  170: 'battle',                // Após usar candeia contra Slygore (rota /game/170) - bgm-battle.mp3
  180: 'battle',                // Escolha: subir ou lutar (rota /game/180) - bgm-battle.mp3
  33: 'tattoo',                 // Loja de tatuagens - Rogmondo (rota /game/33) - bgm-tatoo.mp3
  143: 'tattoo',                // Rogmondo - guardas invadem (rota /game/143) - bgm-tatoo.mp3
  105: 'wizard-room',           // Santuário de Hegmar (rota /game/105) - bgm-wizard-room.mp3
  147: 'wizard-room',           // Documento na escrivaninha - Hegmar (rota /game/147) - bgm-wizard-room.mp3
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
      
      // Garantir que o áudio anterior seja parado antes de mudar
      // O changeTrack já faz isso automaticamente, mas vamos ser explícitos
      
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
      return;
    }

    // Se deve continuar a música atual
    if (shouldContinueMusic(groupId)) {
      setCurrentGroup(groupId);
      return;
    }

    // Se deve mudar para novo grupo
    
    // Parar música atual antes de mudar (evita sobreposição)
    if (currentTrack && isPlaying) {
      // Usar a função pause do useAudio para parar corretamente
      // O changeTrack já faz isso automaticamente, mas vamos garantir
    }
    
    initializeGroupAudio(groupId);
    
    // Cleanup quando a tela for desmontada
    return () => {
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
