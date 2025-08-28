import { renderHook } from '@testing-library/react';
import { useCharacterValidation } from '../useCharacterValidation';
import type { Ficha } from '../../types';

describe('useCharacterValidation', () => {
  const createMockFicha = (overrides: Partial<Ficha> = {}): Ficha => ({
    nome: '',
    pericia: { inicial: 0, atual: 0 },
    forca: { inicial: 0, atual: 0 },
    sorte: { inicial: 0, atual: 0 },
    bolsa: [],
    modificadoresAtivos: {
      pericia: 0,
      forca: 0,
      sorte: 0,
      ataque: 0
    },
    ...overrides
  });

  describe('validateForSave', () => {
    it('deve retornar erro quando nome está vazio', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ nome: '' });
      
      const validation = result.current.validateForSave(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Digite um nome para o personagem antes de salvar.');
    });

    it('deve retornar erro quando nome só tem espaços', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ nome: '   ' });
      
      const validation = result.current.validateForSave(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Digite um nome para o personagem antes de salvar.');
    });

    it('deve retornar sucesso quando nome é válido', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ nome: 'Sir Galahad' });
      
      const validation = result.current.validateForSave(ficha);
      
      expect(validation.isValid).toBe(true);
      expect(validation.message).toBeUndefined();
    });
  });

  describe('validateForStart', () => {
    it('deve retornar erro quando nome está vazio', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ nome: '' });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Digite um nome para o personagem antes de começar.');
    });

    it('deve retornar erro quando perícia não foi rolada', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 0, atual: 0 }
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Role PERÍCIA, FORÇA e SORTE antes de começar.');
    });

    it('deve retornar erro quando força não foi rolada', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 0, atual: 0 }
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Role PERÍCIA, FORÇA e SORTE antes de começar.');
    });

    it('deve retornar erro quando sorte não foi rolada', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 0, atual: 0 }
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Role PERÍCIA, FORÇA e SORTE antes de começar.');
    });

    it('deve retornar erro quando não há moedas de ouro', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 9, atual: 9 },
        bolsa: []
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Role as MOEDAS DE OURO antes de começar.');
    });

    it('deve retornar sucesso quando todos os requisitos são atendidos', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 9, atual: 9 },
        bolsa: [
          {
            id: 'ouro',
            nome: 'Moedas de Ouro',
            tipo: 'ouro',
            quantidade: 20,
            descricao: 'Moedas de ouro',
            adquiridoEm: 'Criação'
          }
        ]
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(true);
      expect(validation.message).toBeUndefined();
    });

    it('deve retornar erro quando moedas de ouro não têm nome exato', () => {
      const { result } = renderHook(() => useCharacterValidation());
      const ficha = createMockFicha({ 
        nome: 'Sir Galahad',
        pericia: { inicial: 10, atual: 10 },
        forca: { inicial: 18, atual: 18 },
        sorte: { inicial: 9, atual: 9 },
        bolsa: [
          {
            id: 'ouro',
            nome: 'Ouro', // Nome diferente de 'Moedas de Ouro'
            tipo: 'ouro',
            quantidade: 20,
            descricao: 'Moedas de ouro',
            adquiridoEm: 'Criação'
          }
        ]
      });
      
      const validation = result.current.validateForStart(ficha);
      
      expect(validation.isValid).toBe(false);
      expect(validation.message).toBe('Role as MOEDAS DE OURO antes de começar.');
    });
  });
});
