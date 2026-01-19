import { useCallback } from 'react';
import bagSound from '../assets/sounds/bag-opening.mp3';

export const useBagSound = (volume: number = 0.5) => {
  const playBagSound = useCallback(() => {
    const audio = new Audio(bagSound);
    
    // Para volume > 1.0, usar Web Audio API para amplificar
    if (volume > 1.0) {
      try {
        const w = window as Window & { webkitAudioContext?: typeof AudioContext };
        const AudioCtx = window.AudioContext || w.webkitAudioContext;
        if (!AudioCtx) {
          audio.volume = 1.0;
        } else {
          const audioContext = new AudioCtx();
          const source = audioContext.createMediaElementSource(audio);
          const gainNode = audioContext.createGain();
          gainNode.gain.value = volume; // Amplificar além de 1.0
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
        }
      } catch (error) {
        // Fallback para volume padrão se Web Audio API falhar
        console.warn('⚠️ [useBagSound] Falha ao iniciar Web Audio:', error);
        audio.volume = 1.0;
      }
    } else {
      audio.volume = Math.min(1.0, Math.max(0, volume));
    }
    
    audio.play().catch(console.error);
  }, [volume]);

  return playBagSound;
};
