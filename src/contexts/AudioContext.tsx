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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa o áudio quando o componente monta
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      
      // Adicionar listener para garantir que o áudio está pronto
      const handleCanPlay = () => {
        // Áudio global inicializado e pronto
      };
      
      const handleError = (error: Event) => {
        console.error('❌ [AudioContext] Erro no áudio global:', error);
      };
      
      audioRef.current.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [volume]);

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
          setAutoplayBlocked(true);
        }
      };

      const handleError = (_e: Event) => {
  
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

      setAutoplayBlocked(true);
      setIsPlaying(false);
      return;
    }

    try {
      // Verifica se já está carregado
      if (audioRef.current.readyState >= 2) {
        await audioRef.current.play();

      } else {

        setAutoplayBlocked(true);
      }
    } catch (error) {
      
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Função para pausar música
  const pause = useCallback((): void => {

    if (audioRef.current && !audioRef.current.paused) {

      audioRef.current.pause();

    } else {

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
