import type {BoardPostResponse} from "../store/store.ts";

export const fetchBoardPosts = async (): Promise<Record<string, BoardPostResponse[]>> => {
    const response = await fetch('/api/v1/boards');
    if (!response.ok) {
        const error: any = new Error("게시판 포스트 로드 실패");
        error.status = response.status;
        throw error;
    }
    return response.json();
};
