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

    const response = await fetch(`/api/actions/room/${roomId}`, {
        credentials: 'include'
    });

    if (!response.ok) {
        const error: any = new Error("액션 내역 로드 실패");
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const fetchMyActions = async (): Promise<ActionResponse[]> => {
    const response = await fetch(`/api/actions/my`, {
        credentials: 'include'
    });

    if (!response.ok) {
        const error: any = new Error("내 액션 내역 로드 실패");
        error.status = response.status;
        throw error;
    }

    return response.json();
};
