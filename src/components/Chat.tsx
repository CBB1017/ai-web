import { useState, useRef, useEffect } from 'react';
import { useChatMessages, type ChatMode } from '../hooks/useChatMessages';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import ActionPanel from './ActionPanel';
import {useAuth} from "../context/AuthContext.tsx";

export default function Chat() {
    const { user, logout } = useAuth();
    const [mode, setMode] = useState<ChatMode>('GENERAL');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [actionPanelCollapsed, setActionPanelCollapsed] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 💡 비즈니스 로직을 커스텀 훅에서 깔끔하게 가져옴
    const { messages, input, setInput, isLoading, handleSubmit, handleStop } = useChatMessages(mode);

    // 자동 스크롤 로직만 뷰 쪽에 남김
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // 모바일에서 한쪽만 열리도록 처리
    const handleSidebarToggle = () => {
        if (!sidebarCollapsed) {
            setSidebarCollapsed(true);
        } else {
            setSidebarCollapsed(false);
            setActionPanelCollapsed(true);
        }
    };

    const handleActionPanelToggle = () => {
        if (!actionPanelCollapsed) {
            setActionPanelCollapsed(true);
        } else {
            setActionPanelCollapsed(false);
            setSidebarCollapsed(true);
        }
    };

    return (
        <div className="chat-layout">
            {/* 모바일에서 백드롭 오버레이 */}
            {(!sidebarCollapsed || !actionPanelCollapsed) && (
                <div
                    className="mobile-backdrop"
                    onClick={() => {
                        setSidebarCollapsed(true);
                        setActionPanelCollapsed(true);
                    }}
                />
            )}

            <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />

            <div className="container">
            <header>
                {/* 모바일 토글 버튼들 */}
                <button className="mobile-sidebar-toggle" onClick={handleSidebarToggle}>
                    ☰
                </button>

                {/* 💡 헤더에 유저 이름 표시 */}
                <span className="logo">🤖 {user?.username}님의 AI Assistant</span>

                <button className="mobile-action-toggle" onClick={handleActionPanelToggle}>
                    ⚡
                </button>

                <div className="mode-selector">
                    <select value={mode} onChange={(e) => setMode(e.target.value as ChatMode)} disabled={isLoading}>
                        <option value="GENERAL">일반 대화</option>
                        <option value="KNOWLEDGE">사내 지식 기반 (RAG)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span className="status">{isLoading ? 'Typing...' : 'Online'}</span>
                    {/* 💡 로그아웃 버튼 추가 */}
                    <button onClick={logout} style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '8px', height: 'auto', width: 'auto' }}>
                        로그아웃
                    </button>
                </div>
            </header>

            <main className="chat-window" ref={scrollRef}>
                {messages.length === 0 && (
                    <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>
                        대화를 시작해보세요!
                    </div>
                )}

                {/* 💡 분리한 컴포넌트 렌더링 */}
                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} msg={msg} mode={mode} />
                ))}

                {isLoading && messages[messages.length - 1]?.content === '' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                        <div className="loader"></div>
                        <span>답변을 생성하는 중...</span>
                    </div>
                )}
            </main>

            <footer className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
                    }}
                    placeholder={mode === 'KNOWLEDGE' ? "사내 규정에 대해 물어보세요..." : "무엇이든 물어보세요..."}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button onClick={handleStop} className="stop-btn">중단</button>
                ) : (
                    <button onClick={handleSubmit} disabled={!input.trim()}>전송</button>
                )}
            </footer>
        </div>

            <ActionPanel isCollapsed={actionPanelCollapsed} onToggle={handleActionPanelToggle} />
        </div>
    );
}