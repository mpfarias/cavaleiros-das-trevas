import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    hmr: {
      overlay: false
    }
  },
  build: {
    // Otimizações para evitar problemas de carregamento
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          audio: ['three', 'cannon-es']
        }
      }
    }
  },
  // Previne problemas de cache
  clearScreen: false,
  // Logs mais detalhados em desenvolvimento
  logLevel: 'info'
})
