// Mock simples do localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  },
  writable: true,
});

// Mock simples do AudioContext
Object.defineProperty(window, 'AudioContext', {
  value: () => ({}),
  writable: true,
});

// Mock simples do HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  value: () => Promise.resolve(),
  writable: true,
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  value: () => Promise.resolve(),
  writable: true,
});

// Mock simples do IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock simples do ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock simples do matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
  writable: true,
});

// Limpeza global após cada teste
afterEach(() => {
  // Limpa todos os mocks
  jest.clearAllMocks();
  
  // Limpa timers ativos
  jest.clearAllTimers();
  
  // Limpa localStorage mock
  if (window.localStorage) {
    window.localStorage.clear();
  }
  
  // Limpa event listeners
  window.removeEventListener = jest.fn();
  window.addEventListener = jest.fn();
});

// Limpeza global após todos os testes
afterAll(() => {
  // Restaura todos os mocks
  jest.restoreAllMocks();
  
  // Limpa timers
  jest.clearAllTimers();
  
  // Força garbage collection (se disponível)
  if (global.gc) {
    global.gc();
  }
});
