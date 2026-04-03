import { useState, useRef, useEffect} from 'react';
import { useAtom } from 'jotai';
import { useAiStream } from './useAiStream';
import { useChatHistory } from './useChatHistory';
import type { Message } from "../constants/constant.ts";
import {selectedRoomAtom} from "../store/store.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {fetchSaveChatRoom} from "../api/chat.ts";

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

    // 방 생성 Mutation 정의
    const { mutateAsync: createChatRoom } = useMutation({
        mutationFn: (title: string) => fetchSaveChatRoom(title),
        onSuccess: () => {
            // 사이드바 즉시 갱신
            queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        }
    });

    // 통합 로딩 상태 (과거 내역 로딩 중이거나, AI 답변 중일 때)
    const isLoading = isHistoryLoading || isStreaming;

    useEffect(() => {
        // 1. 방이 바뀌면 일단 로컬 메시지 초기화 (이전 방 메시지 잔상 제거)
        setMessages([]);

        // 2. 새로운 데이터가 들어오면 업데이트
        if (historyData) {
            setMessages(historyData);
        }
    }, [selectedRoom?.roomId, historyData]); // roomId를 의존성에 추가하여 확실히 트리거

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

        let currentRoomId = selectedRoom?.roomId;

        try {
            // 1. 고스트 룸 처리: 방 ID가 없으면 먼저 생성 API 호출
            if (!currentRoomId) {
                const newRoom = await createChatRoom('새로운 대화'); // 기본값 전달
                currentRoomId = newRoom.roomId;

                // 전역 상태 업데이트 (UI 즉시 반영)
                setSelectedRoom(newRoom);
            }

            // 2. 로컬 메시지 즉시 업데이트 (Optimistic UI)
            setMessages(prev => [...prev,
                { role: 'USER', content: userText },
                { role: 'ASSISTANT', content: '' }
            ]);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            // 3. 스트리밍 시작
            await stream(
                `/api/ai/ask`,
                userText,
                currentRoomId,
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
                controller.signal
            );

            // 스트리밍이 성공적으로 끝나면 해당 방의 메시지 내역만 새로고침
            await queryClient.invalidateQueries({
                queryKey: ['chatMessages', currentRoomId]
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setMessages(prev => [...prev, { role: 'ASSISTANT', content: '⚠️ 오류가 발생했습니다.' }]);
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
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