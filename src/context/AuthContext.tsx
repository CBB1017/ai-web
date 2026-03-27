import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 💡 유저 정보 타입 정의
interface UserInfo {
    username: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null; // 💡 유저 객체 추가
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/check', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json(); // 💡 백엔드에서 보낸 JSON 파싱
                    setUser({ username: data.username }); // 상태에 저장
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (username: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            setUser({ username }); // 로그인 성공 시 상태 업데이트
            setIsAuthenticated(true);
        } else {
            throw new Error("Login failed");
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setUser(null); // 💡 로그아웃 시 정보 날림
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider가 필요합니다.");
    return ctx;
};