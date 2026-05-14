import type {ChatRoom} from "../constants/constant.ts";
import { handleResponseError } from "./apiUtils";

export const fetchChatMessages = async (roomId: string) => {
    const response = await fetch(`/api/v1/chat/room/${roomId}/messages`);
    if (!response.ok) {
        throw await handleResponseError(response, "History 로드 실패");
    }
    return response.json();
};

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
    const res = await fetch('/api/v1/chat/rooms', { credentials: 'include' });
    if (!res.ok) {
        throw await handleResponseError(res, '채팅방 목록을 불러오는데 실패했습니다.');
    }
    return res.json();
};

export const fetchSaveChatRoom = async (title: string = '새로운 대화'): Promise<ChatRoom> => {
    const res = await fetch('/api/v1/chat/room', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    if (!res.ok) {
        throw await handleResponseError(res, '채팅방 저장에 실패했습니다.');
    }
    return res.json();
};