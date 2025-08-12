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
  armaduras: string;
  provisoes: number;
  armas: string;
  ouro: number;
  equip: string;
  notas: string;
  encontros: Array<{
    pericia: string;
    forca: string;
  }>;
}

export interface Encontro {
  pericia: string;
  forca: string;
}