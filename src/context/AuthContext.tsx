import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
}

// 1. Context 생성 (외부 노출 X)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provider 컴포넌트 (PascalCase로 정의 및 export)
export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        localStorage.getItem('isLoggedIn') === 'true'
    );

    const login = async (username: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            setIsAuthenticated(true);
        } else {
            // 401 등 실패 시 에러 처리
            throw new Error("Login failed");
        }
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. 커스텀 훅 (camelCase로 export)
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider가 필요합니다.");
    return ctx;
};