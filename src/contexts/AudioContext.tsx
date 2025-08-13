import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AudioContext, type AudioContextType } from './AudioContextDef';

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa o áudio quando o componente monta
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
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
    if (audioRef.current) {
      const handleCanPlay = () => {
        console.log('Áudio carregado e pronto para tocar');
        if (currentTrack) {
          setAutoplayBlocked(false);
        }
      };

      const handleError = () => {
        console.log('Erro ao carregar áudio');
        setAutoplayBlocked(true);
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [currentTrack]);

  // Função para tocar música
  const play = async (): Promise<void> => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false); // Reseta o autoplay bloqueado quando consegue tocar
        console.log('Música iniciada!');
      } catch (error) {
        console.log('Erro ao tocar música:', error);
        setAutoplayBlocked(true);
      }
    } else {
      console.log('Não há faixa atual ou elemento de áudio não disponível');
      setAutoplayBlocked(true);
    }
  };

  // Função para pausar música
  const pause = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Função para alternar play/pause
  const togglePlay = async (): Promise<void> => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  // Função para alternar mute
  const toggleMute = (): void => {
    setIsMuted(!isMuted);
  };

  // Função para ajustar volume
  const setVolume = (newVolume: number): void => {
    setVolumeState(newVolume);
    setIsMuted(false);
  };

  // Função para trocar de música
  const changeTrack = async (trackSrc: string): Promise<void> => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      
      // Pausa a música atual
      if (wasPlaying) {
        pause();
      }
      
      // Carrega nova música
      audioRef.current.src = trackSrc;
      setCurrentTrack(trackSrc);
      
      // Aguarda um pouco para o carregamento
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Tenta iniciar automaticamente se estava tocando antes
      if (wasPlaying) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch {
          setAutoplayBlocked(true);
        }
      }
    }
  };

  // Função para tentar iniciar música quando houver interação do usuário
  const tryStartMusic = async (): Promise<void> => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false); // Reseta o autoplay bloqueado
        console.log('Música iniciada após interação do usuário!');
      } catch (error) {
        console.log('Erro ao iniciar música:', error);
        setAutoplayBlocked(true);
      }
    }
  };

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
