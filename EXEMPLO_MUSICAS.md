# 🎵 Sistema de Áudio Global - Como Usar

## 📋 **Visão Geral**

Implementei um **sistema de áudio global** que permite:
- ✅ **Música contínua** entre todas as telas
- ✅ **Troca automática** de músicas para cada tela
- ✅ **Controles unificados** (play/pause, volume, mute)
- ✅ **Persistência de estado** (volume, mute, play/pause)

## 🏗️ **Arquitetura**

```
App.tsx (AudioProvider)
├── Home.tsx (música: bgm-modal.mp3)
├── CharacterSheet.tsx (música: bgm-modal.mp3)
└── Futuras telas...
```

## 🎯 **Como Funciona**

### **1. Contexto Global (`AudioContext`)**
- Gerencia o estado de áudio em toda a aplicação
- Controla play/pause, volume, mute
- Gerencia troca de músicas entre telas

### **2. Hook Personalizado (`useAudio`)**
- Fornece acesso fácil ao contexto de áudio
- Inclui todas as funções de controle

### **3. Componente de Controles (`AudioControls`)**
- Interface visual para controlar o áudio
- Aparece em todas as telas
- Posicionamento fixo no canto superior direito

## 🚀 **Como Usar em Novas Telas**

### **Passo 1: Importar o Hook**
```tsx
import { useAudio } from '../hooks/useAudio';
```

### **Passo 2: Usar o Hook**
```tsx
const { changeTrack } = useAudio();

// Carregar música específica da tela
useEffect(() => {
  changeTrack('/caminho/para/musica.mp3');
}, [changeTrack]);
```

### **Passo 3: Adicionar Controles**
```tsx
import AudioControls from './AudioControls';

// No final do componente, antes do fechamento
return (
  <Box>
    {/* Conteúdo da tela */}
    
    {/* Controles de música */}
    <AudioControls />
  </Box>
);
```

## 🎵 **Exemplo de Implementação**

### **Tela de Batalha (exemplo)**
```tsx
import { useAudio } from '../hooks/useAudio';
import AudioControls from './AudioControls';
import musicaBatalha from '../assets/sounds/battle-theme.mp3';

const BattleScreen: React.FC = () => {
  const { changeTrack } = useAudio();
  
  // Carrega música de batalha quando a tela abre
  useEffect(() => {
    changeTrack(musicaBatalha);
  }, [changeTrack]);
  
  return (
    <Box>
      {/* Interface de batalha */}
      
      {/* Controles de música */}
      <AudioControls />
    </Box>
  );
};
```

### **Tela de Inventário (exemplo)**
```tsx
import { useAudio } from '../hooks/useAudio';
import AudioControls from './AudioControls';
import musicaInventario from '../assets/sounds/inventory-theme.mp3';

const InventoryScreen: React.FC = () => {
  const { changeTrack } = useAudio();
  
  // Carrega música de inventário quando a tela abre
  useEffect(() => {
    changeTrack(musicaInventario);
  }, [changeTrack]);
  
  return (
    <Box>
      {/* Interface de inventário */}
      
      {/* Controles de música */}
      <AudioControls />
    </Box>
  );
};
```

## 🔧 **Funções Disponíveis**

### **Estado**
- `isPlaying`: boolean - Se a música está tocando
- `isMuted`: boolean - Se está mutado
- `volume`: number - Volume atual (0-1)
- `currentTrack`: string - Música atual
- `autoplayBlocked`: boolean - Se autoplay foi bloqueado

### **Controles**
- `play()`: Promise<void> - Toca a música
- `pause()`: void - Pausa a música
- `togglePlay()`: Promise<void> - Alterna play/pause
- `toggleMute()`: void - Alterna mute
- `setVolume(volume: number)`: void - Define volume
- `changeTrack(trackSrc: string)`: Promise<void> - Troca música
- `tryStartMusic()`: Promise<void> - Tenta iniciar após interação

## 📁 **Estrutura de Arquivos**

```
src/
├── contexts/
│   ├── AudioContextDef.ts     # Definição do contexto
│   └── AudioContext.tsx       # Provider do contexto
├── hooks/
│   └── useAudio.ts            # Hook personalizado
├── components/
│   ├── AudioControls.tsx      # Controles visuais
│   ├── Home.tsx               # Tela inicial
│   └── CharacterSheet.tsx     # Ficha do personagem
└── assets/
    └── sounds/
        ├── bgm-modal.mp3      # Música da tela inicial
        ├── battle-theme.mp3   # Música de batalha (futuro)
        └── inventory-theme.mp3 # Música de inventário (futuro)
```

## 🎭 **Vantagens do Sistema**

### **Para o Usuário:**
- ✅ Música nunca para entre telas
- ✅ Controles sempre acessíveis
- ✅ Volume e mute persistem
- ✅ Experiência imersiva contínua

### **Para o Desenvolvedor:**
- ✅ Fácil implementação em novas telas
- ✅ Controle centralizado do áudio
- ✅ Reutilização de componentes
- ✅ Manutenção simplificada

## 🚨 **Limitações dos Navegadores**

### **Autoplay Bloqueado:**
- Chrome, Firefox, Safari bloqueiam autoplay por padrão
- Usuário precisa interagir primeiro (clique em qualquer lugar)
- Sistema detecta automaticamente e mostra indicador visual
- Após primeira interação, música funciona normalmente

### **Solução Implementada:**
- ✅ Tentativa de autoplay automático
- ✅ Fallback para interação do usuário
- ✅ Indicador visual quando bloqueado
- ✅ Ativação automática após interação

## 🔮 **Futuras Melhorias**

### **Músicas por Tela:**
- [ ] Música de batalha para combates
- [ ] Música de inventário para gerenciamento
- [ ] Música de cidade para áreas urbanas
- [ ] Música de floresta para áreas naturais

### **Sistema de Transições:**
- [ ] Fade in/out entre músicas
- [ ] Crossfade suave
- [ ] Transições baseadas em eventos

### **Controle Avançado:**
- [ ] Playlist automática
- [ ] Músicas condicionais (baseadas em eventos)
- [ ] Sistema de prioridade de áudio

---

## 📝 **Resumo**

O sistema de áudio global está **100% funcional** e permite:

1. **Música contínua** em todas as telas
2. **Troca automática** de músicas por tela
3. **Controles unificados** sempre visíveis
4. **Fácil implementação** em novas telas
5. **Tratamento inteligente** de limitações de navegador

Para adicionar música a uma nova tela, basta:
1. Importar `useAudio`
2. Usar `changeTrack()` no `useEffect`
3. Adicionar `<AudioControls />`

**A música nunca para, o usuário sempre tem controle, e a experiência é imersiva!** 🎵✨
