import { useCallback } from 'react';
import damageScreamSound from '../assets/sounds/male-scream02.mp3';

export const playDamageScream = (volume: number = 0.6) => {
  const audio = new Audio(damageScreamSound);
  audio.volume = volume;
  audio.play().catch(() => {});
};

export const useDamageScreamSound = (volume: number = 0.6) => {
  const playDamageScreamSound = useCallback(() => {
    playDamageScream(volume);
  }, [volume]);

  return playDamageScreamSound;
};
