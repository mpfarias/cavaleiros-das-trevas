import { useCallback } from 'react';
import type { Ficha, Item } from '../types';
import { getArmorMaxDurability, hasArmorCombatProtection } from '../utils/armor';
import { getWeaponHitDamage, parseDamageCondition } from '../utils/combatDamage';

export interface ApplyArmorDamageResult {
  ficha: Ficha;
  armorBroken?: string;
}

export const useCombat = () => {
  /**
   * Dano de arma ao acertar.
   * `damageType` = atributo alvo (FORÇA/SORTE), não bônus somado ao dano.
   */
  const calculateWeaponDamage = useCallback((weapon: Item, _ficha: Ficha, luckTestSuccess?: boolean) => {
    return getWeaponHitDamage(weapon, luckTestSuccess);
  }, []);

  // Aplica dano a um atributo considerando proteção da armadura
  const applyDamageWithArmor = useCallback((
    ficha: Ficha,
    damage: number,
    damageType: 'forca' | 'sorte',
    luckTestSuccess?: boolean
  ): ApplyArmorDamageResult => {
    const armorIndex = ficha.bolsa.findIndex(item => item.tipo === 'armadura');
    let finalDamage = damage;
    let bolsa = ficha.bolsa;
    let armorBroken: string | undefined;

    if (armorIndex !== -1) {
      const armor = ficha.bolsa[armorIndex];

      if (hasArmorCombatProtection(armor)) {
        const armorBase = armor.efeitos!.combat!.damage!;
        finalDamage = luckTestSuccess === undefined
          ? armorBase
          : parseDamageCondition(armor.efeitos?.combat?.damageCondition, luckTestSuccess, armorBase);

        const maxDurability = getArmorMaxDurability(armor);
        if (maxDurability !== undefined) {
          const currentDurability = armor.durabilidadeAtual ?? maxDurability;
          const nextDurability = Math.max(0, currentDurability - 1);

          if (nextDurability === 0) {
            bolsa = bolsa.filter((_, index) => index !== armorIndex);
            armorBroken = armor.nome;
          } else {
            bolsa = bolsa.map((item, index) => (
              index === armorIndex ? { ...item, durabilidadeAtual: nextDurability } : item
            ));
          }
        }
      }
    }

    const newFicha: Ficha = {
      ...ficha,
      bolsa,
      forca: { ...ficha.forca },
      sorte: { ...ficha.sorte },
    };

    if (damageType === 'forca') {
      newFicha.forca.atual = Math.max(0, newFicha.forca.atual - finalDamage);
    } else if (damageType === 'sorte') {
      newFicha.sorte.atual = Math.max(0, newFicha.sorte.atual - finalDamage);
    }

    return { ficha: newFicha, armorBroken };
  }, []);

  // Executa um ataque com uma arma
  const executeAttack = useCallback((ficha: Ficha, weapon: Item, _target: 'enemy', luckTestSuccess?: boolean) => {
    const damage = calculateWeaponDamage(weapon, ficha, luckTestSuccess);
    
    return {
      damage,
      weaponName: weapon.nome,
      damageType: weapon.efeitos?.combat?.damageType || 'forca'
    };
  }, [calculateWeaponDamage]);

  // Executa uma defesa (receber dano)
  const executeDefense = useCallback((ficha: Ficha, incomingDamage: number, damageType: 'forca' | 'sorte', luckTestSuccess?: boolean) => {
    const { ficha: newFicha } = applyDamageWithArmor(ficha, incomingDamage, damageType, luckTestSuccess);
    
    return {
      ficha: newFicha,
      damageReceived: incomingDamage,
      finalDamage: newFicha[damageType].atual < ficha[damageType].atual ? 
        ficha[damageType].atual - newFicha[damageType].atual : 0
    };
  }, [applyDamageWithArmor]);

  return {
    calculateWeaponDamage,
    applyDamageWithArmor,
    executeAttack,
    executeDefense
  };
};
