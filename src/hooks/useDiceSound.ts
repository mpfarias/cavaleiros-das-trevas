import { useCallback } from 'react';
import diceSound from '../assets/sounds/dice.mp3';

export const useDiceSound = (volume: number = 0.5) => {
  const playDice = useCallback(() => {
    const audio = new Audio(diceSound);
    audio.volume = volume;
    audio.play().catch(() => {
      // Silenciosamente ignora erros de reprodução
    });
  }, [volume]);

  return playDice;
};
