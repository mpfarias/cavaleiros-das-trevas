import { useMemo } from 'react';
import { getScreenTheme, type ScreenTheme } from '../constants/screenThemes';

/**
 * Hook para obter o tema visual de uma tela baseado no screenId
 * 
 * @param screenId - ID da tela (número ou string)
 * @returns Tema visual (ScreenTheme) correspondente à tela
 * 
 * @example
 * const theme = useScreenTheme(164); // Retorna TEMPLE_THEME
 * const theme = useScreenTheme(70);  // Retorna SEWERS_THEME
 */
export const useScreenTheme = (screenId: number | string): ScreenTheme => {
  return useMemo(() => getScreenTheme(screenId), [screenId]);
};
