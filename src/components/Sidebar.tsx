import { useState } from 'react';
import type {ChatRoom, SidebarProps} from "../constants/constant.ts";
import { useAtom } from "jotai";
import { selectedRoomAtom } from "../store/store.ts";
import {useChatRooms} from "../hooks/useChatRooms.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {fetchSaveChatRoom} from "../api/chat.ts";

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
    const queryClient = useQueryClient();

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

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return '방금 전';
        if (hours < 24) return `${hours}시간 전`;
        return `${Math.floor(diff / 86400000)}일 전`;
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
                                            onClick={() => setSelectedRoom(chat)}
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