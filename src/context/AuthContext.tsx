import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 💡 백엔드 User 엔티티와 동기화된 유저 정보 타입
interface UserInfo {
    username: string; // 이름 (문병찬)
    email: string;    // 이메일 (bc.mun@brycenkorea.co.kr)
    dept: string;     // 부서 (DX 2Team)
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    // 💡 ID/PW 대신 그룹웨어에서 받은 토큰과 정보를 인자로 받음
    login: (gwToken: string, nameAndPos: string, dept: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserInfo | null>(null);

    // 1. 페이지 로드 시 기존 세션(토큰) 확인
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // 토큰 유효성 검사 및 유저 정보 로드 (헤더에 토큰 실어 보냄)
                const res = await fetch('/api/auth/check', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser({
                        username: data.username,
                        email: data.email,
                        dept: data.dept
                    });
                    setIsAuthenticated(true);
                } else {
                    logout(); // 토큰이 유효하지 않으면 로컬 정보 삭제
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    // 2. 토큰 교환 방식의 로그인
    const login = async (username: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.token); // 우리 JWT 저장
            setUser({ username: data.username, email: username, dept: data.dept });
            setIsAuthenticated(true);
        } else {
            throw new Error("그룹웨어 인증에 실패했습니다.");
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken'); // 💡 토큰 삭제
        setUser(null);
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