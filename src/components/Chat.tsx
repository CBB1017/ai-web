import { useState, useRef, useEffect } from 'react';
import { useChatMessages, type ChatMode } from '../hooks/useChatMessages';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import ActionPanel from './ActionPanel';
import {useAuth} from "../context/AuthContext.tsx";

export default function Chat() {
    const { user, logout } = useAuth();
    const [mode, setMode] = useState<ChatMode>('GENERAL');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [actionPanelCollapsed, setActionPanelCollapsed] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 💡 커스텀 훅에 selectedRoomId를 전달하여 과거 메시지를 로드하게 함
    const {
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        handleSubmit,
        handleStop
    } = useChatMessages({mode, onRoomCreated: (newId: string) => setSelectedRoomId(newId)});

    // 💡 과거 메시지 불러오기 로직 (roomId 변경 시 실행)
    useEffect(() => {
        if (!selectedRoomId) {
            setMessages([]); // 방 선택이 없으면 메시지 비움
            return;
        }

        const loadHistory = async () => {
            try {
                const response = await fetch(`/api/chat/rooms/${selectedRoomId}/messages`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("History 로드 실패:", error);
            }
        };

        loadHistory();
    }, [selectedRoomId, setMessages]);

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

            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                onSelectRoom={setSelectedRoomId}
                activeRoomId={selectedRoomId}
            />

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
                {messages.length === 0 && !isLoading && (
                    <div style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <p>🤖 안녕하세요, {user?.username}님!</p>
                        <p>왼쪽 대화 기록을 선택하거나 새 대화를 시작해보세요.</p>
                    </div>
                )}

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
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            handleSubmit(selectedRoomId);
                        }
                    }}
                    placeholder={selectedRoomId ? "메시지를 입력하세요..." : "새 대화를 시작하려면 메시지를 입력하세요"}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button onClick={handleStop} className="stop-btn">중단</button>
                ) : (
                    <button
                        // 💡 인자 없는 익명 함수 () => ... 를 만들고, 그 안에서 값을 명시적으로 전달
                        onClick={() => handleSubmit(selectedRoomId)}
                        disabled={!input.trim()}
                    >
                        전송
                    </button>
                )}
            </footer>
        </div>

            <ActionPanel isCollapsed={actionPanelCollapsed} onToggle={handleActionPanelToggle} />
        </div>
    );
}