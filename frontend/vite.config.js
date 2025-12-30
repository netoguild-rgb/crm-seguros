import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ESTA É A CHAVE QUE FALTA PARA OS GRÁFICOS FUNCIONAREM:
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2']
  },
  server: {
    host: true // Permite acesso externo se necessário
  }
})