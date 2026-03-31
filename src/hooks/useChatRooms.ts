// hooks/useChatRooms.ts
import {useQuery} from "@tanstack/react-query";
import type {ChatRoom} from "../constants/constant.ts";
import {fetchChatRooms} from "../api/chat.ts";

export const useChatRooms = (isCollapsed: boolean) => {
    return useQuery<ChatRoom[], Error>({
        queryKey: ['chatRooms'],
        queryFn: fetchChatRooms,
        enabled: !isCollapsed,
    });
};