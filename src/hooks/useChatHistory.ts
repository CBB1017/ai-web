import { useQuery } from '@tanstack/react-query';
import { fetchChatMessages } from '../api/chat';

// 커스텀 훅
export const useChatHistory = (selectedRoom: { roomId: string, title: string } | null) => {
    return useQuery({
        queryKey: ['chatMessages', selectedRoom?.roomId],
        queryFn: () => fetchChatMessages(selectedRoom!.roomId),
        // 핵심: roomId가 존재하고 '새로운 대화'가 아닐 때만 API 자동 호출
        enabled: !!selectedRoom?.roomId && selectedRoom?.title !== '새로운 대화',
        initialData: [], // 호출 안될 때(새 대화)의 기본값은 빈 배열
    });
};