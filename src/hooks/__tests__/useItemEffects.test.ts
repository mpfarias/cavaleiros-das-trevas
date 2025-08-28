import { renderHook } from '@testing-library/react';
import { useItemEffects } from '../useItemEffects';
import type { Ficha, Item } from '../../types';

describe('useItemEffects', () => {
  const createMockFicha = (overrides: Partial<Ficha> = {}): Ficha => ({
    nome: 'Teste',
    pericia: { inicial: 10, atual: 10 },
    forca: { inicial: 18, atual: 18 },
    sorte: { inicial: 9, atual: 9 },
    bolsa: [],
    modificadoresAtivos: {
      pericia: 0,
      forca: 0,
      sorte: 0,
      ataque: 0
    },
    ...overrides
  });

  const createMockItem = (overrides: Partial<Item> = {}): Item => ({
    id: 'item-test',
    nome: 'Item Teste',
    tipo: 'equipamento',
    descricao: 'Item para teste',
    adquiridoEm: 'Teste',
    ...overrides
  });

  describe('calculateActiveModifiers', () => {
    it('deve calcular modificadores corretamente para itens com efeitos', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        bolsa: [
          createMockItem({
            id: 'anel',
            nome: 'Anel da Agilidade',
            efeitos: {
              attributes: { pericia: 2, forca: -1 }
            }
          }),
          createMockItem({
            id: 'amuleto',
            nome: 'Amuleto da Sorte',
            efeitos: {
              attributes: { sorte: 3 }
            }
          })
        ]
      });

      const modificadores = result.current.calculateActiveModifiers(ficha);

      expect(modificadores.pericia).toBe(2);
      expect(modificadores.forca).toBe(-1);
      expect(modificadores.sorte).toBe(3);
      expect(modificadores.ataque).toBe(0);
    });

    it('deve retornar zeros quando não há itens com efeitos', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        bolsa: [
          createMockItem({ id: 'espada', nome: 'Espada' }),
          createMockItem({ id: 'armadura', nome: 'Armadura' })
        ]
      });

      const modificadores = result.current.calculateActiveModifiers(ficha);

      expect(modificadores.pericia).toBe(0);
      expect(modificadores.forca).toBe(0);
      expect(modificadores.sorte).toBe(0);
      expect(modificadores.ataque).toBe(0);
    });

    it('deve somar modificadores de múltiplos itens', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        bolsa: [
          createMockItem({
            id: 'item1',
            efeitos: { attributes: { pericia: 1 } }
          }),
          createMockItem({
            id: 'item2',
            efeitos: { attributes: { pericia: 2 } }
          })
        ]
      });

      const modificadores = result.current.calculateActiveModifiers(ficha);

      expect(modificadores.pericia).toBe(3);
    });
  });

  describe('applyModifiersToAttributes', () => {
    it('deve aplicar modificadores aos atributos atuais', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 9, atual: 9 },
        bolsa: [
          createMockItem({
            efeitos: {
              attributes: { pericia: 2, forca: -1, sorte: 3 }
            }
          })
        ]
      });

      const fichaModificada = result.current.applyModifiersToAttributes(ficha);

      expect(fichaModificada.pericia.atual).toBe(12); // 10 + 2
      expect(fichaModificada.forca.atual).toBe(17);   // 18 - 1
      expect(fichaModificada.sorte.atual).toBe(12);   // 9 + 3
      expect(fichaModificada.modificadoresAtivos.pericia).toBe(2);
      expect(fichaModificada.modificadoresAtivos.forca).toBe(-1);
      expect(fichaModificada.modificadoresAtivos.sorte).toBe(3);
    });

    it('deve manter atributos iniciais inalterados', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 9, atual: 9 }
      });

      const fichaModificada = result.current.applyModifiersToAttributes(ficha);

      expect(fichaModificada.pericia.inicial).toBe(10);
      expect(fichaModificada.forca.inicial).toBe(18);
      expect(fichaModificada.sorte.inicial).toBe(9);
    });
  });

  describe('calculateWeaponDamage', () => {
    it('deve calcular dano de arma com efeitos de combate', () => {
      const { result } = renderHook(() => useItemEffects());
      const arma = createMockItem({
        tipo: 'arma',
        efeitos: {
          combat: { damage: 5, damageType: 'forca' }
        }
      });
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 }
      });

      const dano = result.current.calculateWeaponDamage(arma, ficha);

      expect(dano).toBe(23); // 5 (dano base) + 18 (força atual)
    });

    it('deve retornar 0 para itens sem efeitos de combate', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem({ tipo: 'equipamento' });
      const ficha = createMockFicha();

      const dano = result.current.calculateWeaponDamage(item, ficha);

      expect(dano).toBe(0);
    });
  });

  describe('applyDamageToAttribute', () => {
    it('deve aplicar dano ao atributo correto', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 }
      });

      const fichaDanificada = result.current.applyDamageToAttribute(ficha, 'forca', 3);

      expect(fichaDanificada.forca.atual).toBe(15); // 18 - 3
      expect(fichaDanificada.forca.inicial).toBe(18); // Inicial não muda
    });

    it('deve não permitir atributo negativo', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        sorte: { inicial: 9, atual: 9 }
      });

      const fichaDanificada = result.current.applyDamageToAttribute(ficha, 'sorte', 15);

      expect(fichaDanificada.sorte.atual).toBe(0); // Mínimo 0
    });
  });

  describe('reduceItemDurability', () => {
    it('deve reduzir durabilidade do item', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        bolsa: [
          createMockItem({
            id: 'espada',
            durabilidadeAtual: 10
          })
        ]
      });

      const fichaAtualizada = result.current.reduceItemDurability(ficha, 'espada', 2);

      expect(fichaAtualizada.bolsa[0].durabilidadeAtual).toBe(8);
    });

    it('deve não permitir durabilidade negativa', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        bolsa: [
          createMockItem({
            id: 'espada',
            durabilidadeAtual: 3
          })
        ]
      });

      const fichaAtualizada = result.current.reduceItemDurability(ficha, 'espada', 5);

      // Quando a durabilidade chega a 0, o item é removido da bolsa
      expect(fichaAtualizada.bolsa).toHaveLength(0);
    });

    it('deve retornar ficha inalterada se item não existir', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha();

      const fichaAtualizada = result.current.reduceItemDurability(ficha, 'item-inexistente', 1);

      expect(fichaAtualizada).toEqual(ficha);
    });
  });

  describe('hasDurability', () => {
    it('deve retornar true para itens com durabilidade', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem({
        efeitos: { durability: 10 },
        durabilidadeAtual: 5
      });

      const temDurabilidade = result.current.hasDurability(item);

      expect(temDurabilidade).toBe(true);
    });

    it('deve retornar false para itens sem durabilidade', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem({
        efeitos: { durability: 10 },
        durabilidadeAtual: 0
      });

      const temDurabilidade = result.current.hasDurability(item);

      expect(temDurabilidade).toBe(false);
    });

    it('deve retornar true para itens sem durabilidade definida', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem();

      const temDurabilidade = result.current.hasDurability(item);

      expect(temDurabilidade).toBe(true);
    });
  });

  describe('initializeItemDurability', () => {
    it('deve inicializar durabilidade do item', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem({
        efeitos: { durability: 15 }
      });

      const itemInicializado = result.current.initializeItemDurability(item);

      expect(itemInicializado.durabilidadeAtual).toBe(15);
    });

    it('deve retornar item inalterado se não tiver durabilidade', () => {
      const { result } = renderHook(() => useItemEffects());
      const item = createMockItem();

      const itemInicializado = result.current.initializeItemDurability(item);

      expect(itemInicializado).toEqual(item);
    });
  });
});
