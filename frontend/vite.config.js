import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Разрешаем доступ с внешних IP
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app', // Разрешаем все ngrok домены
      '.ngrok.io', // Альтернативный ngrok домен
    ],
    hmr: {
      clientPort: 443, // Для HTTPS через ngrok
    },
  },
})
