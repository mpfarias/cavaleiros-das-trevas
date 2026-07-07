/**
 * Temas visuais para telas do jogo
 * 
 * Cada tema define estilos para os componentes principais das telas:
 * - Container: Fundo da tela
 * - CardWrap: Card principal com o conteúdo
 * - NarrativeText: Texto narrativo
 * - ChoiceButton: Botões de escolha
 * - LocationLink: Links de locais (hover de imagens)
 * - HoverImage: Estilo da imagem de hover
 */

export interface ScreenTheme {
  container: {
    background: string;
  };
  cardWrap: {
    background: string;
    border: string;
    borderRadius: string;
    boxShadow: string;
  };
  narrativeText: {
    color: string;
    textShadow: string;
  };
  choiceButton: {
    background: string;
    color: string;
    border: string;
    textShadow: string;
    boxShadow: string;
    hoverBackground: string;
    hoverBorderColor: string;
    hoverTextShadow: string;
    hoverBoxShadow: string;
  };
  locationLink: {
    color: string;
    hoverColor: string;
    textShadow: string;
    hoverTextShadow: string;
  };
  hoverImage: {
    border: string;
    boxShadow: string;
  };
}

/**
 * Tema Templo
 * 
 * Tema místico e sagrado com tons de azul claro e mágico.
 * Ideal para telas relacionadas a templos, lugares sagrados e rituais.
 * 
 * Cores principais:
 * - Fundo: Tons de azul claro/céu místico
 * - Card: Azul muito claro e branco azulado
 * - Acentos: Azul mágico (#5F9EA0, #87CEEB, #B0E0E6, #E0F6FF)
 */
export const TEMPLE_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #4a6fa5 0%, #5a8fb5 25%, #6aa5c5 50%, #5a8fb5 75%, #4a7fa5 100%),
      radial-gradient(circle at 30% 30%, rgba(176,224,230,0.25) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(135,206,235,0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(224,255,255,0.1) 0%, transparent 70%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(240,248,255,0.98) 0%, rgba(230,240,250,0.95) 25%, rgba(240,248,255,0.98) 50%, rgba(235,245,255,0.95) 75%, rgba(240,248,255,0.98) 100%)
    `,
    border: '3px solid #5F9EA0',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.5),
      0 0 0 1px rgba(95,158,160,0.3),
      0 0 20px rgba(176,224,230,0.2)
    `
  },
  narrativeText: {
    color: '#1e3a5f',
    textShadow: '0 1px 2px rgba(255,255,255,0.7)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(95,158,160,0.85) 0%, rgba(135,206,235,0.75) 50%, rgba(95,158,160,0.85) 100%)',
    color: '#FFFFFF',
    border: '2px solid #5F9EA0',
    textShadow: '0 1px 2px rgba(0,0,0,0.5), 0 0 8px rgba(176,224,230,0.4)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 10px rgba(135,206,235,0.3)',
    hoverBackground: 'linear-gradient(135deg, rgba(135,206,235,0.95) 0%, rgba(176,224,230,0.85) 50%, rgba(135,206,235,0.95) 100%)',
    hoverBorderColor: '#87CEEB',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 12px rgba(176,224,230,0.6)',
    hoverBoxShadow: '0 8px 25px rgba(95,158,160,0.5), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px rgba(176,224,230,0.5)'
  },
  locationLink: {
    color: '#4682B4',
    hoverColor: '#5F9EA0',
    textShadow: '0 0 4px rgba(176,224,230,0.5)',
    hoverTextShadow: '0 0 8px rgba(135,206,235,0.7)'
  },
  hoverImage: {
    border: '3px solid #5F9EA0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(176,224,230,0.4)'
  }
} as const;

/**
 * Tema Esgotos
 * 
 * Tema sombrio e úmido com tons de verde escuro e preto.
 * Ideal para telas relacionadas a esgotos, túneis subterrâneos e criaturas das profundezas.
 * 
 * Cores principais:
 * - Fundo: Verde escuro/preto (#1a1a1a, #0d3d0d, #1a3d1a)
 * - Card: Verde muito claro/verde musgo (rgba(240,255,240,0.98))
 * - Acentos: Verde (#228B22, #32CD32, #006400)
 */
