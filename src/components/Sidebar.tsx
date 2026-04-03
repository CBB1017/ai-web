import { useState } from 'react';
import type {ChatRoom, SidebarProps} from "../constants/constant.ts";
import { useAtom } from "jotai";
import { selectedRoomAtom } from "../store/store.ts";
import {useChatRooms} from "../hooks/useChatRooms.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {fetchSaveChatRoom} from "../api/chat.ts";
import {useTimeRefresh} from "../hooks/useTimeRefresh.ts";

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
    const queryClient = useQueryClient();

    const now = useTimeRefresh(); // 1분마다 이 컴포넌트가 리렌더링됨

    // 1. useChatRooms에서 반환된 값을 바로 변수로 매핑
    // data가 없을 경우를 대비해 기본값으로 빈 배열([]) 할당
    const { data: chatHistory = [], isLoading: loading } = useChatRooms(isCollapsed);

    const { mutate: createChat, isPending } = useMutation({
        mutationFn: () => fetchSaveChatRoom(),
        onSuccess: (newRoom: ChatRoom) => {
            setSelectedRoom(newRoom);
            // 생성 성공 시 자동으로 목록 동기화
            queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        },
        onError: (error) => {
            console.error("새 대화 생성 실패:", error);
            // TODO: 사용자에게 에러 Toast 알림 띄우기
        }
    });

    const handleNewChat = () => {
        if (isPending) return; // 로딩 중 중복 클릭 방지
        createChat();
    };

    const handleRoomClick = (chat: ChatRoom) => {
        if(!selectedRoom.roomId || (chat.roomId !== selectedRoom?.roomId)){
            setSelectedRoom(chat);
            // 클릭 시 해당 방의 메시지 쿼리를 무효화하여 useChatMessages가 즉시 반응하게 함
            queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.roomId] });
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '새 대화';

        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // 1. 5분 미만
        if (diffMinutes < 5) return '방금 전';

        // 2. 1시간 미만 (분 단위 표시 추가)
        if (diffMinutes < 60) return `${diffMinutes}분 전`;

        // 3. 24시간 미만 (시간 단위)
        if (diffHours < 24) return `${diffHours}시간 전`;

        // 4. 그 외 (일 단위)
        return `${diffDays}일 전`;
    };

    return (
        <>
            {isCollapsed && (
                <div className="sidebar-hover-trigger" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    {isHovered && <button onClick={onToggle} className="sidebar-toggle-hover">→</button>}
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
                                        <div
                                            key={chat.roomId}
                                            // 선택된 방 강조 스타일 추가
                                            className={`chat-item ${selectedRoom?.roomId === chat.roomId ? 'active' : ''}`}
                                            // 클릭 시 전역 상태 업데이트
                                            onClick={() => handleRoomClick(chat)}
                                        >
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