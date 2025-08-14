import { useCallback } from 'react';
import { DICE_FORMULAS } from '../constants/character';

export const useDiceRoller = () => {
  const rollD6 = useCallback(() => Math.floor(Math.random() * 6) + 1, []);

  const rollAttribute = useCallback((attribute: keyof typeof DICE_FORMULAS) => {
    const formula = DICE_FORMULAS[attribute];
    let total = formula.bonus;

    if (formula.dice === '1d6') {
      total += rollD6();
    } else if (formula.dice === '2d6') {
      total += rollD6() + rollD6();
    }

    return total;
  }, [rollD6]);

  const rollWithDetails = useCallback((attribute: keyof typeof DICE_FORMULAS) => {
    const formula = DICE_FORMULAS[attribute];
    const dice: number[] = [];

    if (formula.dice === '1d6') {
      dice.push(rollD6());
    } else if (formula.dice === '2d6') {
      dice.push(rollD6(), rollD6());
    }

    const total = dice.reduce((sum, die) => sum + die, 0) + formula.bonus;

    return {
      dice,
      bonus: formula.bonus,
      total,
      formula: formula.text
    };
  }, [rollD6]);

  return {
    rollD6,
    rollAttribute,
    rollWithDetails
  };
};