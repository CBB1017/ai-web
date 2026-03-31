import type {ChatRoom} from "../constants/constant.ts";

export const fetchChatMessages = async (roomId: string) => {
    const response = await fetch(`/api/chat/room/${roomId}/messages`);
    if (!response.ok) throw new Error("History 로드 실패");
    return response.json();
};

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
    const res = await fetch('/api/chat/rooms', { credentials: 'include' });
    if (!res.ok) throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
    return res.json();
};
// 생성 시에는 title만 전달 (혹은 Omit<ChatRoom, 'roomId' | 'updatedAt'> 사용)
export const fetchSaveChatRoom = async (title: string = '새로운 대화'): Promise<ChatRoom> => {
    const res = await fetch('/api/chat/room', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    if (!res.ok) throw new Error('채팅방 저장에 실패했습니다.');
    return res.json();
};