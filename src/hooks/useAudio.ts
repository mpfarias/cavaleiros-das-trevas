import { useContext } from 'react';
import { AudioContext } from '../contexts/AudioContextDef';

// Hook para usar o contexto de áudio
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === null) {
    throw new Error('useAudio deve ser usado dentro de um AudioProvider');
  }
  return context;
};
