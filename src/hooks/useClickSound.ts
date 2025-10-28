import { useCallback } from 'react';
import clickSound from '../assets/sounds/click.mp3';

export const useClickSound = (volume: number = 0.5) => {
  const playClick = useCallback(() => {
    const audio = new Audio(clickSound);
    audio.volume = volume;
    audio.play().catch(console.error);
  }, [volume]);

  return playClick;
};
