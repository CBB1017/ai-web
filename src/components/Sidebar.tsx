import {type Dispatch, type SetStateAction, useEffect, useState} from 'react';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onSelectRoom: Dispatch<SetStateAction<string | null>>;
    activeRoomId: string | null;
}

interface ChatRoom {
    roomId: string;
    title: string;
    updatedAt: string;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. 서버에서 채팅방 목록 가져오기
    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch('/api/chat/rooms', {
                    headers: { 'x-user-id': 'bc.mun' } // 실제로는 세션/컨텍스트에서 가져옴
                });
                const data = await response.json();
                setChatHistory(data);
            } catch (error) {
                console.error("채팅 목록 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!isCollapsed) fetchChatRooms();
    }, [isCollapsed]);

    // 2. 새 대화 생성 핸들러
    const handleNewChat = async () => {
        const response = await fetch('/api/chat/rooms', {
            method: 'POST',
            headers: { 'x-user-id': 'bc.mun' }
        });
        const newRoom = await response.json();
        setChatHistory([newRoom, ...chatHistory]); // 목록 맨 앞에 추가
        // TODO: 신규 생성된 roomId로 페이지 이동(Navigate) 로직 추가
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
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
                            <button onClick={onToggle} className="sidebar-toggle">←</button>
                            <h3>대화 기록</h3>
                        </div>

                        <div className="sidebar-content">
                            <button className="new-chat-btn" onClick={handleNewChat}>+ 새 대화</button>
                            <div className="chat-list">
                                {loading ? (
                                    <div className="loading-spinner">로딩 중...</div>
                                ) : (
                                    chatHistory.map((chat) => (
                                        <div key={chat.roomId} className="chat-item" onClick={() => {/* 해당 방으로 이동 */}}>
                                            <div className="chat-item-title">{chat.title}</div>
                                            <div className="chat-item-time">{formatTime(chat.updatedAt)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}