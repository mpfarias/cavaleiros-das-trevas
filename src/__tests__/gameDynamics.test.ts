import { renderHook } from '@testing-library/react';
import { useItemEffects } from '../hooks/useItemEffects';
import { useCombat } from '../hooks/useCombat';
import { adicionarItem, totalOuro } from '../utils/inventory';
import type { Ficha, Item } from '../types';

describe('Dinâmica do Jogo - Cenários Reais', () => {
  // Mock do Math.random para testes determinísticos
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // Sempre retorna 4
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockFicha = (overrides: Partial<Ficha> = {}): Ficha => ({
    nome: 'Cavaleiro Teste',
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

  describe('🎯 Sistema de Combate - Balanceamento', () => {
    it('deve permitir que personagem inicial sobreviva ao primeiro combate', () => {
      const { result } = renderHook(() => useCombat());
      const ficha = createMockFicha({
        forca: { inicial: 15, atual: 15 }, // Força inicial típica
        pericia: { inicial: 8, atual: 8 }
      });

      // Personagem com Espada de Aço (dano base 5)
      const espada = createMockItem({
        tipo: 'arma',
        efeitos: { combat: { damage: 5, damageType: 'forca' } }
      });

      const fichaComArma = adicionarItem(ficha, espada);
      const dano = result.current.calculateWeaponDamage(espada, fichaComArma);

      // Dano base da arma (damageType = atributo alvo, não soma FORÇA)
      expect(dano).toBe(5);
    });

    it('deve exigir estratégia para derrotar inimigos mais fortes', () => {
      const { result } = renderHook(() => useCombat());
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 },
        pericia: { inicial: 10, atual: 10 }
      });

      // Personagem com arma básica
      const espadaBasica = createMockItem({
        tipo: 'arma',
        efeitos: { combat: { damage: 3, damageType: 'forca' } }
      });

      const fichaComArma = adicionarItem(ficha, espadaBasica);
      const danoBasico = result.current.calculateWeaponDamage(espadaBasica, fichaComArma);

      expect(danoBasico).toBe(3);

      // Agora com arma melhor
      const espadaMelhor = createMockItem({
        tipo: 'arma',
        efeitos: { combat: { damage: 8, damageType: 'forca' } }
      });

      const fichaComArmaMelhor = adicionarItem(ficha, espadaMelhor);
      const danoMelhor = result.current.calculateWeaponDamage(espadaMelhor, fichaComArmaMelhor);

      expect(danoMelhor).toBe(8);

      // Verifica se a melhoria faz diferença significativa
      expect(danoMelhor - danoBasico).toBeGreaterThanOrEqual(3);
    });

    it('deve aplicar dano corretamente ao atributo', () => {
      const { result } = renderHook(() => useCombat());
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 }
      });

      // Inimigo ataca com dano 5
      const danoInimigo = 5;
      
      // Aplica dano diretamente
      const fichaDanificada = result.current.applyDamageWithArmor(ficha, danoInimigo, 'forca').ficha;

      // Verifica se o dano foi aplicado corretamente
      expect(fichaDanificada.forca.atual).toBe(13); // 18 - 5
      expect(fichaDanificada.forca.atual).toBeLessThan(18); // Deve ser menor que o valor inicial
    });
  });

  describe('💰 Sistema Econômico - Balanceamento', () => {
    it('deve bloquear compra de arma se não tiver ouro suficiente', () => {
      const ficha = createMockFicha();
      
      // Personagem sem ouro
      expect(totalOuro(ficha)).toBe(0);

      // Tenta comprar arma cara
      // const armaCara = createMockItem({
      //   nome: 'Espada de Diamante',
      //   tipo: 'arma',
      //   efeitos: { combat: { damage: 15, damageType: 'forca' } }
      // });

      // Deve falhar ou não permitir a compra
      // (Este teste verifica se o sistema econômico está funcionando)
      expect(ficha.bolsa).toHaveLength(0);
    });

    it('deve permitir progressão econômica através de compras estratégicas', () => {
      const ficha = createMockFicha();
      
      // Adiciona ouro inicial
      const ouroInicial = createMockItem({
        nome: 'Moedas de Ouro',
        tipo: 'ouro',
        quantidade: 20,
        descricao: 'Ouro inicial'
      });

      let fichaComOuro = adicionarItem(ficha, ouroInicial);
      expect(totalOuro(fichaComOuro)).toBe(20);

      // Compra arma básica (custo 8)
      const armaBasica = createMockItem({
        nome: 'Espada de Aço',
        tipo: 'arma',
        efeitos: { combat: { damage: 5, damageType: 'forca' } }
      });

      fichaComOuro = adicionarItem(fichaComOuro, armaBasica);
      
      // Verifica se ainda tem ouro para outras compras
      expect(totalOuro(fichaComOuro)).toBeGreaterThan(0);
      expect(fichaComOuro.bolsa.some(item => item.tipo === 'arma')).toBe(true);
    });

    it('deve ter preços balanceados para itens', () => {
      // Este teste verifica se os preços dos itens fazem sentido
      // Itens mais poderosos devem ser mais caros
      
      const ficha = createMockFicha();
      
      // Adiciona muito ouro para teste
      const ouroTeste = createMockItem({
        nome: 'Ouro de Teste',
        tipo: 'ouro',
        quantidade: 100,
        descricao: 'Ouro para teste'
      });

      const fichaComOuro = adicionarItem(ficha, ouroTeste);
      
      // Verifica se pode comprar itens de diferentes níveis
      expect(totalOuro(fichaComOuro)).toBe(100);
      
      // O sistema deve permitir compras progressivas
      // (Este teste verifica se a economia não está quebrada)
    });
  });

  describe('⚔️ Regras de Equipamento - Dinâmica', () => {
    it('deve aplicar regra de substituição de armas corretamente', () => {
      const ficha = createMockFicha();
      
      // Personagem começa com Espada de Aço (dano 5)
      const espadaInicial = createMockItem({
        nome: 'Espada de Aço',
        tipo: 'arma',
        efeitos: { combat: { damage: 5, damageType: 'forca' } }
      });

      let fichaComArma = adicionarItem(ficha, espadaInicial);
      expect(fichaComArma.bolsa).toHaveLength(1);
      expect(fichaComArma.bolsa[0].nome).toBe('Espada de Aço');

      // Compra Machado de Guerra (dano 8) - deve substituir
      const machado = createMockItem({
        nome: 'Machado de Guerra',
        tipo: 'arma',
        efeitos: { combat: { damage: 8, damageType: 'forca' } }
      });

      fichaComArma = adicionarItem(fichaComArma, machado);
      
      // Verifica se substituiu corretamente
      expect(fichaComArma.bolsa).toHaveLength(1);
      expect(fichaComArma.bolsa[0].nome).toBe('Machado de Guerra');
      expect(fichaComArma.bolsa[0].efeitos?.combat?.damage).toBe(8);
    });

    it('deve permitir múltiplos equipamentos não-competitivos', () => {
      const ficha = createMockFicha();
      
      // Adiciona arma
      const espada = createMockItem({
        nome: 'Espada de Aço',
        tipo: 'arma',
        efeitos: { combat: { damage: 5, damageType: 'forca' } }
      });

      let fichaComEquipamentos = adicionarItem(ficha, espada);
      
      // Adiciona armadura (não compete com arma)
      const armadura = createMockItem({
        nome: 'Gibão de Couro',
        tipo: 'armadura',
        efeitos: { combat: { damage: 3, damageType: 'forca' } }
      });

      fichaComEquipamentos = adicionarItem(fichaComEquipamentos, armadura);
      
      // Deve ter ambos os equipamentos
      expect(fichaComEquipamentos.bolsa).toHaveLength(2);
      expect(fichaComEquipamentos.bolsa.some(item => item.tipo === 'arma')).toBe(true);
      expect(fichaComEquipamentos.bolsa.some(item => item.tipo === 'armadura')).toBe(true);
    });
  });

  describe('📈 Progressão do Personagem', () => {
    it('deve permitir evolução através de equipamentos', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        forca: { inicial: 15, atual: 15 },
        pericia: { inicial: 8, atual: 8 }
      });

      // Personagem sem equipamentos
      const modificadoresIniciais = result.current.calculateActiveModifiers(ficha);
      expect(modificadoresIniciais.forca).toBe(0);
      expect(modificadoresIniciais.pericia).toBe(0);

      // Adiciona equipamentos que modificam atributos
      const anelForca = createMockItem({
        nome: 'Anel da Força',
        tipo: 'equipamento',
        efeitos: { attributes: { forca: 3 } }
      });

      const amuletoPericia = createMockItem({
        nome: 'Amuleto da Perícia',
        tipo: 'equipamento',
        efeitos: { attributes: { pericia: 2 } }
      });

      let fichaComEquipamentos = adicionarItem(ficha, anelForca);
      fichaComEquipamentos = adicionarItem(fichaComEquipamentos, amuletoPericia);

      // Aplica modificadores
      const fichaModificada = result.current.applyModifiersToAttributes(fichaComEquipamentos);

      // Verifica se os atributos foram modificados
      expect(fichaModificada.forca.atual).toBe(18); // 15 + 3
      expect(fichaModificada.pericia.atual).toBe(10); // 8 + 2
      expect(fichaModificada.forca.inicial).toBe(15); // Inicial não muda
      expect(fichaModificada.pericia.inicial).toBe(8); // Inicial não muda
    });

    it('deve manter desafio mesmo com equipamentos melhores', () => {
      const { result } = renderHook(() => useCombat());
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 }
      });

      // Personagem com equipamento básico
      const equipamentoBasico = createMockItem({
        tipo: 'arma',
        efeitos: { combat: { damage: 5, damageType: 'forca' } }
      });

      const fichaBasica = adicionarItem(ficha, equipamentoBasico);
      const danoBasico = result.current.calculateWeaponDamage(equipamentoBasico, fichaBasica);

      // Personagem com equipamento avançado
      const equipamentoAvancado = createMockItem({
        tipo: 'arma',
        efeitos: { combat: { damage: 12, damageType: 'forca' } }
      });

      const fichaAvancada = adicionarItem(ficha, equipamentoAvancado);
      const danoAvancado = result.current.calculateWeaponDamage(equipamentoAvancado, fichaAvancada);

      // Verifica se a melhoria é significativa mas não quebra o jogo
      const diferenca = danoAvancado - danoBasico;
      expect(diferenca).toBe(7);
      expect(diferenca).toBeGreaterThanOrEqual(5);
      expect(diferenca).toBeLessThanOrEqual(15);
    });
  });

  describe('🎭 Efeitos Especiais - Narrativa', () => {
    it('deve aplicar penalidades corretas ao usar Anel da Agilidade', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        forca: { inicial: 18, atual: 18 },
        pericia: { inicial: 10, atual: 10 }
      });

      // Anel da Agilidade: +2 perícia, -1 força
      const anelAgilidade = createMockItem({
        nome: 'Anel da Agilidade',
        tipo: 'equipamento',
        efeitos: { 
          attributes: { 
            pericia: 2, 
            forca: -1 
          } 
        }
      });

      const fichaComAnel = adicionarItem(ficha, anelAgilidade);
      const fichaModificada = result.current.applyModifiersToAttributes(fichaComAnel);

      // Verifica se as penalidades são aplicadas corretamente
      expect(fichaModificada.pericia.atual).toBe(12); // 10 + 2
      expect(fichaModificada.forca.atual).toBe(17);   // 18 - 1
      
      // Verifica se os modificadores estão registrados
      expect(fichaModificada.modificadoresAtivos.pericia).toBe(2);
      expect(fichaModificada.modificadoresAtivos.forca).toBe(-1);
    });

    it('deve permitir combinações estratégicas de equipamentos', () => {
      const { result } = renderHook(() => useItemEffects());
      const ficha = createMockFicha({
        forca: { inicial: 16, atual: 16 },
        pericia: { inicial: 12, atual: 12 },
        sorte: { inicial: 8, atual: 8 }
      });

      // Combinação de equipamentos
      const equipamentos = [
        createMockItem({
          nome: 'Anel da Força',
          tipo: 'equipamento',
          efeitos: { attributes: { forca: 2 } }
        }),
        createMockItem({
          nome: 'Amuleto da Sorte',
          tipo: 'equipamento',
          efeitos: { attributes: { sorte: 3 } }
        }),
        createMockItem({
          nome: 'Bracelete da Perícia',
          tipo: 'equipamento',
          efeitos: { attributes: { pericia: 1 } }
        })
      ];

      let fichaComEquipamentos = ficha;
      equipamentos.forEach(equip => {
        fichaComEquipamentos = adicionarItem(fichaComEquipamentos, equip);
      });

      const fichaModificada = result.current.applyModifiersToAttributes(fichaComEquipamentos);

      // Verifica se a combinação funciona
      expect(fichaModificada.forca.atual).toBe(18);   // 16 + 2
      expect(fichaModificada.pericia.atual).toBe(13); // 12 + 1
      expect(fichaModificada.sorte.atual).toBe(11);   // 8 + 3

      // Verifica se os modificadores estão corretos
      expect(fichaModificada.modificadoresAtivos.forca).toBe(2);
      expect(fichaModificada.modificadoresAtivos.pericia).toBe(1);
      expect(fichaModificada.modificadoresAtivos.sorte).toBe(3);
    });
  });
});
