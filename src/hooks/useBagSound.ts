import { useCallback } from 'react';
import bagSound from '../assets/sounds/bag-opening.mp3';

export const useBagSound = (volume: number = 0.5) => {
  const playBagSound = useCallback(() => {
    const audio = new Audio(bagSound);
    audio.volume = volume;
    audio.play().catch(console.error);
  }, [volume]);

  return playBagSound;
};