export const SEWERS_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #1a1a1a 0%, #0d3d0d 25%, #1a3d1a 50%, #0d1a0d 75%, #000000 100%),
      radial-gradient(circle at 30% 30%, rgba(0,100,0,0.2) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(50,50,50,0.3) 0%, transparent 50%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(240,255,240,0.98) 0%, rgba(230,250,230,0.95) 25%, rgba(240,255,240,0.98) 50%, rgba(235,252,235,0.95) 75%, rgba(240,255,240,0.98) 100%)
    `,
    border: '3px solid #228B22',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.5),
      0 0 0 1px rgba(34,139,34,0.4),
      0 0 20px rgba(34,139,34,0.1)
    `
  },
  narrativeText: {
    color: '#1a3d1a',
    textShadow: '0 1px 2px rgba(255,255,255,0.7)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(34,139,34,0.85) 0%, rgba(0,100,0,0.75) 50%, rgba(34,139,34,0.85) 100%)',
    color: '#F0FFF0',
    border: '2px solid #228B22',
    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(144,238,144,0.3)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 10px rgba(34,139,34,0.3)',
    hoverBackground: 'linear-gradient(135deg, rgba(50,205,50,0.95) 0%, rgba(144,238,144,0.85) 50%, rgba(50,205,50,0.95) 100%)',
    hoverBorderColor: '#32CD32',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 12px rgba(144,238,144,0.5)',
    hoverBoxShadow: '0 8px 25px rgba(34,139,34,0.5), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 20px rgba(144,238,144,0.4)'
  },
  locationLink: {
    color: '#228B22',
    hoverColor: '#32CD32',
    textShadow: '0 0 4px rgba(144,238,144,0.4)',
    hoverTextShadow: '0 0 8px rgba(50,205,50,0.6)'
  },
  hoverImage: {
    border: '3px solid #228B22',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(34,139,34,0.3)'
  }
} as const;

/**
 * Tema Prisão/Masmorras
 * 
 * Tema escuro e opressivo com tons de preto e cinza profundo.
 * Ideal para telas relacionadas a prisões, masmorras e lugares de encarceramento.
 * 
 * Cores principais:
 * - Fundo: Preto/cinza muito escuro (#1a1a1a, #2d2d2d, #1f1f1f, #0d0d0d, #000000)
 * - Card: Padrão bege (mantido para legibilidade)
 * - Acentos: Cinza escuro (rgba(70,70,80,0.3))
 */
export const PRISON_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #0d0d0d 75%, #000000 100%),
      radial-gradient(circle at 30% 30%, rgba(70,70,80,0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(50,50,60,0.2) 0%, transparent 50%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
    `,
    border: '3px solid #696969',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.3),
      0 0 0 1px rgba(105,105,105,0.4),
      0 0 20px rgba(105,105,105,0.1)
    `
  },
  narrativeText: {
    color: '#3d2817',
    textShadow: '0 1px 2px rgba(245,222,179,0.8)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(64,64,64,0.85) 0%, rgba(105,105,105,0.75) 50%, rgba(64,64,64,0.85) 100%)',
    color: '#E8E8E8',
    border: '2px solid #696969',
    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(169,169,169,0.3)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 10px rgba(105,105,105,0.2)',
    hoverBackground: 'linear-gradient(135deg, rgba(105,105,105,0.95) 0%, rgba(169,169,169,0.85) 50%, rgba(105,105,105,0.95) 100%)',
    hoverBorderColor: '#A9A9A9',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 12px rgba(211,211,211,0.5)',
    hoverBoxShadow: '0 8px 25px rgba(64,64,64,0.6), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(169,169,169,0.4)'
  },
  locationLink: {
    color: '#696969',
    hoverColor: '#A9A9A9',
    textShadow: '0 0 4px rgba(169,169,169,0.4)',
    hoverTextShadow: '0 0 8px rgba(211,211,211,0.6)'
  },
  hoverImage: {
    border: '3px solid #696969',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(105,105,105,0.3)'
  }
} as const;

/**
 * Tema Cavaleiros das Trevas
 * 
 * Tema extremamente sombrio e ameaçador com tons de preto profundo, roxo enegrecido e vermelho sinistro.
 * Ideal para telas relacionadas aos Cavaleiros das Trevas, eventos místicos sombrios e confrontos épicos.
 * 
 * Cores principais:
 * - Fundo: Preto absoluto com toques de roxo/vermelho muito escuros
 * - Card: Preto quase absoluto com bordas roxas/vermelhas brilhantes
 * - Acentos: Roxo enegrecido e vermelho sinistro brilhante
 */
