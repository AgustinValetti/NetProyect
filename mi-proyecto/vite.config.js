import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  // Configuración esencial para producción
  base: '/', // Esto es crucial para Vercel
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Opcional para debugging
  },
  // Configuración del servidor (solo para desarrollo)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    historyApiFallback: true // Importante para React Router
  }
})