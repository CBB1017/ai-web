import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {ChatRoom} from "../constants/constant.ts";

export interface BirthdayResponse {
    day: string;
    name: string;
    position: string;
    department: string;
}

export interface BoardPostResponse {
    title: string;
    author: string;
    date: string;
    url: string;
}

export const chatHistoryAtom = atom<ChatRoom[]>([]);
export const selectedRoomAtom = atom<ChatRoom>({ roomId: '', title: '새로운 대화', updatedAt: ''});
export const isActionInProgressAtom = atom<boolean>(false);
export const birthdaysAtom = atomWithStorage<BirthdayResponse[]>('birthdays', []);
export const boardPostsAtom = atomWithStorage<Record<string, BoardPostResponse[]>>('boardPosts', {});
export const recentPostsAtom = atomWithStorage<BoardPostResponse[]>('recentPosts', []);

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export const toastsAtom = atom<Toast[]>([]);