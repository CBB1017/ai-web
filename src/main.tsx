import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {AuthProvider} from "./context/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // 브라우저 탭 이동 시 자동 재요청 방지
            retry: 1, // API 실패 시 기본 재시도 횟수 축소 (기본값 3은 불필요하게 길 수 있음)
            staleTime: 1000 * 60 * 5, // 5분 동안은 캐시된 데이터를 신선하다고 판단
        },
    },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <App />
              <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
      </AuthProvider>
  </StrictMode>,
)
