import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-staticwebapp-config',
      closeBundle() {
        // Copy staticwebapp.config.json to dist folder for Azure Static Web Apps
        copyFileSync(
          resolve(__dirname, 'staticwebapp.config.json'),
          resolve(__dirname, 'dist/staticwebapp.config.json')
        )
      }
    }
  ],
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  }
})
