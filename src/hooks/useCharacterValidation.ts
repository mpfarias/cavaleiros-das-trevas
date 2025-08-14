import { useCallback } from 'react';
import type { Ficha } from '../types';
import { VALIDATION_MESSAGES } from '../constants/character';

export const useCharacterValidation = () => {
  const validateForSave = useCallback((ficha: Ficha): { isValid: boolean; message?: string } => {
    if (!ficha.nome.trim()) {
      return { isValid: false, message: VALIDATION_MESSAGES.nameRequired };
    }
    return { isValid: true };
  }, []);

  const validateForStart = useCallback((ficha: Ficha): { isValid: boolean; message?: string } => {
    if (!ficha.nome.trim()) {
      return { isValid: false, message: VALIDATION_MESSAGES.nameRequiredStart };
    }
    
    if (!ficha.pericia.inicial || !ficha.forca.inicial || !ficha.sorte.inicial) {
      return { isValid: false, message: VALIDATION_MESSAGES.attributesRequired };
    }
    
    const moedasOuro = ficha.bolsa.find(item => item.nome === 'Moedas de Ouro');
    if (!moedasOuro) {
      return { isValid: false, message: VALIDATION_MESSAGES.goldRequired };
    }
    
    return { isValid: true };
  }, []);

  return {
    validateForSave,
    validateForStart
  };
};