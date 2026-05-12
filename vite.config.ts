import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // 리액트 컴파일러 플러그인 추가
          ['babel-plugin-react-compiler', { target: '19' }],
        ],
      },
    }),
  ],
  server: {
    // port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['leia-overlearned-deprecatingly.ngrok-free.dev'],
    strictPort: true, // true면 겹칠 때 에러, false면 자동 전환
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 유지 (기본값)
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['leia-overlearned-deprecatingly.ngrok-free.dev'],
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 유지 (기본값)
      },
    },
  },
});