export const DARK_KNIGHTS_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #000000 0%, #0a0510 25%, #050208 50%, #080410 75%, #000000 100%),
      radial-gradient(circle at 30% 30%, rgba(75,0,130,0.2) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(139,0,0,0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(0,0,0,0.8) 0%, transparent 60%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(5,0,10,0.98) 0%, rgba(10,0,15,0.97) 25%, rgba(8,0,12,0.98) 50%, rgba(12,0,18,0.97) 75%, rgba(5,0,10,0.98) 100%),
      radial-gradient(circle at 50% 50%, rgba(75,0,130,0.15) 0%, transparent 70%),
      radial-gradient(circle at 20% 80%, rgba(139,0,0,0.08) 0%, transparent 50%)
    `,
    border: '3px solid #4B0082',
    borderRadius: '16px',
    boxShadow: `
      0 15px 50px rgba(0,0,0,1),
      inset 0 1px 0 rgba(75,0,130,0.4),
      inset 0 -1px 0 rgba(139,0,0,0.3),
      0 0 0 2px rgba(75,0,130,0.6),
      0 0 40px rgba(75,0,130,0.5),
      0 0 60px rgba(139,0,0,0.2),
      inset 0 0 80px rgba(0,0,0,0.8)
    `
  },
  narrativeText: {
    color: '#D8D8D8',
    textShadow: '0 2px 6px rgba(0,0,0,1), 0 0 10px rgba(75,0,130,0.6), 0 0 15px rgba(139,0,0,0.4)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(25,0,40,0.95) 0%, rgba(40,0,60,0.9) 50%, rgba(25,0,40,0.95) 100%)',
    color: '#E0E0E0',
    border: '2px solid #4B0082',
    textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 10px rgba(75,0,130,0.7), 0 0 12px rgba(139,0,0,0.5)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(75,0,130,0.3), inset 0 -1px 0 rgba(139,0,0,0.2), 0 0 15px rgba(75,0,130,0.5), 0 0 25px rgba(139,0,0,0.3)',
    hoverBackground: 'linear-gradient(135deg, rgba(50,0,75,0.98) 0%, rgba(75,0,100,0.95) 50%, rgba(50,0,75,0.98) 100%)',
    hoverBorderColor: '#6A0DAD',
    hoverTextShadow: '0 2px 6px rgba(0,0,0,1), 0 0 15px rgba(75,0,130,0.9), 0 0 20px rgba(139,0,0,0.7)',
    hoverBoxShadow: '0 10px 35px rgba(0,0,0,0.9), inset 0 1px 0 rgba(75,0,130,0.5), inset 0 -1px 0 rgba(139,0,0,0.4), 0 0 25px rgba(75,0,130,0.8), 0 0 40px rgba(139,0,0,0.5)'
  },
  locationLink: {
    color: '#9370DB',
    hoverColor: '#BA55D3',
    textShadow: '0 0 8px rgba(75,0,130,0.8), 0 0 12px rgba(139,0,0,0.5)',
    hoverTextShadow: '0 0 12px rgba(75,0,130,1), 0 0 18px rgba(139,0,0,0.8), 0 0 25px rgba(186,85,211,0.7)'
  },
  hoverImage: {
    border: '3px solid #4B0082',
    boxShadow: '0 10px 40px rgba(0,0,0,1), 0 0 30px rgba(75,0,130,0.6), 0 0 50px rgba(139,0,0,0.4)'
  }
} as const;

/**
 * Tema Laboratório do Mago
 * 
 * Tema místico e mágico com tons de roxo, violeta e índigo.
 * Ideal para telas relacionadas a laboratórios de magos, salas de estudo mágico e ambientes de alquimia.
 * 
 * Cores principais:
 * - Fundo: Roxo/violeta escuro com toques de índigo (#2d1b3d, #3d2555, #4B0082, #483D8B)
 * - Card: Roxo/violeta claro com tons de lavanda (rgba(230,220,250,0.98))
 * - Acentos: Roxo mágico (#6A0DAD, #9370DB, #BA55D3, #8A2BE2)
 */
export const WIZARD_ROOM_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #1a0d26 0%, #2d1b3d 25%, #3d2555 50%, #2d1b3d 75%, #1a0d26 100%),
      radial-gradient(circle at 30% 30%, rgba(106,13,173,0.25) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(147,112,219,0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(75,0,130,0.15) 0%, transparent 70%),
      radial-gradient(circle at 20% 80%, rgba(138,43,226,0.1) 0%, transparent 50%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(240,230,255,0.98) 0%, rgba(230,220,250,0.95) 25%, rgba(245,235,255,0.98) 50%, rgba(235,225,250,0.95) 75%, rgba(240,230,255,0.98) 100%),
      radial-gradient(circle at 50% 50%, rgba(147,112,219,0.08) 0%, transparent 70%)
    `,
    border: '3px solid #9370DB',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.6),
      0 0 0 1px rgba(147,112,219,0.4),
      0 0 20px rgba(106,13,173,0.3),
      0 0 30px rgba(147,112,219,0.2)
    `
  },
  narrativeText: {
    color: '#2d1b3d',
    textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(147,112,219,0.2)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(106,13,173,0.85) 0%, rgba(147,112,219,0.75) 50%, rgba(106,13,173,0.85) 100%)',
    color: '#F5F0FF',
    border: '2px solid #BA55D3',
    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(186,85,211,0.4)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 10px rgba(106,13,173,0.4), 0 0 15px rgba(147,112,219,0.3)',
    hoverBackground: 'linear-gradient(135deg, rgba(147,112,219,0.95) 0%, rgba(186,85,211,0.85) 50%, rgba(147,112,219,0.95) 100%)',
    hoverBorderColor: '#DA70D6',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 12px rgba(186,85,211,0.6), 0 0 18px rgba(218,112,214,0.5)',
    hoverBoxShadow: '0 8px 25px rgba(106,13,173,0.5), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px rgba(147,112,219,0.5), 0 0 30px rgba(186,85,211,0.4)'
  },
  locationLink: {
    color: '#6A0DAD',
    hoverColor: '#9370DB',
    textShadow: '0 0 4px rgba(147,112,219,0.5)',
    hoverTextShadow: '0 0 8px rgba(186,85,211,0.7), 0 0 12px rgba(218,112,214,0.5)'
  },
  hoverImage: {
    border: '3px solid #9370DB',
    boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(106,13,173,0.4), 0 0 30px rgba(147,112,219,0.3)'
  }
} as const;

/**
 * Tema Floresta
 *
 * Tons verdes naturais de floresta e folhagem, com luz dourada filtrada pelas copas.
 * Distinto do tema de esgotos: sem preto absoluto nem verde menta/neon úmido.
 *
 * Cores principais:
 * - Fundo: Verde-floresta profundo com toques de musgo e marrom-terra
 * - Card: Pergaminho quente (bege) com bordas oliva
 * - Acentos: Oliva, musgo e verde folha (#556B2F, #6B8E23, #8FBC8F)
 */
export const FOREST_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #1a2e14 0%, #2d4a22 25%, #3a5c2e 50%, #2a4520 75%, #1e3218 100%),
      radial-gradient(circle at 25% 20%, rgba(218,165,32,0.12) 0%, transparent 45%),
      radial-gradient(circle at 75% 65%, rgba(107,142,35,0.18) 0%, transparent 50%),
      radial-gradient(circle at 50% 90%, rgba(85,107,47,0.15) 0%, transparent 40%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(250,245,230,0.97) 0%, rgba(240,235,210,0.94) 50%, rgba(235,228,200,0.96) 100%)
    `,
    border: '3px solid #6B8E23',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.45),
      0 0 0 1px rgba(85,107,47,0.35),
      0 0 18px rgba(107,142,35,0.15)
    `
  },
  narrativeText: {
    color: '#2f3d1a',
    textShadow: '0 1px 2px rgba(250,245,230,0.8)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(85,107,47,0.9) 0%, rgba(107,142,35,0.82) 100%)',
    color: '#F5F5DC',
    border: '2px solid #8FBC8F',
    textShadow: '0 1px 2px rgba(0,0,0,0.7)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
    hoverBackground: 'linear-gradient(135deg, rgba(107,142,35,0.95) 0%, rgba(143,188,143,0.88) 100%)',
    hoverBorderColor: '#DAA520',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(218,165,32,0.35)',
    hoverBoxShadow: '0 8px 25px rgba(85,107,47,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  locationLink: {
    color: '#556B2F',
    hoverColor: '#6B8E23',
    textShadow: '0 0 2px rgba(218,165,32,0.25)',
    hoverTextShadow: '0 0 6px rgba(107,142,35,0.5)'
  },
  hoverImage: {
    border: '3px solid #6B8E23',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(107,142,35,0.25)'
  }
} as const;

/**
 * Tema Padrão (Default)
 * 
 * Tema clássico medieval com tons de marrom e bege.
 * Usado como padrão para a maioria das telas do jogo.
 * 
 * Cores principais:
 * - Fundo: Marrom escuro (#2c1810, #4a2c1a, #3d1f12)
 * - Card: Bege/marrom claro (rgba(245,222,179,0.95))
 * - Acentos: Marrom (#8B4513, #D2B48C)
 */
export const DEFAULT_THEME: ScreenTheme = {
  container: {
    background: `
      linear-gradient(135deg, #2c1810 0%, #4a2c1a 25%, #3d1f12 50%, #2c1810 75%, #1a0f08 100%),
      radial-gradient(circle at 30% 30%, rgba(139,69,19,0.2) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(160,82,45,0.1) 0%, transparent 50%)
    `
  },
  cardWrap: {
    background: `
      linear-gradient(135deg, rgba(245,222,179,0.95) 0%, rgba(222,184,135,0.9) 50%, rgba(205,133,63,0.95) 100%)
    `,
    border: '3px solid #8B4513',
    borderRadius: '16px',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.3),
      0 0 0 1px rgba(139,69,19,0.4)
    `
  },
  narrativeText: {
    color: '#3d2817',
    textShadow: '0 1px 2px rgba(245,222,179,0.8)'
  },
  choiceButton: {
    background: 'linear-gradient(135deg, rgba(139,69,19,0.9) 0%, rgba(160,82,45,0.8) 100%)',
    color: '#F5DEB3',
    border: '2px solid #D2B48C',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    hoverBackground: 'linear-gradient(135deg, rgba(179,18,18,0.9) 0%, rgba(139,0,0,0.8) 100%)',
    hoverBorderColor: '#FFD700',
    hoverTextShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(255,215,0,0.5)',
    hoverBoxShadow: '0 8px 25px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  locationLink: {
    color: '#8B4513',
    hoverColor: '#A0522D',
    textShadow: '0 0 2px rgba(210,180,140,0.5)',
    hoverTextShadow: '0 0 4px rgba(160,82,45,0.7)'
  },
  hoverImage: {
    border: '3px solid #8B4513',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
  }
} as const;

