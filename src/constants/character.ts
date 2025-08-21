export const ATTRIBUTE_LIMITS = {
  pericia: { min: 0, max: 12 },
  forca: { min: 0, max: 24 },
  sorte: { min: 0, max: 12 }
} as const;

export const DICE_FORMULAS = {
  pericia: { dice: '1d6', bonus: 6, text: 'Definir perícia' },
  forca: { dice: '2d6', bonus: 12, text: 'Definir força' },
  sorte: { dice: '1d6', bonus: 6, text: 'Definir sorte' },
  ouro: { dice: '2d6', bonus: 12, text: '2d6 + 12' }
} as const;

export const NOTIFICATION_CONFIG = {
  autoHideDuration: 4000,
  transition: {
    enter: 300,
    exit: 300
  }
} as const;

export const ITEM_COLORS = {
  arma: '#B31212',
  armadura: '#B67B03',
  ouro: '#dFc810',
  provisao: '#4CAF50',
  equipamento: '#2196F3'
} as const;

export const VALIDATION_MESSAGES = {
  nameRequired: 'Digite um nome para o personagem antes de salvar.',
  nameRequiredStart: 'Digite um nome para o personagem antes de começar.',
  attributesRequired: 'Role PERÍCIA, FORÇA e SORTE antes de começar.',
  goldRequired: 'Role as MOEDAS DE OURO antes de começar.',
  invalidFile: 'Arquivo inválido. Verifique se é um arquivo de ficha válido.',
  fileSaved: 'Ficha salva e baixada como arquivo.',
  fileImported: 'Ficha importada do arquivo.',
  adventureStarted: 'Aventura iniciada! (Próximo passo: leitor de seções e motor de combate.)'
} as const;
