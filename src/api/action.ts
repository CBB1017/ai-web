import { handleResponseError } from "./apiUtils";

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
        throw await handleResponseError(response, "액션 내역 로드 실패");
    }

    return response.json();
};

export const fetchMyActions = async (): Promise<ActionResponse[]> => {
    const response = await fetch(`/api/v1/actions/my`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw await handleResponseError(response, "내 액션 내역 로드 실패");
    }

    return response.json();
};
