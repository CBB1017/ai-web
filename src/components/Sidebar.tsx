import type {ChatRoom, SidebarProps} from "../constants/constant.ts";
import { useAtom } from "jotai";
import { selectedRoomAtom } from "../store/store.ts";
import {useChatRooms} from "../hooks/useChatRooms.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useTimeRefresh} from "../hooks/useTimeRefresh.ts";
import { useTranslation } from 'react-i18next';

export default function Sidebar({ isCollapsed, onToggle, isPinned, onPinToggle }: SidebarProps) {
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
    const queryClient = useQueryClient();
    const now = useTimeRefresh();
    const { t } = useTranslation();

    // 1. useChatRooms에서 반환된 값을 바로 변수로 매핑
    const { data: chatHistory = [], isLoading: loading } = useChatRooms();

    const handleNewChat = () => {
        setSelectedRoom({ roomId: '', title: t('sidebar.emptyChat'), updatedAt: '' });
    };

    const handleRoomClick = (chat: ChatRoom) => {
        if(!selectedRoom.roomId || (chat.roomId !== selectedRoom?.roomId)){
            setSelectedRoom(chat);
            queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.roomId] });
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return t('sidebar.emptyChat');
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 5) return t('sidebar.justNow');
        if (diffMinutes < 60) return t('sidebar.minutesAgo', { count: diffMinutes });
        if (diffHours < 24) return t('sidebar.hoursAgo', { count: diffHours });
        return t('sidebar.daysAgo', { count: diffDays });
    };

    return (
        <aside 
            className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isPinned ? 'pinned' : ''}`}
            // PC에서 마우스가 들어오면 자동으로 열림 (고정되지 않았을 때만)
            onMouseEnter={() => isCollapsed && !isPinned && window.innerWidth > 768 && onToggle()}
            // PC에서 마우스가 나가면 자동으로 닫힘 (고정되지 않았을 때만)
            onMouseLeave={() => !isCollapsed && !isPinned && window.innerWidth > 768 && onToggle()}
        >
            <div className="sidebar-header">
                {isCollapsed ? (
                    <button className="mini-icon-btn" onClick={onToggle}>☰</button>
                ) : (
                    <>
                        <button onClick={onToggle} className="sidebar-toggle">←</button>
                        <h3>{t('sidebar.history')}</h3>
                        <button 
                            className={`pin-btn pc-only ${isPinned ? 'active' : ''}`} 
                            onClick={onPinToggle}
                            title={isPinned ? t('sidebar.unpin') : t('sidebar.pin')}
                        >
                            📌
                        </button>
                    </>
                )}
            </div>

            <div className="sidebar-content">
                <button className="new-chat-btn" onClick={handleNewChat}>{t('sidebar.newChat')}</button>
                <div className="chat-list">
                    {loading ? (
                        <div className="loading-spinner">{t('sidebar.loading')}</div>
                    ) : (
                        chatHistory.map((chat) => (
                            <div
                                key={chat.roomId}
                                className={`chat-item ${selectedRoom?.roomId === chat.roomId ? 'active' : ''}`}
                                onClick={() => handleRoomClick(chat)}
                            >
                                <div className="chat-item-title">{chat.title}</div>
                                <div className="chat-item-time">{formatTime(chat.updatedAt)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}