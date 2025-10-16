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
      writeBundle() {
        // Copy staticwebapp.config.json to dist folder for Azure Static Web Apps
        try {
          copyFileSync(
            resolve(__dirname, 'staticwebapp.config.json'),
            resolve(__dirname, 'dist/staticwebapp.config.json')
          )
          console.log('✓ Copied staticwebapp.config.json to dist folder')
        } catch (error) {
          console.error('Failed to copy staticwebapp.config.json:', error.message)
          throw error
        }
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
