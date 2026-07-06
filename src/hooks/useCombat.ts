import { useCallback } from 'react';
import type { Ficha, Item } from '../types';
import { getArmorMaxDurability, hasArmorCombatProtection } from '../utils/armor';

export interface ApplyArmorDamageResult {
  ficha: Ficha;
  armorBroken?: string;
}

export const useCombat = () => {
  // Calcula o dano de uma arma baseado nos efeitos e atributos
  const calculateWeaponDamage = useCallback((weapon: Item, ficha: Ficha, luckTestSuccess?: boolean) => {
    if (!weapon.efeitos?.combat?.damage) return 0;

    const baseDamage = weapon.efeitos.combat.damage;
    const damageType = weapon.efeitos.combat.damageType;
    
    let finalDamage = baseDamage;
    
    // Aplicar modificadores baseados em testes de sorte
    if (luckTestSuccess !== undefined && weapon.efeitos.combat.damageCondition) {
      if (luckTestSuccess) {
        // Se passou no teste de sorte, aplicar o melhor resultado
        if (weapon.efeitos.combat.damageCondition.includes('6 se sucesso em Sorte')) {
          finalDamage = 6;
        }
      } else {
        // Se falhou no teste de sorte, aplicar o pior resultado
        if (weapon.efeitos.combat.damageCondition.includes('2 se falhar')) {
          finalDamage = 2;
        }
      }
    }
    
    // Adicionar modificadores de atributos
    if (damageType === 'forca') {
      finalDamage += ficha.forca.atual;
    } else if (damageType === 'sorte') {
      finalDamage += ficha.sorte.atual;
    }
    
    return Math.max(0, finalDamage);
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
        let reducedDamage = armor.efeitos!.combat!.damage!;

        if (luckTestSuccess !== undefined && armor.efeitos?.combat?.damageCondition) {
          if (luckTestSuccess && armor.efeitos.combat.damageCondition.includes('0 se sucesso em Sorte')) {
            reducedDamage = 0;
          } else if (!luckTestSuccess && armor.efeitos.combat.damageCondition.includes('2 se falhar')) {
            reducedDamage = 2;
          }
        }

        finalDamage = reducedDamage;

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
