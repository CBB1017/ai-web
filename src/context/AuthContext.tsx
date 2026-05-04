import {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import type {AuthContextType, UserInfo} from "../constants/constant.ts";
import { logInfo, logError } from "../otel.ts";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserInfo | null>(null);

    // 1. 페이지 로드 시 기존 세션(토큰) 확인
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/check', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser({
                        username: data.username || data.name || 'User',
                        email: data.email,
                        dept: data.dept,
                        position: data.position
                    });
                    setIsAuthenticated(true);
                    logInfo("Session check: Authenticated", { username: data.username });
                } else {
                    // 세션이 없거나 만료됨
                    setIsAuthenticated(false);
                    setUser(null);
                    
                    if (res.status === 502 || res.status === 503) {
                        logError("Session check: Backend unavailable", new Error(`HTTP ${res.status}`), { status: res.status });
                    } else {
                        logInfo("Session check: No active session", { status: res.status });
                    }
                }
            } catch (error: any) {
                logError("Session check: Network error", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    // 2. 토큰 교환 방식의 로그인
    const login = async (userId: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId, password}),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.token); // 우리 JWT 저장
                setUser({
                    username: data.username || data.name || 'User',
                    email: data.email,
                    dept: data.dept,
                    position: data.position
                });
                setIsAuthenticated(true);
                logInfo("Login: Success", { userId });
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // JSON 파싱 실패 (e.g. 502 HTML 에러 페이지)
                    const error: any = new Error('서버 응답 처리 중 오류가 발생했습니다.');
                    error.status = response.status;
                    logError("Login: Non-JSON error response", error, { status: response.status, userId });
                    throw error;
                }
                
                const error: any = new Error(errorData.error?.detail || errorData.message || '로그인에 실패했습니다.');
                error.status = response.status;
                logError("Login: Failed", error, { status: response.status, userId });
                throw error;
            }
        } catch (error: any) {
            // 네트워크 에러 (서버 다운 등)
            if (!error.status) {
                error.status = 503; // Service Unavailable로 간주
            }
            logError("Login: Exception", error, { userId });
            throw error;
        }
    };

    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
            logInfo("Logout: Success", { username: user?.username });
        } catch (error: any) {
            logError("Logout: Failed", error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, isLoading, user, login, logout}}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider가 필요합니다.");
    return ctx;
};