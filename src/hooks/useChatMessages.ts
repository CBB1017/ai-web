import { useState, useRef, useEffect} from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useAiStream } from './useAiStream';
import { useChatHistory } from './useChatHistory';
import type { Message } from "../constants/constant.ts";
import {selectedRoomAtom, isActionInProgressAtom} from "../store/store.ts";
import {useQueryClient} from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { logInfo, logError } from "../otel.ts";

export function useChatMessages() {
    const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
    const setIsActionInProgress = useSetAtom(isActionInProgressAtom);
    const { i18n } = useTranslation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [lastIntentId, setLastIntentId] = useState<string | undefined>(undefined);

    // SSE 데이터로 메시지 교체
    const updateMessageById = (messageId: string, newContent: string) => {
        setMessages(prev => {
            const index = prev.findIndex(msg => (msg as any).messageId === messageId || msg.id === messageId);
            if (index !== -1) {
                const newMessages = [...prev];
                newMessages[index] = { ...newMessages[index], content: newContent, id: messageId };
                return newMessages;
            }
            
            // 💡 ID 매칭이 안 된다면, 방금 '이메일 요약 중...'이라고 표시했던 마지막 메시지를 결과로 교체
            const lastIndex = prev.length - 1;
            if (lastIndex >= 0 && prev[lastIndex].role === 'ASSISTANT') {
                const newMessages = [...prev];
                newMessages[lastIndex] = { ...newMessages[lastIndex], content: newContent, id: messageId };
                return newMessages;
            }
            return prev;
        });
    };

    const addErrorMessage = (errorMessage: string) => {
        setMessages(prev => [
            ...prev,
            { role: 'ASSISTANT', content: `⚠️ ${errorMessage}` }
        ]);
    };

    const abortControllerRef = useRef<AbortController | null>(null);
    const { stream } = useAiStream();
    const queryClient = useQueryClient();

    const { data: historyData, isLoading: isHistoryLoading } = useChatHistory(selectedRoom);
    const isLoading = isHistoryLoading || isStreaming;

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (isStreaming) return;
        if (historyData) {
            setMessages(historyData);
        } else {
            setMessages([]);
        }
    }, [selectedRoom?.roomId, historyData, isStreaming]);

    const handleStop = () => {
        if (abortControllerRef.current) {
            logInfo("User clicked stop", { roomId: selectedRoom?.roomId });
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
            setIsActionInProgress(false);
        }
    };

    const handleSubmit = async (overrideInput?: string) => {
        const textToSubmit = (overrideInput || input).trim();
        if (!textToSubmit || isLoading) return;

        logInfo("User submitted message", { roomId: selectedRoom?.roomId, textLength: textToSubmit.length });
        setInput('');
        setIsStreaming(true);
        setLastIntentId(undefined);
        
        const isEmailAction = textToSubmit.includes('이메일') || textToSubmit.includes('요약');
        if (isEmailAction) {
            setIsActionInProgress(true);
        }

        let currentRoomId = selectedRoom?.roomId || '';
        const isNewChat = !currentRoomId;

        // 💡 ASSISTANT 메시지에 즉시 안내 문구 표시
        const initialAssistantContent = isEmailAction ? `⏳ **이메일 요약 작업을 시작합니다.**\n결과가 준비되면 이 메시지가 업데이트됩니다.` : '';

        setMessages(prev => [
            ...prev,
            { role: 'USER', content: textToSubmit },
            { role: 'ASSISTANT', content: initialAssistantContent }
        ]);

        try {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            await stream(
                `/api/v1/ai/ask`,
                textToSubmit,
                currentRoomId,
                i18n.language || 'ko',
                (chunk, intentId) => {
                    if (intentId) setLastIntentId(intentId);
                    
                    // 💡 일반 채팅은 그대로 스트리밍, 비동기 액션은 안내 문구 유지 (필요시 추가 내용만 덧붙임)
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg?.role === 'ASSISTANT') {
                            // 이미 안내 문구가 있는 경우는 스트리밍 내용만 뒤에 붙이거나 무시 (백엔드 설계에 따름)
                            // 여기서는 일반 스트리밍 응답도 올 수 있으므로 chunk를 더해줍니다.
                            const newContent = isEmailAction ? lastMsg.content : lastMsg.content + chunk;
                            return [...prev.slice(0, -1), { ...lastMsg, content: newContent }];
                        }
                        return prev;
                    });
                },
                controller.signal,
                (newRoomId) => {
                    if (isNewChat) {
                        currentRoomId = newRoomId;
                        setSelectedRoom({
                            roomId: newRoomId,
                            title: textToSubmit.slice(0, 20) + '...',
                            updatedAt: new Date().toISOString()
                        });
                        // 💡 즉시 사이드바 목록 무효화하여 새로운 방 표시
                        // queryClient.invalidateQueries({queryKey: ['chatRooms']});
                    }
                }
            );

            // await queryClient.invalidateQueries({ queryKey: ['chatRooms'] }); // SSE에서 처리하므로 주석 처리
            await queryClient.invalidateQueries({ queryKey: ['chatMessages', currentRoomId] });
            logInfo("AI Stream completed successfully", { roomId: currentRoomId });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                logError("AI Stream high-level error", error, { roomId: currentRoomId });
                setIsActionInProgress(false);
                let errorMessage = `⚠️ 오류가 발생했습니다.\n\n[상세 내용]\n${error.message || '알 수 없는 서버 오류'}`;
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === 'ASSISTANT') {
                        return [...prev.slice(0, -1), { ...lastMsg, content: (lastMsg.content ? lastMsg.content + '\n\n' : '') + errorMessage }];
                    }
                    return [...prev, { role: 'ASSISTANT', content: errorMessage }];
                });
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
            // queryClient.invalidateQueries({queryKey: ['chatRooms']}); // SSE에서 처리하므로 제거
        }
    };

    return {
        messages,
        setMessages,
        updateMessageById,
        addErrorMessage,
        input,
        setInput,
        isLoading,
        handleSubmit,
        handleStop,
        lastIntentId
    };
}
