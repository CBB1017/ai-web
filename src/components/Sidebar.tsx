import { useState } from 'react';

interface ChatHistoryItem {
    id: string;
    title: string;
    timestamp: Date;
}

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [chatHistory] = useState<ChatHistoryItem[]>([
        { id: '1', title: '사내 규정 문의', timestamp: new Date(Date.now() - 3600000) },
        { id: '2', title: 'AI 기술 질문', timestamp: new Date(Date.now() - 7200000) },
        { id: '3', title: '프로젝트 계획', timestamp: new Date(Date.now() - 86400000) },
    ]);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return '방금 전';
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    return (
        <>
            {isCollapsed && (
                <div
                    className="sidebar-hover-trigger"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {isHovered && (
                        <button onClick={onToggle} className="sidebar-toggle-hover">
                            →
                        </button>
                    )}
                </div>
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                {!isCollapsed && (
                    <>
                        <div className="sidebar-header">
                            <button onClick={onToggle} className="sidebar-toggle">
                                ←
                            </button>
                            <h3>대화 기록</h3>
                        </div>

                        <div className="sidebar-content">
                            <button className="new-chat-btn">+ 새 대화</button>
                            <div className="chat-list">
                                {chatHistory.map((chat) => (
                                    <div key={chat.id} className="chat-item">
                                        <div className="chat-item-title">{chat.title}</div>
                                        <div className="chat-item-time">{formatTime(chat.timestamp)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
