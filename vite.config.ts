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
    // port: 3000,
    strictPort: true, // true면 겹칠 때 에러, false면 자동 전환
    proxy: {
      '/api': 'http://localhost:8080', // Spring Boot 연결 설정
    },
  },
});