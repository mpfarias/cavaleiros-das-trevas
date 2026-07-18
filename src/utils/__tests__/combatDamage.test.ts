import {
  getDesiredIncomingDamage,
  getPlayerHitDamage,
  getWeaponHitDamage,
  parseDamageCondition,
} from '../combatDamage';
import { getAttackModifier, getCombatAttackPower } from '../weapon';
import type { Ficha, Item } from '../../types';

const baseFicha = (overrides: Partial<Ficha> = {}): Ficha => ({
  nome: 'Teste',
  pericia: { inicial: 10, atual: 10 },
  forca: { inicial: 18, atual: 18 },
  sorte: { inicial: 9, atual: 9 },
  bolsa: [],
  modificadoresAtivos: { pericia: 0, forca: 0, sorte: 0, ataque: 0 },
  ...overrides,
});

const espada: Item = {
  id: 'espada',
  nome: 'Espada de Aço',
  tipo: 'arma',
};

const machado: Item = {
  id: 'machado',
  nome: 'Machado de Guerra',
  tipo: 'arma',
  efeitos: {
    combat: {
      damage: 4,
      damageType: 'forca',
      damageCondition: '6 se sucesso em Sorte, 2 se falhar',
    },
    attributes: { ataque: -1 },
  },
};

const cota: Item = {
  id: 'cota',
  nome: 'Armadura de Cota de Malha',
  tipo: 'armadura',
  efeitos: {
    combat: {
      damage: 1,
      damageType: 'forca',
      damageCondition: '0 se sucesso em Sorte, 2 se falhar',
    },
    durability: 10,
  },
  durabilidadeAtual: 10,
};

describe('combatDamage', () => {
  it('parseia damageCondition', () => {
    const cond = '6 se sucesso em Sorte, 2 se falhar';
    expect(parseDamageCondition(cond, true, 4)).toBe(6);
    expect(parseDamageCondition(cond, false, 4)).toBe(2);
  });

  it('espada padrão causa 2 / 4 / 1', () => {
    expect(getWeaponHitDamage(espada)).toBe(2);
    expect(getWeaponHitDamage(espada, true)).toBe(4);
    expect(getWeaponHitDamage(espada, false)).toBe(1);
  });

  it('machado causa 4 / 6 / 2 e −1 no ataque', () => {
    const ficha = baseFicha({ bolsa: [machado], modificadoresAtivos: { pericia: 0, forca: 0, sorte: 0, ataque: -1 } });
    expect(getPlayerHitDamage(ficha)).toBe(4);
    expect(getPlayerHitDamage(ficha, true)).toBe(6);
    expect(getPlayerHitDamage(ficha, false)).toBe(2);
    expect(getAttackModifier(ficha)).toBe(-1);
    expect(getCombatAttackPower(10, ficha)).toBe(19); // 10 + 10 + (-1)
  });

  it('armadura reduz dano e responde à sorte', () => {
    const ficha = baseFicha({ bolsa: [cota] });
    expect(getDesiredIncomingDamage(ficha, 2)).toBe(1);
    expect(getDesiredIncomingDamage(ficha, 2, { luckTestSuccess: true })).toBe(0);
    expect(getDesiredIncomingDamage(ficha, 2, { luckTestSuccess: false })).toBe(2);
  });

  it('sem armadura usa regra clássica de sorte na defesa', () => {
    const ficha = baseFicha();
    expect(getDesiredIncomingDamage(ficha, 2)).toBe(2);
    expect(getDesiredIncomingDamage(ficha, 2, { luckTestSuccess: true })).toBe(1);
    expect(getDesiredIncomingDamage(ficha, 2, { luckTestSuccess: false })).toBe(3);
  });
});
