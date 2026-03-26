import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom)/,
              priority: 20,
            },
            {
              name: 'three',
              test: /node_modules[\\/]three/,
              priority: 15,
            },
            {
              name: 'fiber',
              test: /node_modules[\\/]@react-three[\\/]fiber/,
              priority: 14,
            },
            {
              name: 'drei',
              test: /node_modules[\\/]@react-three[\\/]drei/,
              priority: 13,
            },
            {
              name: 'useControls',
              test: /node_modules[\\/]leva/,
              priority: 12,
            },
            {
              name: 'postprocessing',
              test: /node_modules[\\/]@react-three[\\/]postprocessing/,
              priority: 11,
            },
          ],
        },
      }
    }
  }


})
