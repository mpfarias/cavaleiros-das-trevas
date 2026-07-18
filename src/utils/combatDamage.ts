import type { Ficha, Item } from '../types';
import { getEquippedWeapon } from './weapon';
import { hasArmorCombatProtection } from './armor';

/** Dano padrão Fighting Fantasy sem arma especial. */
export const DEFAULT_HIT_DAMAGE = 2;

/**
 * Extrai o valor de dano de uma damageCondition do tipo
 * "6 se sucesso em Sorte, 2 se falhar" / "0 se sucesso em Sorte, 2 se falhar".
 */
export function parseDamageCondition(
  condition: string | undefined,
  luckSuccess: boolean,
  fallback: number,
): number {
  if (!condition) return fallback;

  if (luckSuccess) {
    const match = condition.match(/(\d+)\s*se sucesso/i);
    if (match) return Number(match[1]);
  } else {
    const match = condition.match(/(\d+)\s*se falhar/i);
    if (match) return Number(match[1]);
  }

  return fallback;
}

/**
 * Dano que o jogador causa ao acertar.
 * - Sem efeito de combate na arma → 2 (padrão FF)
 * - Com `efeitos.combat.damage` → esse valor (ex.: Machado 4)
 * - Com teste de sorte → aplica damageCondition ou dobra/reduz (clássico 4/1)
 *
 * `damageType` indica o atributo alvo (FORÇA), NÃO soma o atributo ao dano.
 */
export function getPlayerHitDamage(ficha: Ficha, luckTestSuccess?: boolean): number {
  return getWeaponHitDamage(getEquippedWeapon(ficha), luckTestSuccess);
}

export function getWeaponHitDamage(weapon: Item | undefined, luckTestSuccess?: boolean): number {
  const base = weapon?.efeitos?.combat?.damage ?? DEFAULT_HIT_DAMAGE;

  if (luckTestSuccess === undefined) {
    return base;
  }

  const condition = weapon?.efeitos?.combat?.damageCondition;
  if (condition) {
    return parseDamageCondition(condition, luckTestSuccess, base);
  }

  // Clássico FF: sucesso dobra, falha reduz à metade (mín. 1)
  return luckTestSuccess ? base * 2 : Math.max(1, Math.floor(base / 2));
}

/**
 * Dano que o jogador deveria receber de um golpe, considerando armadura e sorte.
 * Armadura substitui o dano bruto pelo valor de proteção (ex.: cota = 1).
 * Sem armadura + sorte: sucesso = base−1 (mín. 1), falha = base+1.
 */
export function getDesiredIncomingDamage(
  ficha: Ficha,
  rawIncoming: number,
  options: { ignoreArmor?: boolean; luckTestSuccess?: boolean } = {},
): number {
  const { ignoreArmor, luckTestSuccess } = options;

  if (ignoreArmor) {
    if (luckTestSuccess === undefined) return rawIncoming;
    return luckTestSuccess ? Math.max(1, rawIncoming - 1) : rawIncoming + 1;
  }

  const armor = ficha.bolsa.find((item) => item.tipo === 'armadura');
  if (armor && hasArmorCombatProtection(armor)) {
    const armorBase = armor.efeitos!.combat!.damage!;
    if (luckTestSuccess === undefined) return armorBase;
    return parseDamageCondition(armor.efeitos!.combat!.damageCondition, luckTestSuccess, armorBase);
  }

  if (luckTestSuccess === undefined) return rawIncoming;
  return luckTestSuccess ? Math.max(1, rawIncoming - 1) : rawIncoming + 1;
}
