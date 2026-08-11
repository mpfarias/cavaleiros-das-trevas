import type { Ficha } from '../types';

/** Vitória sobre Cavaleiro das Trevas sem o ensinamento de Hammicus: o corpo desaparece. */
export const DARK_KNIGHT_VICTORY_SCREEN = 335;

/** Com o ensinamento de Hammicus (tela 76): é possível arrancar a máscara do Cavaleiro. */
export const DARK_KNIGHT_VICTORY_WITH_TEACHING_SCREEN = 223;

export const hasHammicusTeaching = (ficha?: Ficha | null): boolean =>
  Boolean(ficha?.flags?.hammicusTeachingReceived);

export const getDarkKnightVictoryScreen = (ficha?: Ficha | null): number =>
  hasHammicusTeaching(ficha)
    ? DARK_KNIGHT_VICTORY_WITH_TEACHING_SCREEN
    : DARK_KNIGHT_VICTORY_SCREEN;
