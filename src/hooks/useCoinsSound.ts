import { useCallback } from 'react';
import coinSound from '../assets/sounds/coins.mp3';

export const useCoinSound = (volume: number = 0.5) => {
  const playCoin = useCallback(() => {
    const audio = new Audio(coinSound);
    audio.volume = volume;
    audio.play().catch(console.error);
  }, [volume]);

  return playCoin;
};
