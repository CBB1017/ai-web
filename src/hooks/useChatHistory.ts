import { useQuery } from '@tanstack/react-query';
import { fetchChatMessages } from '../api/chat';

// 커스텀 훅
export const useChatHistory = (selectedRoom: { roomId: string, title: string }) => {
    return useQuery({
        queryKey: ['chatMessages', selectedRoom?.roomId],
        queryFn: () => fetchChatMessages(selectedRoom!.roomId),
        enabled: !!selectedRoom?.roomId,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 20
    });
};