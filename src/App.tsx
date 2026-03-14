import { useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import './App.css';

interface PromptResponse {
    response: string;
}

// 모드 타입 정의
type ChatMode = 'GENERAL' | 'KNOWLEDGE';

function App() {
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [mode, setMode] = useState<ChatMode>('GENERAL'); // 💡 모드 상태 추가
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setAnswer('');

        // 💡 URL 쿼리 파라미터에 mode 추가 (백엔드 @RequestParam 대응)
        const url = `/api/ai/ask?mode=${mode}`;

        try {
            await fetchEventSource(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ prompt }),
                onmessage(ev) {
                    try {
                        // WebFlux에서 전송된 JSON 파싱
                        const data: PromptResponse = JSON.parse(ev.data);
                        setAnswer((prev) => prev + data.response);
                    } catch (e) {
                        // 단순 문자열로 올 경우 대비
                        setAnswer((prev) => prev + ev.data);
                    }
                },
                onclose() { setIsLoading(false); },
                onerror(err) {
                    setIsLoading(false);
                    console.error("Stream Error:", err);
                }
            });
        } catch (err) {
            console.error('Request failed:', err);
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <header>
                <span className="logo">🤖 AI Assistant</span>
                <div className="mode-selector">
                    {/* 💡 모드 전환 드롭다운 또는 버튼 */}
                    <select value={mode} onChange={(e) => setMode(e.target.value as ChatMode)}>
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
                <button onClick={handleSubmit} disabled={isLoading || !prompt.trim()}>
                    전송
                </button>
            </footer>
        </div>
    );
}

export default App;