import { createContext } from 'react';

export interface AudioContextType {
  // Estado atual
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: string | null;
  autoplayBlocked: boolean;
  
  // Funções de controle
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  changeTrack: (trackSrc: string) => Promise<void>;
  tryStartMusic: () => Promise<void>;
}

export const AudioContext = createContext<AudioContextType | null>(null);
