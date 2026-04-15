export type ChatMode = 'GENERAL' | 'KNOWLEDGE';
export type Message = { role: 'USER' | 'ASSISTANT'; content: string; createdAt?: string };

export interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isPinned: boolean;
    onPinToggle?: () => void;
}

export interface ChatRoom {
    roomId: string;
    title: string;
    updatedAt: string;
}
export interface Props {
    msg: Message;
    mode: ChatMode;
}

export interface UserInfo {
    username: string; // 이름 (문병찬)
    email: string;    // 이메일 (bc.mun@brycenkorea.co.kr) 또는 bc.mun
    dept: string;     // 부서 (DX 2Team)
    position: string; // 대리
}

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    login: (id: string, pass: string) => Promise<void>;
    logout: () => void;
}
