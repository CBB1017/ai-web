import { handleResponseError } from "./apiUtils";
import i18n from '../i18n';

export interface ActionResponse {
    id: string;
    actionName: string;
    content: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'ROLLBACK_SUCCESS' | 'ROLLBACK_FAILED';
    roomId: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchRoomActions = async (roomId: string): Promise<ActionResponse[]> => {
    if (!roomId) return [];

    const response = await fetch(`/api/v1/actions/room/${roomId}`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw await handleResponseError(response, i18n.t('error.actionLoadFailed'));
    }

    return response.json();
};

export const fetchMyActions = async (): Promise<ActionResponse[]> => {
    const response = await fetch(`/api/v1/actions/my`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw await handleResponseError(response, i18n.t('error.myActionLoadFailed'));
    }

    return response.json();
};
