import { useCallback } from 'react';
import diceSound from '../assets/sounds/dice.mp3';

export const useDiceSound = (volume: number = 0.5) => {
  const playDice = useCallback(() => {
    console.log('🔊 [useDiceSound] Tocando som dos dados...');
    console.log('🔊 [useDiceSound] Arquivo de som:', diceSound);
    console.log('🔊 [useDiceSound] Volume:', volume);
    
    const audio = new Audio(diceSound);
    audio.volume = volume;
    
    // Adicionar event listeners para debug
    audio.addEventListener('loadstart', () => console.log('🔊 [useDiceSound] Carregando áudio...'));
    audio.addEventListener('canplay', () => console.log('🔊 [useDiceSound] Áudio pronto para tocar'));
    audio.addEventListener('play', () => console.log('🔊 [useDiceSound] Áudio começou a tocar'));
    audio.addEventListener('ended', () => console.log('🔊 [useDiceSound] Áudio terminou'));
    
    audio.play().catch((error) => {
      console.error('❌ [useDiceSound] Erro ao tocar som dos dados:', error);
    });
  }, [volume]);

  return playDice;
};