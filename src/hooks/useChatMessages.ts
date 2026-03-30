import { useState, useRef, useEffect } from 'react';
import { useAiStream } from './useAiStream';

export type ChatMode = 'GENERAL' | 'KNOWLEDGE';
export type Message = { role: 'USER' | 'ASSISTANT'; content: string; createdAt?: string };

interface UseChatMessagesProps {
    mode: ChatMode;
    onRoomCreated?: (roomId: string) => void;
}

export function useChatMessages({ mode, onRoomCreated }: UseChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const { stream } = useAiStream();

    const createNewRoom = async () => {
        const response = await fetch('/api/chat/rooms', {
            method: 'POST',
            headers: { 'x-user-id': 'bc.mun' } // 실제 환경에선 인증 정보 사용
        });
        if (!response.ok) throw new Error('채팅방 생성 실패');
        return await response.json(); // { roomId: "...", title: "..." }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const handleSubmit = async (currentRoomId: string | null) => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setIsLoading(true);

        let targetRoomId = currentRoomId;

        try {
            // 1. 방이 없는 상태에서 첫 질문이라면 방부터 생성
            if (!targetRoomId) {
                const newRoom = await createNewRoom();
                targetRoomId = newRoom.roomId;

                // targetRoomId가 확실히 존재할 때만 콜백 실행
                if (onRoomCreated && targetRoomId) {
                    onRoomCreated(targetRoomId);
                }
            }

            // 2. UI에 사용자 메시지 추가
            setMessages(prev => [
                ...prev,
                {role: 'USER', content: userText},
                {role: 'ASSISTANT', content: ''}
            ]);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            // 3. 스트림 호출 (URL에 roomId 포함)
            await stream(
                `/api/ai/ask?mode=${mode}&roomId=${targetRoomId}`,
                userText,
                (chunk) => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        if (newMsgs.length === 0) return prev;
                        const lastIdx = newMsgs.length - 1;
                        newMsgs[lastIdx] = {
                            ...newMsgs[lastIdx],
                            content: newMsgs[lastIdx].content + chunk
                        };
                        return newMsgs;
                    });
                },
                controller.signal
            );
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted');
            } else {
                console.error('Submit Error:', error);
                setMessages(prev => [...prev, {role: 'ASSISTANT', content: '⚠️ 오류가 발생했습니다. 다시 시도해주세요.'}]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };
    useEffect(() => {
        return () => handleStop();
    }, [handleStop]);

    return { messages, setMessages, input, setInput, isLoading, handleSubmit, handleStop };
}