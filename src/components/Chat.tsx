import { useState, useRef, useEffect } from 'react';
import { useAiStream } from '../hooks/useAiStream';

type ChatMode = 'GENERAL' | 'KNOWLEDGE';

export default function Chat() {
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [mode, setMode] = useState<ChatMode>('GENERAL');
    const [isLoading, setIsLoading] = useState(false);

    // 💡 현재 실행 중인 요청을 제어하기 위한 ref
    const abortControllerRef = useRef<AbortController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { stream } = useAiStream();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [answer, isLoading]);

    // 💡 중단 함수
    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setAnswer('');

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            await stream(
                `/api/ai/ask?mode=${mode}`,
                prompt,
                (text) => setAnswer(prev => prev + text),
                controller.signal
            );
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    useEffect(() => {
        return () => handleStop(); // 언마운트 시 자동 중단
    }, []);

    return (
        <div className="container">
            <header>
                <span className="logo">🤖 AI Assistant</span>
                <div className="mode-selector">
                    <select value={mode} onChange={(e) => setMode(e.target.value as ChatMode)} disabled={isLoading}>
                        <option value="GENERAL">일반 대화</option>
                        <option value="KNOWLEDGE">사내 지식 기반 (RAG)</option>
                    </select>
                </div>
                <span className="status">{isLoading ? 'Typing...' : 'Online'}</span>
            </header>

            <main className="chat-window" ref={scrollRef}>
                {answer && (
                    <div className={`message ai ${mode === 'KNOWLEDGE' ? 'knowledge-mode' : ''}`}>
                        <div className="avatar">{mode === 'KNOWLEDGE' ? '🎓' : 'AI'}</div>
                        <div className="bubble">{answer}</div>
                    </div>
                )}
                {isLoading && !answer && <div className="loader">데이터를 가져오는 중...</div>}
            </main>

            <footer className="input-area">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder={mode === 'KNOWLEDGE' ? "사내 규정에 대해 물어보세요..." : "무엇이든 물어보세요..."}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button onClick={handleStop} className="stop-btn">중단</button>
                ) : (
                    <button onClick={handleSubmit} disabled={!prompt.trim()}>전송</button>
                )}
            </footer>
        </div>
    );
}