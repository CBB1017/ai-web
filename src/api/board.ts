import type {BoardPostResponse} from "../store/store.ts";
import { handleResponseError } from "./apiUtils";
import i18n from '../i18n';

export const fetchBoardPosts = async (): Promise<Record<string, BoardPostResponse[]>> => {
    const response = await fetch('/api/v1/boards', { credentials: 'include' });
    if (!response.ok) {
        throw await handleResponseError(response, i18n.t('error.boardPostLoadFailed'));
    }
    return response.json();
};

export const fetchRecentPosts = async (): Promise<BoardPostResponse[]> => {
    const response = await fetch('/api/v1/boards/recent', { credentials: 'include' });
    if (!response.ok) {
        throw await handleResponseError(response, i18n.t('error.recentPostLoadFailed'));
    }
    return response.json();
};
