import { renderHook } from '@testing-library/react';
import { useDiceRoller } from '../useDiceRoller';

describe('useDiceRoller', () => {
  beforeEach(() => {
    // Mock do Math.random para testes determinísticos
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // Sempre retorna 4
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rollD6', () => {
    it('deve retornar um número entre 1 e 6', () => {
      const { result } = renderHook(() => useDiceRoller());
      const roll = result.current.rollD6();
      
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    });

    it('deve retornar 4 com Math.random mockado como 0.5', () => {
      const { result } = renderHook(() => useDiceRoller());
      const roll = result.current.rollD6();
      
      expect(roll).toBe(4);
    });
  });

  describe('rollND6', () => {
    it('deve retornar o número correto de dados', () => {
      const { result } = renderHook(() => useDiceRoller());
      const { dice, total } = result.current.rollND6(3);
      
      expect(dice).toHaveLength(3);
      expect(dice.every(d => d >= 1 && d <= 6)).toBe(true);
      expect(total).toBe(12); // 3 dados com valor 4 cada
    });

    it('deve lidar com números negativos ou zero', () => {
      const { result } = renderHook(() => useDiceRoller());
      const { dice, total } = result.current.rollND6(-2);
      
      expect(dice).toHaveLength(1); // Mínimo de 1 dado
      expect(total).toBe(4);
    });
  });

  describe('rollAttribute', () => {
    it('deve calcular perícia corretamente (1d6 + 6)', () => {
      const { result } = renderHook(() => useDiceRoller());
      const total = result.current.rollAttribute('pericia');
      
      expect(total).toBe(10); // 4 (dado) + 6 (bonus)
    });

    it('deve calcular força corretamente (2d6 + 12)', () => {
      const { result } = renderHook(() => useDiceRoller());
      const total = result.current.rollAttribute('forca');
      
      expect(total).toBe(20); // 4+4 (dados) + 12 (bonus)
    });

    it('deve calcular sorte corretamente (1d6 + 6)', () => {
      const { result } = renderHook(() => useDiceRoller());
      const total = result.current.rollAttribute('sorte');
      
      expect(total).toBe(10); // 4 (dado) + 6 (bonus)
    });

    it('deve calcular ouro corretamente (2d6 + 12)', () => {
      const { result } = renderHook(() => useDiceRoller());
      const total = result.current.rollAttribute('ouro');
      
      expect(total).toBe(20); // 4+4 (dados) + 12 (bonus)
    });
  });

  describe('rollWithDetails', () => {
    it('deve retornar detalhes completos para perícia', () => {
      const { result } = renderHook(() => useDiceRoller());
      const details = result.current.rollWithDetails('pericia');
      
      expect(details).toEqual({
        dice: [4],
        bonus: 6,
        total: 10,
        formula: 'Definir perícia'
      });
    });

    it('deve retornar detalhes completos para força', () => {
      const { result } = renderHook(() => useDiceRoller());
      const details = result.current.rollWithDetails('forca');
      
      expect(details).toEqual({
        dice: [4, 4],
        bonus: 12,
        total: 20,
        formula: 'Definir força'
      });
    });

    it('deve retornar detalhes completos para sorte', () => {
      const { result } = renderHook(() => useDiceRoller());
      const details = result.current.rollWithDetails('sorte');
      
      expect(details).toEqual({
        dice: [4],
        bonus: 6,
        total: 10,
        formula: 'Definir sorte'
      });
    });

    it('deve retornar detalhes completos para ouro', () => {
      const { result } = renderHook(() => useDiceRoller());
      const details = result.current.rollWithDetails('ouro');
      
      expect(details).toEqual({
        dice: [4, 4],
        bonus: 12,
        total: 20,
        formula: '2d6 + 12'
      });
    });
  });
});
