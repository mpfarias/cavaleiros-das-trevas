import { z } from 'zod'

export interface Item {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'ouro' | 'provisao' | 'equipamento';
  quantidade?: number;
  descricao?: string;
  adquiridoEm?: string;
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
}

// Validação e saneamento de Ficha
export const FichaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').default(''),
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
    quantidade: z.number().int().positive().optional(),
    descricao: z.string().optional(),
    adquiridoEm: z.string().optional(),
  })).default([]),
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
      quantidade: 100,
      descricao: 'Moedas de ouro para compras e transações',
      adquiridoEm: 'Criação do Personagem'
    }
  ],
})

