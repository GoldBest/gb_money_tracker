import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Загружаем переменные окружения из корневого .env файла
  const env = loadEnv(mode, '../../', '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Передаем переменные окружения в frontend
    envPrefix: 'VITE_',
    // Загружаем переменные из корневого .env
    envDir: '../../',
    server: {
      port: parseInt(env.FRONTEND_PORT) || 5176,
      host: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '*.ngrok-free.app',
        '76497dd1bbc9.ngrok-free.app'
      ],
      proxy: {
        '/api': {
          target: env.BACKEND_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            telegram: ['telegram-web-app']
          }
        }
      }
    },
    // Переменные окружения для frontend
    define: {
      'process.env': env,
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __ENVIRONMENT__: JSON.stringify(mode),
      __BACKEND_URL__: JSON.stringify(env.BACKEND_API_URL || 'http://localhost:3001'),
      __NGROK_URL__: JSON.stringify(env.WEBAPP_URL || ''),
    }
  }
})
