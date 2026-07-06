import type { Item } from '../types';

export function hasArmorCombatProtection(item: Item): boolean {
  return item.tipo === 'armadura' && item.efeitos?.combat?.damage !== undefined;
}

export function getArmorMaxDurability(item: Item): number | undefined {
  return item.efeitos?.durability;
}

export function getArmorDurability(item: Item): number | undefined {
  if (item.tipo !== 'armadura') return undefined;
  if (item.durabilidadeAtual !== undefined) return item.durabilidadeAtual;
  return item.efeitos?.durability;
}

/** Garante durabilidade inicial ao adicionar armadura à bolsa. */
export function prepareArmorItem(item: Item): Item {
  if (item.tipo !== 'armadura') return item;

  const maxDurability = item.efeitos?.durability;
  if (maxDurability !== undefined && item.durabilidadeAtual === undefined) {
    return { ...item, durabilidadeAtual: maxDurability };
  }

  return { ...item };
}

/** Texto de como a armadura protege em combate. */
export function describeArmorProtection(item: Item): string {
  if (!hasArmorCombatProtection(item)) {
    return 'Proteção automática em combate (efeitos não especificados).';
  }

  const damage = item.efeitos!.combat!.damage!;
  const condition = item.efeitos!.combat!.damageCondition;

  let text = `Em combate, cada golpe recebido custa apenas ${damage} ponto${damage !== 1 ? 's' : ''} de FORÇA`;
  if (condition) {
    text += ` (${condition} ao Testar a Sorte)`;
  }
  text += '. A proteção é automática enquanto você a carrega.';

  const maxDurability = getArmorMaxDurability(item);
  if (maxDurability !== undefined) {
    const current = getArmorDurability(item) ?? maxDurability;
    text += ` Suporta ${maxDurability} golpe${maxDurability !== 1 ? 's' : ''} (${current} restante${current !== 1 ? 's' : ''}).`;
  }

  return text;
}

/** Mensagem exibida ao obter uma armadura. */
export function getArmorAcquisitionNotice(item: Item): string {
  return `🛡️ ${item.nome} — ${describeArmorProtection(item)} Cada golpe recebido em combate conta contra a durabilidade; ao esgotar, a armadura é removida da bolsa.`;
}
