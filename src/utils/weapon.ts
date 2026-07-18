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

/** Modificador de ataque da arma (`efeitos.attributes.ataque`), ex.: Machado −1. */
export function getAttackModifier(ficha: Ficha): number {
  if (typeof ficha.modificadoresAtivos?.ataque === 'number' && ficha.modificadoresAtivos.ataque !== 0) {
    return ficha.modificadoresAtivos.ataque;
  }
  return getEquippedWeapon(ficha)?.efeitos?.attributes?.ataque ?? 0;
}

/** Poder de ataque = rolagem + perícia de combate + modificador de arma. */
export function getCombatAttackPower(roll: number, ficha: Ficha): number {
  return roll + getCombatPericia(ficha) + getAttackModifier(ficha);
}

export function getWeaponAcquisitionNotice(item: Item, previousWeaponName?: string): string {
  const base = `⚔️ ${item.nome} equipada. Você só pode carregar uma arma por vez`;
  const discard = previousWeaponName
    ? ` — "${previousWeaponName}" foi abandonada e não pode ser recuperada.`
    : '.';
  return `${base}${discard}`;
}
