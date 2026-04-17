import { useState, useRef, useEffect} from 'react';
import { useAtom } from 'jotai';
import { useAiStream } from './useAiStream';
import { useChatHistory } from './useChatHistory';
import type { Message } from "../constants/constant.ts";
import {selectedRoomAtom} from "../store/store.ts";
import {useQueryClient} from "@tanstack/react-query";

import { useTranslation } from 'react-i18next';

export function useChatMessages() {
    // 1. Jotai Store 연동 (현재 선택된 방 정보)
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
    const { t, i18n } = useTranslation();

    // 2. Local State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [lastIntentId, setLastIntentId] = useState<string | undefined>(undefined);

    const abortControllerRef = useRef<AbortController | null>(null);
    const { stream } = useAiStream();
    const queryClient = useQueryClient();

    // React Query: 과거 내역 가져오기
    const { data: historyData, isLoading: isHistoryLoading } = useChatHistory(selectedRoom);

    // 통합 로딩 상태 (과거 내역 로딩 중이거나, AI 답변 중일 때)
    const isLoading = isHistoryLoading || isStreaming;

    // 언마운트 시 스트리밍 중단 처리
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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

    const handleSubmit = async (overrideInput?: string) => {
        const textToSubmit = (overrideInput || input).trim();
        if (!textToSubmit || isLoading) return;

        setInput('');
        setIsStreaming(true);
        setLastIntentId(undefined); // 새 요청 시 항상 초기화
        let currentRoomId = selectedRoom?.roomId || '';
        const isNewChat = !currentRoomId;

        // 1. Optimistic UI: 메시지 즉시 표시
        setMessages(prev => [
            ...prev,
            { role: 'USER', content: textToSubmit },
            { role: 'ASSISTANT', content: '' }
        ]);

        try {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            // 3. 스트리밍 시작
            await stream(
                `/api/ai/ask`,
                textToSubmit,
                currentRoomId,
                i18n.language || 'ko',
                (chunk, intentId) => {
                    if (intentId) setLastIntentId(intentId);
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
                    // 💡 새 대화라면 백엔드에서 생성된 RoomId를 받아 세션 업데이트
                    if (isNewChat) {
                        currentRoomId = newRoomId;
                        setSelectedRoom({
                            roomId: newRoomId,
                            title: textToSubmit.slice(0, 20) + '...', // 백엔드 요약 전 임시 제목
                            updatedAt: new Date().toISOString()
                        });
                        // 방 목록 갱신 예약
                        queryClient.invalidateQueries({queryKey: ['chatRooms']});
                    }
                }
            );

            // 스트리밍이 성공적으로 끝나면 해당 방의 메시지 내역만 새로고침
            await queryClient.invalidateQueries({
                queryKey: ['chatMessages', currentRoomId]
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                let errorMessage = `⚠️ 오류가 발생했습니다.\n\n[상세 내용]\n${error.message || '알 수 없는 서버 오류'}`;

                if (error.status === 502 || error.status === 503) {
                    errorMessage = `⚠️ ${t('login.serverError')}`;
                } else if (error.message === 'HIGH_DEMAND') {
                    errorMessage = `⚠️ ${t('chat.highDemandError')}`;
                }

                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === 'ASSISTANT') {
                        const newContent = lastMsg.content 
                            ? `${lastMsg.content}\n\n${errorMessage}`
                            : errorMessage;
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, content: newContent }
                        ];
                    }
                    return [...prev, { role: 'ASSISTANT', content: errorMessage }];
                });
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
            // 최종적으로 방 목록(백엔드에서 생성된 제목 포함) 갱신
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
        handleStop,
        lastIntentId
    };
}