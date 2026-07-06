import type { Ficha, Item } from '../types';

export function getEquippedWeapon(ficha: Ficha): Item | undefined {
  return ficha.bolsa.find(item => item.tipo === 'arma');
}

export function hasEquippedWeapon(ficha: Ficha): boolean {
  return getEquippedWeapon(ficha) !== undefined;
}

/** Penalidade de PERÍCIA em combate sem arma equipada. */
export const UNARMED_PERICIA_PENALTY = 1;

export function getCombatPericia(ficha: Ficha): number {
  const base = ficha.pericia?.atual ?? 0;
  return hasEquippedWeapon(ficha) ? base : Math.max(0, base - UNARMED_PERICIA_PENALTY);
}

export function getWeaponAcquisitionNotice(item: Item, previousWeaponName?: string): string {
  const base = `⚔️ ${item.nome} equipada. Você só pode carregar uma arma por vez`;
  const discard = previousWeaponName
    ? ` — "${previousWeaponName}" foi abandonada e não pode ser recuperada.`
    : '.';
  return `${base}${discard}`;
}
