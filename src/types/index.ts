import { z } from 'zod'

export interface ItemEffects {
  combat?: {
    damage?: number;
    damageType?: 'forca' | 'sorte';
    damageCondition?: string;
  };
  attributes?: {
    pericia?: number;
    forca?: number;
    sorte?: number;
    ataque?: number;
  };
  durability?: number;
  special?: string;
}

export interface Item {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'ouro' | 'provisao' | 'equipamento';
  quantidade?: number;
  descricao?: string;
  adquiridoEm?: string;
  efeitos?: ItemEffects;
  durabilidadeAtual?: number;
}

export interface ActiveModifiers {
  pericia: number;
  forca: number;
  sorte: number;
  ataque: number;
}

export interface Ficha {
  nome: string;
  pericia: {
    inicial: number;
    atual: number;
  };
  forca: {
    inicial: number;
    atual: number;
  };
  sorte: {
    inicial: number;
    atual: number;
  };
  bolsa: Item[];
  modificadoresAtivos: ActiveModifiers;
  flags?: {
    visitedMarketFromSewers?: boolean;
  };
}

// Validação e saneamento de Ficha
export const FichaSchema = z.object({
  nome: z.string().default(''),
  pericia: z.object({
    inicial: z.number().int().nonnegative().default(0),
    atual: z.number().int().nonnegative().default(0),
  }),
  forca: z.object({
    inicial: z.number().int().nonnegative().default(0),
    atual: z.number().int().nonnegative().default(0),
  }),
  sorte: z.object({
    inicial: z.number().int().nonnegative().default(0),
    atual: z.number().int().nonnegative().default(0),
  }),
  bolsa: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    tipo: z.enum(['arma', 'armadura', 'ouro', 'provisao', 'equipamento']),
    quantidade: z.number().int().nonnegative().optional(),
    descricao: z.string().optional(),
    adquiridoEm: z.string().optional(),
    efeitos: z.object({
      combat: z.object({
        damage: z.number().optional(),
        damageType: z.enum(['forca', 'sorte']).optional(),
        damageCondition: z.string().optional(),
      }).optional(),
      attributes: z.object({
        pericia: z.number().optional(),
        forca: z.number().optional(),
        sorte: z.number().optional(),
        ataque: z.number().optional(),
      }).optional(),
      durability: z.number().optional(),
      special: z.string().optional(),
    }).optional(),
    durabilidadeAtual: z.number().optional(),
  })).default([]),
  modificadoresAtivos: z.object({
    pericia: z.number().default(0),
    forca: z.number().default(0),
    sorte: z.number().default(0),
    ataque: z.number().default(0),
  }).default({
    pericia: 0,
    forca: 0,
    sorte: 0,
    ataque: 0,
  }),
  flags: z.object({
    visitedMarketFromSewers: z.boolean().optional()
  }).partial().optional(),
}).strict()

export const createEmptyFicha = (): Ficha => ({
  nome: '',
  pericia: { inicial: 0, atual: 0 },
  forca: { inicial: 0, atual: 0 },
  sorte: { inicial: 0, atual: 0 },
  bolsa: [
    {
      id: 'espada_inicial',
      nome: 'Espada de Aço',
      tipo: 'arma',
      descricao: 'Espada básica de aço, arma padrão de todo cavaleiro',
      adquiridoEm: 'Criação do Personagem'
    },
    {
      id: 'ouro_inicial',
      nome: 'Moedas de Ouro',
      tipo: 'ouro',
      quantidade: 20,
      descricao: 'Moedas de ouro para suas aventuras',
      adquiridoEm: 'Criação do Personagem'
    }
  ],
  modificadoresAtivos: {
    pericia: 0,
    forca: 0,
    sorte: 0,
    ataque: 0
  }
})

// Função para criar ficha realmente vazia (sem moedas)
export const createTrulyEmptyFicha = (): Ficha => ({
  nome: '',
  pericia: { inicial: 0, atual: 0 },
  forca: { inicial: 0, atual: 0 },
  sorte: { inicial: 0, atual: 0 },
  bolsa: [
    {
      id: 'espada_inicial',
      nome: 'Espada de Aço',
      tipo: 'arma',
      descricao: 'Espada básica de aço, arma padrão de todo cavaleiro',
      adquiridoEm: 'Criação do Personagem'
    }
  ],
  modificadoresAtivos: {
    pericia: 0,
    forca: 0,
    sorte: 0,
    ataque: 0
  }
})

