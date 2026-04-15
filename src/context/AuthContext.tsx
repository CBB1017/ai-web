import {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import type {AuthContextType, UserInfo} from "../constants/constant.ts";

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
                } else {
                    // 세션이 없거나 만료됨
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("Session check failed:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    // 2. 토큰 교환 방식의 로그인
    const login = async (userId: string, password: string) => {
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
        }
 else {
            const errorData = await response.json();
            // 백엔드에서 보낸 에러 구조에 따라 errorData.message 또는 errorData.error 등을 사용
            throw new Error(errorData.error.detail || errorData.message  || '로그인에 실패했습니다.');
        }
    };

    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
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