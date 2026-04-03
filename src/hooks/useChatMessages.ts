import { useState, useRef, useEffect} from 'react';
import { useAtom } from 'jotai';
import { useAiStream } from './useAiStream';
import { useChatHistory } from './useChatHistory';
import type { Message } from "../constants/constant.ts";
import {selectedRoomAtom} from "../store/store.ts";
import {useQueryClient} from "@tanstack/react-query";

export function useChatMessages() {
    // 1. Jotai Store 연동 (현재 선택된 방 정보)
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);

    // 2. Local State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const { stream } = useAiStream();
    const queryClient = useQueryClient();

    // React Query: 과거 내역 가져오기
    const { data: historyData, isLoading: isHistoryLoading } = useChatHistory(selectedRoom);

    // 통합 로딩 상태 (과거 내역 로딩 중이거나, AI 답변 중일 때)
    const isLoading = isHistoryLoading || isStreaming;

    useEffect(() => {
        // 스트리밍이 진행 중일 때는 방 ID가 부여되더라도 로컬 메시지를 엎어치지 않음
        if (isStreaming) {
            return;
        }

        // 스트리밍 중이 아닐 때만 초기화 및 과거 내역 세팅
        if (historyData) {
            setMessages(historyData);
        } else {
            setMessages([]);
        }
    }, [selectedRoom?.roomId, historyData, isStreaming]);

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setIsStreaming(true);
        let finalRoomId = selectedRoom?.roomId || '';
        const isNewChat = !finalRoomId;

        // 1. Optimistic UI: 메시지 즉시 표시
        setMessages(prev => [
            ...prev,
            { role: 'USER', content: userText },
            { role: 'ASSISTANT', content: '' }
        ]);

        try {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            // 3. 스트리밍 시작
            await stream(
                `/api/ai/ask`,
                userText,
                finalRoomId,
                (chunk) => {
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg?.role === 'ASSISTANT') {
                            return [
                                ...prev.slice(0, -1),
                                { ...lastMsg, content: lastMsg.content + chunk }
                            ];
                        }
                        return prev;
                    });
                },
                controller.signal,
                (newRoomId) => {
                    if (isNewChat) {
                        finalRoomId = newRoomId;
                        setSelectedRoom({
                            roomId: newRoomId,
                            title: '요약 중...',
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
            );

            // 스트리밍이 성공적으로 끝나면 해당 방의 메시지 내역만 새로고침
            await queryClient.invalidateQueries({
                queryKey: ['chatMessages', finalRoomId]
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setMessages(prev => [...prev, { role: 'ASSISTANT', content: '⚠️ 오류가 발생했습니다.' }]);
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
            //채팅 목록에 새 대화가 쌓임
            await queryClient.invalidateQueries({queryKey: ['chatRooms']});
        }
    };

    return {
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        handleSubmit,
        handleStop
    };
}