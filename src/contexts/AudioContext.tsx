import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AudioContext, type AudioContextType } from './AudioContextDef';

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa o áudio quando o componente monta
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    // Adicionar listener para garantir que o áudio está pronto
    const handleCanPlay = () => {
      // Áudio global inicializado e pronto
    };

    const handleError = (error: Event) => {
      console.error('❌ [AudioContext] Erro no áudio global:', error);
    };

    audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [volume]);

  // Detecta a primeira interação do usuário para liberar autoplay
  useEffect(() => {
    if (hasUserInteracted) return;

    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      setAutoplayBlocked(false);
      if (audioRef.current && currentTrack) {
        audioRef.current.play().catch((error) => {
          console.warn('⚠️ [AudioContext] Autoplay bloqueado:', error);
          setAutoplayBlocked(true);
        });
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasUserInteracted, currentTrack]);

  // Se o autoplay foi bloqueado, tenta novamente após a primeira interação
  useEffect(() => {
    if (!hasUserInteracted || !autoplayBlocked) return;

    const tryResume = async () => {
      if (!audioRef.current || !currentTrack) return;
      try {
        await audioRef.current.play();
        setAutoplayBlocked(false);
      } catch (error) {
        console.warn('⚠️ [AudioContext] Autoplay bloqueado:', error);
      }
    };

    tryResume();
  }, [hasUserInteracted, autoplayBlocked, currentTrack]);

  // Se já houve interação e a música foi trocada, tenta iniciar automaticamente
  useEffect(() => {
    if (!hasUserInteracted || !currentTrack) return;
    if (!audioRef.current) return;

    const tryPlay = async () => {
      try {
        await audioRef.current.play();
        setAutoplayBlocked(false);
      } catch (error) {
        console.warn('⚠️ [AudioContext] Autoplay bloqueado:', error);
        setAutoplayBlocked(true);
      }
    };

    tryPlay();
  }, [hasUserInteracted, currentTrack]);

  // Controla o volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Detecta quando o áudio é carregado
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const audio = audioRef.current;
      
      const handleCanPlay = async () => {
        setAutoplayBlocked(false);

        // Tenta iniciar automaticamente quando estiver pronto
        try {
          await audio.play();
        } catch (error) {
          console.warn('⚠️ [AudioContext] Autoplay bloqueado:', error);
          setAutoplayBlocked(true);
        }
      };

      const handleError = (error: Event) => {
        console.warn('❌ [AudioContext] Erro ao carregar áudio:', error);
        setAutoplayBlocked(true);
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handlePlay = () => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      // Remove listeners antigos antes de adicionar novos
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);

      // Adiciona novos listeners
      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [currentTrack]);

  // Função para tocar música
  const play = useCallback(async (): Promise<void> => {
    if (!audioRef.current || !currentTrack) {
      console.warn('⚠️ [AudioContext] Play chamado sem áudio disponível.');
      setAutoplayBlocked(true);
      setIsPlaying(false);
      return;
    }

    try {
      // Verifica se já está carregado
      if (audioRef.current.readyState >= 2) {
        await audioRef.current.play();
      } else {
        console.warn('⚠️ [AudioContext] Áudio ainda não carregado.');
        setAutoplayBlocked(true);
      }
    } catch (error) {
      console.warn('❌ [AudioContext] Erro ao iniciar reprodução:', error);
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Função para pausar música
  const pause = useCallback((): void => {

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  // Função para alternar play/pause
  const togglePlay = useCallback(async (): Promise<void> => {

    if (isPlaying) {

      pause();
    } else {

      await play();
    }
  }, [isPlaying, pause, play]);

  // Função para alternar mute
  const toggleMute = useCallback((): void => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Função para ajustar volume
  const setVolume = useCallback((newVolume: number): void => {
    setVolumeState(newVolume);
    setIsMuted(false);
  }, []);

  // Função para trocar de música
  const changeTrack = useCallback(async (trackSrc: string): Promise<void> => {
    if (!audioRef.current) {
      console.error('AudioRef não disponível');
      return;
    }

    // Evita recarregar a mesma música
    if (currentTrack === trackSrc) {
      return;
    }

    
    
    // Pausa música atual se estiver tocando
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    // Carrega nova música
    audioRef.current.src = trackSrc;
    setCurrentTrack(trackSrc);
    setIsPlaying(false);
    setAutoplayBlocked(false);
    
    
  }, [currentTrack]);

  // Função para tentar iniciar música quando houver interação do usuário
  const tryStartMusic = useCallback(async (): Promise<void> => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        
      } catch (error) {
        console.warn('⚠️ [AudioContext] Falha ao iniciar música:', error);
        setAutoplayBlocked(true);
      }
    }
  }, [currentTrack]);

  const value: AudioContextType = {
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    autoplayBlocked,
    play,
    pause,
    togglePlay,
    toggleMute,
    setVolume,
    changeTrack,
    tryStartMusic,
  };

  return (
    <AudioContext.Provider value={value}>
      {/* Áudio global */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio 
        ref={audioRef} 
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </AudioContext.Provider>
  );
};
