import { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMutation } from '@tanstack/react-query';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import ActionPanel from './ActionPanel';
import {useAuth} from "../context/AuthContext.tsx";
import type {ChatMode, ChatRoom} from "../constants/constant.ts";
import {useAtom} from "jotai";
import {selectedRoomAtom} from "../store/store.ts";

export default function Chat() {
    const { user, logout } = useAuth();
    const [mode, setMode] = useState<ChatMode>('GENERAL');

    // 💡 이름과 직급을 분리하는 함수 (ex: 문병찬대리 -> 문병찬 대리)
    const formatUserName = (name?: string) => {
        if (!name) return '';
        const positions = ['사원', '대리', '과장', '차장', '팀장', '그룹장', '이사', '대표', '주임', '계장', '부장', '상무', '전무'];
        const regex = new RegExp(`(${positions.join('|')})$`);
        return name.replace(regex, ' $1').trim();
    };
    
    const logoutMutation = useMutation({
        mutationFn: async () => {
            logout();
        },
    });

    const [selectedRoom,] = useAtom<ChatRoom>(selectedRoomAtom);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [actionPanelCollapsed, setActionPanelCollapsed] = useState(true);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    const {
        messages,
        input,
        setInput,
        isLoading,
        handleSubmit,
        handleStop
    } = useChatMessages();

    // 스크롤 이벤트 핸들러: 사용자가 수동으로 스크롤했는지 감지
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // 바닥에서 50px 이내면 바닥에 있는 것으로 간주
            isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
        }
    };

    // 자동 스크롤: 바닥에 있을 때만 아래로 내림
    useEffect(() => {
        if (isAtBottomRef.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 방이 바뀌었을 때는 무조건 스크롤을 끝으로 보냄
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            isAtBottomRef.current = true;
        }
    }, [selectedRoom?.roomId]);

    const handleSidebarToggle = () => {
        if (!sidebarCollapsed) {
            setSidebarCollapsed(true);
            // 사이드바를 수동으로 닫을 때 고정도 해제
            if (isSidebarPinned) setIsSidebarPinned(false);
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
            // 사이드바가 고정된 상태가 아닐 때만 사이드바를 접음
            if (!isSidebarPinned) {
                setSidebarCollapsed(true);
            }
        }
    };

    const toggleSidebarPin = () => {
        setIsSidebarPinned(!isSidebarPinned);
    };

    // 💡 추천 제안 클릭 핸들러
    const handleSuggestionClick = (text: string) => {
        if (isLoading) return;
        // 직접 텍스트를 인자로 넘겨 즉시 전송
        handleSubmit(text);
    };

    const suggestions = [
        "MCP 목록 확인하기",
        "휴가 신청서 상신 (필요한 정보 안내)",
        "OT 신청서 상신 (필요한 정보 안내)",
        "이메일 요약",
        "사내 규정 안내"
    ];

    return (
        <div className={`chat-layout ${isSidebarPinned ? 'sidebar-pinned' : ''}`}>
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
                isPinned={isSidebarPinned}
                onPinToggle={toggleSidebarPin}
            />

            <div className="container">
            <header>
                <button className="mobile-sidebar-toggle" onClick={handleSidebarToggle}>
                    ☰
                </button>

                <div className="logo">
                    <span className="user-name">🤖 {formatUserName(user?.username)}</span>
                    <span className="service-suffix">님의 AI Assistant</span>
                </div>

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
                    <button 
                        onClick={() => logoutMutation.mutate()} 
                        disabled={logoutMutation.isPending}
                        style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '8px', height: 'auto', width: 'auto' }}
                    >
                        {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                    </button>
                </div>
            </header>

            <main className="chat-window" ref={scrollRef} onScroll={handleScroll}>
                {messages.length === 0 && !isLoading && (
                    <div className="welcome-container">
                        <div className="welcome-message">
                            <p>🤖 안녕하세요, {formatUserName(user?.username)}님!</p>
                            <p>궁금한 점을 물어보거나 아래 제안 중 하나를 선택해보세요.</p>
                        </div>
                        <div className="suggestion-grid">
                            {suggestions.map((text, idx) => (
                                <button 
                                    key={idx} 
                                    className="suggestion-card"
                                    onClick={() => handleSuggestionClick(text)}
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
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
                            if (!input.trim()) {
                                alert("메시지를 입력해주세요.");
                                return;
                            }
                            handleSubmit();
                        }
                    }}
                    placeholder={selectedRoom?.roomId ? "메시지를 입력하세요..." : "새 대화를 시작하려면 메시지를 입력하세요"}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button onClick={handleStop} className="stop-btn">중단</button>
                ) : (
                    <button
                        onClick={() => {
                            if (!input.trim()) {
                                alert("메시지를 입력해주세요.");
                                return;
                            }
                            handleSubmit();
                        }}
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