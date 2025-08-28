import { adicionarItem, removerItem, totalOuro, limparArmasDuplicadas, validarBolsa } from '../inventory';
import type { Ficha, Item } from '../../types';

describe('Inventory Utils', () => {
  let ficha: Ficha;

  beforeEach(() => {
    ficha = {
      nome: 'Teste',
      forca: { inicial: 10, atual: 10 },
      pericia: { inicial: 8, atual: 8 },
      sorte: { inicial: 6, atual: 6 },
      bolsa: [],
      modificadoresAtivos: {
        forca: 0,
        pericia: 0,
        sorte: 0,
        ataque: 0
      }
    };
  });

  describe('adicionarItem', () => {
    it('deve adicionar um novo item à bolsa', () => {
      const item: Omit<Item, 'id'> = {
        nome: 'Espada',
        tipo: 'arma',
        descricao: 'Item para teste',
        adquiridoEm: 'Teste'
      };

      const novaFicha = adicionarItem(ficha, item);

      expect(novaFicha.bolsa).toHaveLength(1);
      expect(novaFicha.bolsa[0].nome).toBe('Espada');
      expect(novaFicha.bolsa[0].tipo).toBe('arma');
      expect(novaFicha.bolsa[0].id).toMatch(/^arma_\d+_[a-z0-9]+$/);
    });

    it('deve incrementar quantidade para itens existentes do mesmo tipo (ouro/provisões)', () => {
      const item1: Omit<Item, 'id'> = {
        nome: 'Poção',
        tipo: 'provisao',
        quantidade: 1,
        descricao: 'Item para teste',
        adquiridoEm: 'Teste'
      };

      const item2: Omit<Item, 'id'> = {
        nome: 'Poção',
        tipo: 'provisao',
        quantidade: 1,
        descricao: 'Item para teste',
        adquiridoEm: 'Teste'
      };

      let novaFicha = adicionarItem(ficha, item1);
      novaFicha = adicionarItem(novaFicha, item2);

      expect(novaFicha.bolsa).toHaveLength(1);
      expect(novaFicha.bolsa[0].quantidade).toBe(2);
    });

    it('deve substituir armas existentes ao adicionar nova arma', () => {
      const arma1: Omit<Item, 'id'> = {
        nome: 'Espada',
        tipo: 'arma',
        descricao: 'Primeira arma',
        adquiridoEm: 'Teste'
      };

      const arma2: Omit<Item, 'id'> = {
        nome: 'Machado',
        tipo: 'arma',
        descricao: 'Segunda arma',
        adquiridoEm: 'Teste'
      };

      let novaFicha = adicionarItem(ficha, arma1);
      novaFicha = adicionarItem(novaFicha, arma2);

      expect(novaFicha.bolsa).toHaveLength(1);
      expect(novaFicha.bolsa[0].nome).toBe('Machado');
    });
  });

  describe('removerItem', () => {
    it('deve remover item por ID', () => {
      const item: Omit<Item, 'id'> = {
        nome: 'Poção',
        tipo: 'provisao',
        quantidade: 3,
        descricao: 'Item para teste',
        adquiridoEm: 'Teste'
      };

      const fichaComItem = adicionarItem(ficha, item);
      const itemId = fichaComItem.bolsa[0].id;
      
      const novaFicha = removerItem(fichaComItem, itemId);
      
      expect(novaFicha.bolsa).toHaveLength(0);
    });

    it('deve não alterar ficha se item não existir', () => {
      const novaFicha = removerItem(ficha, 'id-inexistente');
      
      expect(novaFicha.bolsa).toHaveLength(0);
      expect(novaFicha).toEqual(ficha);
    });
  });

  describe('totalOuro', () => {
    it('deve calcular total de ouro corretamente', () => {
      const item1: Omit<Item, 'id'> = {
        nome: 'Moedas',
        tipo: 'ouro',
        quantidade: 5,
        descricao: 'Ouro',
        adquiridoEm: 'Teste'
      };

      const item2: Omit<Item, 'id'> = {
        nome: 'Joias',
        tipo: 'ouro',
        quantidade: 3,
        descricao: 'Joias',
        adquiridoEm: 'Teste'
      };

      let novaFicha = adicionarItem(ficha, item1);
      novaFicha = adicionarItem(novaFicha, item2);

      const total = totalOuro(novaFicha);
      expect(total).toBe(8);
    });

    it('deve retornar 0 se não há ouro', () => {
      const total = totalOuro(ficha);
      expect(total).toBe(0);
    });
  });

  describe('limparArmasDuplicadas', () => {
    it('deve manter apenas a arma mais recente', () => {
      // Criar ficha com duas armas com timestamps diferentes
      const fichaComArmas: Ficha = {
        ...ficha,
        bolsa: [
          {
            id: 'arma_1000_abc123',
            nome: 'Espada Antiga',
            tipo: 'arma',
            descricao: 'Arma antiga',
            adquiridoEm: 'Teste'
          },
          {
            id: 'arma_2000_def456',
            nome: 'Espada Nova',
            tipo: 'arma',
            descricao: 'Arma nova',
            adquiridoEm: 'Teste'
          }
        ]
      };

      const novaFicha = limparArmasDuplicadas(fichaComArmas);

      expect(novaFicha.bolsa).toHaveLength(1);
      expect(novaFicha.bolsa[0].id).toBe('arma_2000_def456');
    });

    it('deve não alterar ficha sem armas duplicadas', () => {
      const novaFicha = limparArmasDuplicadas(ficha);
      expect(novaFicha).toEqual(ficha);
    });

    it('deve não alterar ficha com apenas uma arma', () => {
      const fichaComUmaArma: Ficha = {
        ...ficha,
        bolsa: [
          {
            id: 'arma_1000_abc123',
            nome: 'Espada',
            tipo: 'arma',
            descricao: 'Arma única',
            adquiridoEm: 'Teste'
          }
        ]
      };

      const novaFicha = limparArmasDuplicadas(fichaComUmaArma);
      expect(novaFicha).toEqual(fichaComUmaArma);
    });
  });

  describe('validarBolsa', () => {
    it('deve limpar armas duplicadas', () => {
      const fichaComArmas: Ficha = {
        ...ficha,
        bolsa: [
          {
            id: 'arma_1000_abc123',
            nome: 'Espada Antiga',
            tipo: 'arma',
            descricao: 'Arma antiga',
            adquiridoEm: 'Teste'
          },
          {
            id: 'arma_2000_def456',
            nome: 'Espada Nova',
            tipo: 'arma',
            descricao: 'Arma nova',
            adquiridoEm: 'Teste'
          }
        ]
      };

      const novaFicha = validarBolsa(fichaComArmas);

      expect(novaFicha.bolsa).toHaveLength(1);
      expect(novaFicha.bolsa[0].id).toBe('arma_2000_def456');
    });

    it('deve retornar ficha inalterada se não há problemas', () => {
      const novaFicha = validarBolsa(ficha);
      expect(novaFicha).toEqual(ficha);
    });
  });
});
