import type {BoardPostResponse} from "../store/store.ts";
import { handleResponseError } from "./apiUtils";

export const fetchBoardPosts = async (): Promise<Record<string, BoardPostResponse[]>> => {
    const response = await fetch('/api/v1/boards');
    if (!response.ok) {
        throw await handleResponseError(response, "게시판 포스트 로드 실패");
    }
    return response.json();
};
