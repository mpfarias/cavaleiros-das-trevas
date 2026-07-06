import { describeArmorProtection, getArmorAcquisitionNotice, prepareArmorItem } from '../armor';
import type { Item } from '../../types';

const createArmor = (overrides: Partial<Item> = {}): Item => ({
  id: 'armor_1',
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
  ...overrides,
});

describe('armor utils', () => {
  it('deve inicializar durabilidade ao preparar armadura', () => {
    const prepared = prepareArmorItem(createArmor({ durabilidadeAtual: undefined }));
    expect(prepared.durabilidadeAtual).toBe(10);
  });

  it('deve descrever proteção e golpes suportados', () => {
    const text = describeArmorProtection(createArmor({ durabilidadeAtual: 8 }));
    expect(text).toContain('1 ponto');
    expect(text).toContain('10 golpes');
    expect(text).toContain('8 restantes');
    expect(text).toContain('automática');
  });

  it('deve montar aviso de aquisição da armadura', () => {
    const notice = getArmorAcquisitionNotice(createArmor());
    expect(notice).toContain('Armadura de Cota de Malha');
    expect(notice).toContain('removida da bolsa');
  });
});
