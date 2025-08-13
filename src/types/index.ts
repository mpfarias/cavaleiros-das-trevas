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

