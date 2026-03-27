import { useState, useRef, useEffect } from 'react';
import { useAiStream } from './useAiStream';

export type ChatMode = 'GENERAL' | 'KNOWLEDGE';
export type Message = { role: 'user' | 'ai'; content: string };

export function useChatMessages(mode: ChatMode) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const { stream } = useAiStream();

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setIsLoading(true);

        setMessages(prev => [
            ...prev,
            { role: 'user', content: userText },
            { role: 'ai', content: '' }
        ]);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            await stream(
                `/api/ai/ask?mode=${mode}`,
                userText,
                (chunk) => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
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
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    useEffect(() => {
        return () => handleStop();
    }, []);

    return { messages, input, setInput, isLoading, handleSubmit, handleStop };
}