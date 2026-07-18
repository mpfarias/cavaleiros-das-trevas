import { useCallback } from 'react';
import type { Ficha, Item } from '../types';

export const useItemEffects = () => {
  // Calcula os modificadores ativos baseado nos itens equipados
  const calculateActiveModifiers = useCallback((ficha: Ficha) => {
    const modifiers = {
      pericia: 0,
      forca: 0,
      sorte: 0,
      ataque: 0
    };

    ficha.bolsa.forEach(item => {
      if (item.efeitos?.attributes) {
        const { pericia, forca, sorte, ataque } = item.efeitos.attributes;
        if (pericia) modifiers.pericia += pericia;
        if (forca) modifiers.forca += forca;
        if (sorte) modifiers.sorte += sorte;
        if (ataque) modifiers.ataque += ataque;
      }
    });

    return modifiers;
  }, []);

  // Aplica os modificadores aos atributos atuais
  const applyModifiersToAttributes = useCallback((ficha: Ficha) => {
    const modifiers = calculateActiveModifiers(ficha);
    
    // 🔧 PRESERVAR mudanças feitas durante o jogo (como dano, sorte perdida, etc.)
    // Aplicar apenas os modificadores dos itens, sem resetar para valores iniciais
    return {
      ...ficha,
      pericia: {
        ...ficha.pericia,
        // Preservar o valor atual e aplicar apenas os modificadores dos itens
        atual: Math.max(0, ficha.pericia.atual + modifiers.pericia)
      },
      forca: {
        ...ficha.forca,
        // Preservar o valor atual e aplicar apenas os modificadores dos itens
        atual: Math.max(0, ficha.forca.atual + modifiers.forca)
      },
      sorte: {
        ...ficha.sorte,
        // Preservar o valor atual e aplicar apenas os modificadores dos itens
        atual: Math.max(0, ficha.sorte.atual + modifiers.sorte)
      },
      modificadoresAtivos: modifiers
    };
  }, [calculateActiveModifiers]);

  // Calcula o dano de uma arma (damageType = atributo alvo, não bônus)
  const calculateWeaponDamage = useCallback((weapon: Item, _ficha: Ficha) => {
    return weapon.efeitos?.combat?.damage ?? 0;
  }, []);

  // Aplica dano a um atributo (para combate)
  const applyDamageToAttribute = useCallback((ficha: Ficha, attribute: 'forca' | 'sorte', damage: number) => {
    const newFicha = { ...ficha };
    
    if (attribute === 'forca') {
      newFicha.forca.atual = Math.max(0, newFicha.forca.atual - damage);
    } else if (attribute === 'sorte') {
      newFicha.sorte.atual = Math.max(0, newFicha.sorte.atual - damage);
    }
    
    return newFicha;
  }, []);

  // Reduz durabilidade de um item
  const reduceItemDurability = useCallback((ficha: Ficha, itemId: string, amount: number = 1) => {
    const newFicha = { ...ficha };
    const item = newFicha.bolsa.find(i => i.id === itemId);
    
    if (item && item.durabilidadeAtual !== undefined) {
      item.durabilidadeAtual = Math.max(0, item.durabilidadeAtual - amount);
      
      // Se a durabilidade chegou a 0, remove o item
      if (item.durabilidadeAtual === 0) {
        newFicha.bolsa = newFicha.bolsa.filter(i => i.id !== itemId);
      }
    }
    
    return newFicha;
  }, []);

  // Verifica se um item ainda tem durabilidade
  const hasDurability = useCallback((item: Item) => {
    if (item.efeitos?.durability === undefined) return true;
    return (item.durabilidadeAtual || 0) > 0;
  }, []);

  // Inicializa a durabilidade de um item quando é comprado
  const initializeItemDurability = useCallback((item: Item) => {
    if (item.efeitos?.durability && item.durabilidadeAtual === undefined) {
      return {
        ...item,
        durabilidadeAtual: item.efeitos.durability
      };
    }
    return item;
  }, []);

  return {
    calculateActiveModifiers,
    applyModifiersToAttributes,
    calculateWeaponDamage,
    applyDamageToAttribute,
    reduceItemDurability,
    hasDurability,
    initializeItemDurability
  };
};
