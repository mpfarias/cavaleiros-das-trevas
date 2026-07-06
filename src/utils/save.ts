import type { Ficha } from '../types';

const CHECKPOINT_KEY = 'cavaleiro:checkpoint';

/** Rotas em que não faz sentido retomar a aventura (fim de jogo, masmorras, etc.). */
const NON_RESUMABLE_PATHS = new Set([
  '/game/208',
  '/game/999',
  '/game/131',
  '/game/346',
  '/game/365',
]);

export interface GameCheckpoint {
  ficha: Ficha;
  lastScreen: string;
  savedAt: string;
}

function hasRequiredProgress(ficha: Ficha): boolean {
  if (!ficha.nome?.trim()) return false;
  if (!ficha.pericia?.inicial || !ficha.forca?.inicial || !ficha.sorte?.inicial) {
    return false;
  }
  return ficha.bolsa?.some(item => item.nome === 'Moedas de Ouro') ?? false;
}

export function isRestorableCheckpoint(checkpoint: GameCheckpoint): boolean {
  if (NON_RESUMABLE_PATHS.has(checkpoint.lastScreen)) {
    return false;
  }
  return hasRequiredProgress(checkpoint.ficha);
}

export function saveCheckpoint(ficha: Ficha, lastScreen: string): void {
  if (!ficha.nome || ficha.forca.atual <= 0) {
    return;
  }
  if (NON_RESUMABLE_PATHS.has(lastScreen)) {
    return;
  }
  if (!hasRequiredProgress(ficha)) {
    return;
  }

  try {
    const checkpoint: GameCheckpoint = {
      ficha,
      lastScreen,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
  } catch (error) {
    console.warn('Erro ao salvar checkpoint:', error);
  }
}

export function loadCheckpoint(): GameCheckpoint | null {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameCheckpoint;
  } catch (error) {
    console.warn('Erro ao carregar checkpoint:', error);
    return null;
  }
}

export function hasCheckpoint(): boolean {
  const checkpoint = loadCheckpoint();
  return checkpoint !== null && isRestorableCheckpoint(checkpoint);
}

export function clearCheckpoint(): void {
  try {
    localStorage.removeItem(CHECKPOINT_KEY);
  } catch (error) {
    console.warn('Erro ao limpar checkpoint:', error);
  }
}
