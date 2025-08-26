import { useCallback } from 'react';
import type { Ficha, Item } from '../types';

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
  const applyDamageWithArmor = useCallback((ficha: Ficha, damage: number, damageType: 'forca' | 'sorte', luckTestSuccess?: boolean) => {
    const newFicha = { ...ficha };
    
    // Verificar se tem armadura equipada
    const armor = ficha.bolsa.find(item => item.tipo === 'armadura');
    
    if (armor && armor.efeitos?.combat?.damage) {
      let reducedDamage = armor.efeitos.combat.damage;
      
      // Aplicar modificadores baseados em testes de sorte para armadura
      if (luckTestSuccess !== undefined && armor.efeitos.combat.damageCondition) {
        if (luckTestSuccess) {
          // Se passou no teste de sorte, aplicar o melhor resultado
          if (armor.efeitos.combat.damageCondition.includes('0 se sucesso em Sorte')) {
            reducedDamage = 0;
          }
        } else {
          // Se falhou no teste de sorte, aplicar o pior resultado
          if (armor.efeitos.combat.damageCondition.includes('2 se falhar')) {
            reducedDamage = 2;
          }
        }
      }
      
      // Reduzir durabilidade da armadura
      if (armor.durabilidadeAtual !== undefined) {
        armor.durabilidadeAtual = Math.max(0, armor.durabilidadeAtual - 1);
        
        // Se a durabilidade chegou a 0, remove a armadura
        if (armor.durabilidadeAtual === 0) {
          newFicha.bolsa = newFicha.bolsa.filter(item => item.id !== armor.id);
        }
      }
      
      damage = reducedDamage;
    }
    
    // Aplicar o dano final ao atributo
    if (damageType === 'forca') {
      newFicha.forca.atual = Math.max(0, newFicha.forca.atual - damage);
    } else if (damageType === 'sorte') {
      newFicha.sorte.atual = Math.max(0, newFicha.sorte.atual - damage);
    }
    
    return newFicha;
  }, []);

  // Executa um ataque com uma arma
  const executeAttack = useCallback((ficha: Ficha, weapon: Item, _target: 'enemy', luckTestSuccess?: boolean) => {
    const damage = calculateWeaponDamage(weapon, ficha, luckTestSuccess);
    
    // Aqui você pode adicionar lógica para aplicar dano ao inimigo
    // Por enquanto, retorna o dano calculado
    
    return {
      damage,
      weaponName: weapon.nome,
      damageType: weapon.efeitos?.combat?.damageType || 'forca'
    };
  }, [calculateWeaponDamage]);

  // Executa uma defesa (receber dano)
  const executeDefense = useCallback((ficha: Ficha, incomingDamage: number, damageType: 'forca' | 'sorte', luckTestSuccess?: boolean) => {
    const newFicha = applyDamageWithArmor(ficha, incomingDamage, damageType, luckTestSuccess);
    
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
