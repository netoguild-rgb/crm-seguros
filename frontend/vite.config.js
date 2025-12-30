import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Isto ajuda a evitar a tela branca com gráficos
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2']
  }
})