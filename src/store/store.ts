import { atom } from 'jotai';
import type {ChatRoom} from "../constants/constant.ts";

export const chatHistoryAtom = atom<ChatRoom[]>([]);
export const selectedRoomAtom = atom<ChatRoom>({ roomId: '', title: '새로운 대화', updatedAt: ''});