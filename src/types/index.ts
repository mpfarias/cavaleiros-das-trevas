import { z } from 'zod'

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
  armaduras: string;
  provisoes: number;
  armas: string;
  ouro: number;
  equip: string;
  notas: string;

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
  armaduras: z.string().default(''),
  provisoes: z.number().int().nonnegative().default(0),
  armas: z.string().default(''),
  ouro: z.number().int().nonnegative().default(0),
  equip: z.string().default(''),
  notas: z.string().default(''),
}).strict()

export const createEmptyFicha = (): Ficha => ({
  nome: '',
  pericia: { inicial: 0, atual: 0 },
  forca: { inicial: 0, atual: 0 },
  sorte: { inicial: 0, atual: 0 },
  armaduras: '',
  provisoes: 0,
  armas: '',
  ouro: 0,
  equip: '',
  notas: '',
})

