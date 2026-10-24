import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// O app é publicado em https://amkimura2011.github.io/cronometro-hiit/
// e o base precisa bater com o nome do repositório.
export default defineConfig({
  base: '/cronometro-hiit/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'sounds/aplausos.mp3'],
      manifest: {
        name: 'Cronômetro HIIT',
        short_name: 'HIIT',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f3f2f2',
        theme_color: '#f3f2f2',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // fontes (woff2) e aplausos entram no cache para o app funcionar offline
        globPatterns: ['**/*.{js,css,html,png,woff2,mp3}'],
      },
    }),
  ],
})
