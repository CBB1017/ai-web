import { useState, useRef, useEffect} from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useAiStream } from './useAiStream';
import { useChatHistory } from './useChatHistory';
import type { Message } from "../constants/constant.ts";
import {selectedRoomAtom, isActionInProgressAtom} from "../store/store.ts";
import {useQueryClient} from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

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
            const lastIndex = prev.length - 1;
            if (lastIndex >= 0 && prev[lastIndex].role === 'ASSISTANT') {
                const newMessages = [...prev];
                newMessages[lastIndex] = { ...newMessages[lastIndex], content: newContent, id: messageId };
                return newMessages;
            }
            return prev;
        });
    };

    // SSE 에러 메시지 추가
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
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
            setIsActionInProgress(false);
        }
    };

    const handleSubmit = async (overrideInput?: string) => {
        const textToSubmit = (overrideInput || input).trim();
        if (!textToSubmit || isLoading) return;

        setInput('');
        setIsStreaming(true);
        setLastIntentId(undefined); // 새 요청 시 초기화
        
        if (textToSubmit.includes('이메일') || textToSubmit.includes('요약')) {
            setIsActionInProgress(true);
        }

        let currentRoomId = selectedRoom?.roomId || '';
        const isNewChat = !currentRoomId;

        setMessages(prev => [
            ...prev,
            { role: 'USER', content: textToSubmit },
            { role: 'ASSISTANT', content: '' }
        ]);

        try {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            await stream(
                `/api/ai/ask`,
                textToSubmit,
                currentRoomId,
                i18n.language || 'ko',
                (chunk, intentId) => {
                    if (intentId) setLastIntentId(intentId);
                    // 스트리밍 내용 반영
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg?.role === 'ASSISTANT') {
                            return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + chunk }];
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
                        queryClient.invalidateQueries({queryKey: ['chatRooms']});
                    }
                }
            );

            await queryClient.invalidateQueries({ queryKey: ['chatMessages', currentRoomId] });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
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
            await queryClient.invalidateQueries({queryKey: ['chatRooms']});
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
