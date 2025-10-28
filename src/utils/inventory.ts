import type { Ficha, Item } from '../types';

/**
 * Adiciona um item à bolsa do personagem
 */
export const adicionarItem = (ficha: Ficha, item: Omit<Item, 'id'>): Ficha => {
  const novoItem: Item = {
    ...item,
    id: `${item.tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  // Se for ouro ou provisões, verifica se já existe para somar
  if (item.tipo === 'ouro' || item.tipo === 'provisao') {
    const itemExistente = ficha.bolsa.find(i => i.nome === item.nome);
    if (itemExistente) {
      const novaBolsa = ficha.bolsa.map(i => 
        i.id === itemExistente.id 
          ? { ...i, quantidade: (i.quantidade || 1) + (item.quantidade || 1) }
          : i
      );
      return { ...ficha, bolsa: novaBolsa };
    }
  }

  // Se for arma ou armadura, remove a existente antes de adicionar a nova
  if (item.tipo === 'arma' || item.tipo === 'armadura') {
    const novaBolsa = ficha.bolsa.filter(i => i.tipo !== item.tipo);
    return {
      ...ficha,
      bolsa: [...novaBolsa, novoItem],
    };
  }

  return {
    ...ficha,
    bolsa: [...ficha.bolsa, novoItem],
  };
};

/**
 * Remove um item da bolsa do personagem
 */
export const removerItem = (ficha: Ficha, itemId: string): Ficha => {
  return {
    ...ficha,
    bolsa: ficha.bolsa.filter(item => item.id !== itemId),
  };
};

/**
 * Atualiza a quantidade de um item (para ouro e provisões)
 */
export const atualizarQuantidade = (ficha: Ficha, itemId: string, novaQuantidade: number): Ficha => {
  if (novaQuantidade <= 0) {
    return removerItem(ficha, itemId);
  }

  return {
    ...ficha,
    bolsa: ficha.bolsa.map(item => 
      item.id === itemId 
        ? { ...item, quantidade: novaQuantidade }
        : item
    ),
  };
};

/**
 * Busca itens na bolsa por tipo
 */
export const buscarItensPorTipo = (ficha: Ficha, tipo: Item['tipo']): Item[] => {
  return ficha.bolsa.filter(item => item.tipo === tipo);
};

/**
 * Busca um item específico por nome
 */
export const buscarItemPorNome = (ficha: Ficha, nome: string): Item | undefined => {
  return ficha.bolsa.find(item => item.nome.toLowerCase() === nome.toLowerCase());
};

/**
 * Conta o total de ouro na bolsa
 */
export const totalOuro = (ficha: Ficha): number => {
  return ficha.bolsa
    .filter(item => item.tipo === 'ouro')
    .reduce((total, item) => total + (item.quantidade || 0), 0);
};

/**
 * Conta o total de provisões na bolsa
 */
export const totalProvisoes = (ficha: Ficha): number => {
  return ficha.bolsa
    .filter(item => item.tipo === 'provisao')
    .reduce((total, item) => total + (item.quantidade || 0), 0);
};

/**
 * Limpa armas duplicadas da bolsa, mantendo apenas a mais recente
 * Garante que o personagem tenha apenas uma arma por vez
 */
export const limparArmasDuplicadas = (ficha: Ficha): Ficha => {
  const armas = ficha.bolsa.filter(item => item.tipo === 'arma');
  
  if (armas.length <= 1) {
    return ficha; // Não há duplicatas
  }
  
  // Mantém apenas a arma mais recente (baseado no ID que contém timestamp)
  const armaMaisRecente = armas.reduce((maisRecente, arma) => {
    const timestampAtual = parseInt(arma.id.split('_')[1]) || 0;
    const timestampMaisRecente = parseInt(maisRecente.id.split('_')[1]) || 0;
    return timestampAtual > timestampMaisRecente ? arma : maisRecente;
  });
  
  // Remove todas as armas e adiciona apenas a mais recente
  const novaBolsa = ficha.bolsa.filter(item => item.tipo !== 'arma');
  novaBolsa.push(armaMaisRecente);
  
  return {
    ...ficha,
    bolsa: novaBolsa
  };
};

/**
 * Valida e corrige a bolsa do personagem
 * Remove armas duplicadas e garante consistência
 */
export const validarBolsa = (ficha: Ficha): Ficha => {
  let fichaCorrigida = { ...ficha };
  
  // Limpa armas duplicadas
  fichaCorrigida = limparArmasDuplicadas(fichaCorrigida);
  
  // Limpa armaduras duplicadas (mesma lógica)
  const armaduras = fichaCorrigida.bolsa.filter(item => item.tipo === 'armadura');
  if (armaduras.length > 1) {
    const armaduraMaisRecente = armaduras.reduce((maisRecente, armadura) => {
      const timestampAtual = parseInt(armadura.id.split('_')[1]) || 0;
      const timestampMaisRecente = parseInt(maisRecente.id.split('_')[1]) || 0;
      return timestampAtual > timestampMaisRecente ? armadura : maisRecente;
    });
    
    const novaBolsa = fichaCorrigida.bolsa.filter(item => item.tipo !== 'armadura');
    novaBolsa.push(armaduraMaisRecente);
    fichaCorrigida = { ...fichaCorrigida, bolsa: novaBolsa };
  }
  
  return fichaCorrigida;
};

/**
 * Exemplos de itens que podem ser adicionados automaticamente durante o jogo
 */
export const exemplosItens = {
  armas: [
    { nome: 'Espada de Aço', tipo: 'arma' as const, descricao: 'Uma espada bem afiada e resistente' },
    { nome: 'Machado de Batalha', tipo: 'arma' as const, descricao: 'Pesado mas devastador' },
    { nome: 'Adaga Envenenada', tipo: 'arma' as const, descricao: 'Pequena mas mortal' },
  ],
  armaduras: [
    { nome: 'Gibão de Couro', tipo: 'armadura' as const, descricao: 'Proteção básica mas confortável' },
    { nome: 'Escudo de Madeira', tipo: 'armadura' as const, descricao: 'Escudo simples mas eficaz' },
    { nome: 'Elmo de Ferro', tipo: 'armadura' as const, descricao: 'Proteção para a cabeça' },
  ],
  equipamentos: [
    { nome: 'Tocha', tipo: 'equipamento' as const, descricao: 'Ilumina o caminho nas trevas' },
    { nome: 'Corda', tipo: 'equipamento' as const, descricao: 'Útil para escalar e amarrar' },
    { nome: 'Chave Enferrujada', tipo: 'equipamento' as const, descricao: 'Pode abrir portas antigas' },
    { nome: 'Poção de Cura', tipo: 'equipamento' as const, descricao: 'Restaura a força do personagem' },
  ],
  ouro: [
    { nome: 'Moedas de Ouro', tipo: 'ouro' as const, quantidade: 10, descricao: 'Moedas valiosas' },
    { nome: 'Joias', tipo: 'ouro' as const, quantidade: 25, descricao: 'Pedras preciosas' },
  ],
  provisoes: [
    { nome: 'Pão Duro', tipo: 'provisao' as const, quantidade: 5, descricao: 'Alimento básico' },
    { nome: 'Queijo', tipo: 'provisao' as const, quantidade: 3, descricao: 'Queijo curado' },
    { nome: 'Água', tipo: 'provisao' as const, quantidade: 10, descricao: 'Água limpa em cantil' },
  ],
};