// Tipo para identificar qual tema usar
export type ThemeName = 'default' | 'temple' | 'sewers' | 'prison' | 'dark-knights' | 'wizard-room' | 'forest';

// Mapeamento de telas para temas
export const SCREEN_THEMES: Record<number | string, ThemeName> = {
  // Tema Templo
  164: 'temple',
  254: 'temple',
  380: 'temple',
  332: 'temple',
  264: 'temple',
  
  // Tema Esgotos
  70: 'sewers',
  154: 'sewers',
  250: 'sewers',
  170: 'sewers',
  180: 'sewers',
  356: 'sewers',
  375: 'sewers',
  
  // Tema Prisão
  7: 'prison',
  38: 'prison',
  123: 'prison',
  199: 'prison',
  208: 'prison',
  233: 'prison',
  
  // Tema Cavaleiros das Trevas
  8: 'dark-knights',
  145: 'dark-knights',
  183: 'dark-knights',
  190: 'dark-knights',
  245: 'dark-knights',
  259: 'dark-knights',
  279: 'dark-knights',
  306: 'dark-knights',
  335: 'dark-knights',
  394: 'dark-knights',
  
  // Tema Laboratório do Mago (Santuário de Hegmar)
  10: 'wizard-room',
  105: 'wizard-room',
  147: 'wizard-room',
  193: 'wizard-room',
  312: 'wizard-room',

  // Tema Floresta (viagem / região do eremita)
  113: 'forest',
  194: 'forest',

  // Tema Floresta (João Verdesfolhas e caminho ao sul)
  11: 'forest',
  382: 'forest',
  398: 'forest',

  // Cabana do eremita — tema padrão marrom (349 não listada de propósito)

  // Todas as outras telas usam o tema padrão (não precisa listar todas)
};

// Função para obter o tema de uma tela
export const getScreenTheme = (screenId: number | string): ScreenTheme => {
  const themeName = SCREEN_THEMES[screenId] || 'default';
  
  switch (themeName) {
    case 'temple':
      return TEMPLE_THEME;
    case 'sewers':
      return SEWERS_THEME;
    case 'prison':
      return PRISON_THEME;
    case 'dark-knights':
      return DARK_KNIGHTS_THEME;
    case 'wizard-room':
      return WIZARD_ROOM_THEME;
    case 'forest':
      return FOREST_THEME;
    case 'default':
    default:
      return DEFAULT_THEME;
  }
};
