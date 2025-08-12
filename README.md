# A Lenda dos Cavaleiros das Trevas

Um jogo-livro de terror gótico convertido para React + Material UI + TypeScript.

## 🚀 Tecnologias

- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Material UI (MUI) 7** - Biblioteca de componentes React
- **Vite** - Build tool rápida e moderna
- **Emotion** - CSS-in-JS para estilização

## 🎯 Funcionalidades

- **Tela Inicial**: Apresentação do jogo com design gótico
- **Ficha de Personagem**: Sistema completo de atributos (Perícia, Força, Sorte)
- **Sistema de Rolagem**: Dados virtuais para gerar atributos
- **Persistência**: Salvamento automático no localStorage
- **Design Responsivo**: Funciona em dispositivos móveis e desktop
- **Tema Escuro**: Interface gótica com cores apropriadas

## 🎲 Atributos do Personagem

- **PERÍCIA**: Habilidade em combate (1d6 + 6)
- **FORÇA**: Resistência física (2d6 + 12)
- **SORTE**: Fortuna do personagem (1d6 + 6)

## 🛠️ Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

4. **Preview da build**:
   ```bash
   npm run preview
   ```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Home.tsx        # Tela inicial
│   └── CharacterSheet.tsx  # Ficha do personagem
├── types/              # Definições TypeScript
│   └── index.ts        # Interfaces e tipos
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🎨 Design System

- **Cores**: Paleta escura com vermelho sangrento (#B31212) e dourado (#B67B03)
- **Tipografia**: Merriweather para texto, Cinzel para títulos
- **Tema**: Material UI com customizações góticas
- **Responsividade**: Grid system adaptativo para diferentes telas

## 🔮 Próximos Passos

- [ ] Leitor de seções do jogo-livro
- [ ] Motor de combate
- [ ] Sistema de inventário avançado
- [ ] Múltiplos personagens
- [ ] Modo offline com Service Worker

## 📝 Licença

Este projeto é uma conversão do jogo-livro original "A Lenda dos Cavaleiros das Trevas".