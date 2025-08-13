import { z } from 'zod'

export interface Item {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'ouro' | 'provisao' | 'equipamento';
  quantidade?: number;
  descricao?: string;
  adquiridoEm?: string; // Seção onde foi obtido
}

export interface Ficha {
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
  pericia: { inicial: 0, atual: 0 },
  forca: { inicial: 0, atual: 0 },
  sorte: { inicial: 0, atual: 0 },
  bolsa: [],
})

