import type {ChatRoom} from "../constants/constant.ts";
import { handleResponseError } from "./apiUtils";
import i18n from '../i18n';

export const fetchChatMessages = async (roomId: string) => {
    const response = await fetch(`/api/v1/chat/room/${roomId}/messages`);
    if (!response.ok) {
        throw await handleResponseError(response, i18n.t('error.historyLoadFailed'));
    }
    return response.json();
};

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
    const res = await fetch('/api/v1/chat/rooms', { credentials: 'include' });
    if (!res.ok) {
        throw await handleResponseError(res, i18n.t('error.roomListLoadFailed'));
    }
    return res.json();
};

export const fetchSaveChatRoom = async (title: string = i18n.t('sidebar.emptyChat')): Promise<ChatRoom> => {
    const res = await fetch('/api/v1/chat/room', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    if (!res.ok) {
        throw await handleResponseError(res, i18n.t('error.roomSaveFailed'));
    }
    return res.json();
};