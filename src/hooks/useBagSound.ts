import { useCallback } from 'react';
import bagSound from '../assets/sounds/bag-opening.mp3';

export const useBagSound = (volume: number = 0.5) => {
  const playBagSound = useCallback(() => {
    const audio = new Audio(bagSound);
    
    // Para volume > 1.0, usar Web Audio API para amplificar
    if (volume > 1.0) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume; // Amplificar além de 1.0
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      } catch (error) {
        // Fallback para volume padrão se Web Audio API falhar
        audio.volume = 1.0;
      }
    } else {
      audio.volume = Math.min(1.0, Math.max(0, volume));
    }
    
    audio.play().catch(console.error);
  }, [volume]);

  return playBagSound;
};
