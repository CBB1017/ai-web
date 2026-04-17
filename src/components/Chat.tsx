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
import { useTranslation } from 'react-i18next';

const MOCK_NOTICES = [
    { type: 'NOTICE', title: '2024년 연봉 협상 안내', link: '#' },
    { type: 'BIRTHDAY', name: '김철수 대리' },
    { type: 'NOTICE', title: '신규 사내 복지 제도 시행', link: '#' },
    { type: 'BIRTHDAY', name: '이영희 팀장' },
];

function LoadingNotice() {
    const { t } = useTranslation();
    const [index, setIndex] = useState(-1); // -1 means showing "Generating..."

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MOCK_NOTICES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-notice-container">
            <div className="loader"></div>
            <div className="loading-text-wrapper">
                {index === -1 ? (
                    <span className="loading-text fadeIn">{t('chat.generating')}</span>
                ) : (
                    <div key={index} className="loading-text fadeIn">
                        {MOCK_NOTICES[index].type === 'NOTICE' ? (
                            <a href={MOCK_NOTICES[index].link} className="notice-link">
                                {t('chat.notice', { title: MOCK_NOTICES[index].title })}
                            </a>
                        ) : (
                            <div className="birthday-info">
                                <span>{t('chat.birthday', { name: MOCK_NOTICES[index].name })}</span>
                                <button className="congratulate-btn">{t('chat.congratulate')}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Chat() {
    const { user, logout } = useAuth();
    const [mode, setMode] = useState<ChatMode>('GENERAL');
    const { t, i18n } = useTranslation();

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
        handleStop,
        lastIntentId
    } = useChatMessages();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 💡 텍스트 입력 시 높이 자동 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '54px';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = window.innerWidth <= 768 ? 120 : 200;
            const targetHeight = Math.min(Math.max(scrollHeight, 54), maxHeight);
            textareaRef.current.style.height = `${targetHeight}px`;
            
            // maxHeight 넘을 때만 내부 스크롤 허용
            textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);

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
        { key: 'mcp', text: t('chat.suggestions.mcp') },
        { key: 'vacation', text: t('chat.suggestions.vacation') },
        { key: 'ot', text: t('chat.suggestions.ot') },
        { key: 'email', text: t('chat.suggestions.email') },
        { key: 'rule', text: t('chat.suggestions.rule') }
    ];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const getModeInfo = () => {
        if (!lastIntentId) return null;
        if (lastIntentId === 'POLICY') return { label: 'RAG', className: 'rag' };
        if (lastIntentId === 'GENERAL') return { label: '일반', className: 'general' };
        return { label: 'MCP', className: 'mcp' };
    };

    const modeInfo = getModeInfo();

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
                    <span className="service-suffix">{t('chat.userSuffix')}</span>
                </div>

                <button className="mobile-action-toggle" onClick={handleActionPanelToggle}>
                    ⚡
                </button>

                <div className="mode-selector">
                    <select value={mode} onChange={(e) => setMode(e.target.value as ChatMode)} disabled={isLoading}>
                        <option value="GENERAL">{t('chat.modeGeneral')}</option>
                        <option value="KNOWLEDGE">{t('chat.modeKnowledge')}</option>
                    </select>
                </div>

                <div className="language-selector" style={{ display: 'flex', gap: '5px' }}>
                    <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)} style={{ padding: '2px 5px', fontSize: '0.8rem', borderRadius: '5px' }}>
                        <option value="ko">KO</option>
                        <option value="en">EN</option>
                        <option value="ja">JA</option>
                        <option value="vi">VI</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => logoutMutation.mutate()} 
                        disabled={logoutMutation.isPending}
                        style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '8px', height: 'auto', width: 'auto' }}
                    >
                        {logoutMutation.isPending ? t('chat.loggingOut') : t('chat.logout')}
                    </button>
                </div>
            </header>

            <main className="chat-window" ref={scrollRef} onScroll={handleScroll}>
                {messages.length === 0 && !isLoading && (
                    <div className="welcome-container">
                        <div className="welcome-message">
                            <p>🤖 {t('chat.welcomeTitle', { name: formatUserName(user?.username) })}</p>
                            <p>{t('chat.welcomeSubtitle')}</p>
                        </div>
                        <div className="suggestion-grid">
                            {suggestions.map((suggestion, idx) => (
                                <button 
                                    key={idx} 
                                    className="suggestion-card"
                                    onClick={() => handleSuggestionClick(suggestion.text)}
                                >
                                    {suggestion.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages
                    .filter(msg => !(msg.role === 'ASSISTANT' && msg.content === ''))
                    .map((msg, idx) => (
                        <MessageBubble key={idx} msg={msg} mode={mode} />
                    ))}

                {isLoading && (messages.length === 0 || messages[messages.length - 1]?.content === '') && (
                    <LoadingNotice />
                )}
            </main>

            {modeInfo && (
                <div className="mode-indicator-container">
                    <span className={`mode-badge ${modeInfo.className}`}>
                        {modeInfo.label}
                    </span>
                </div>
            )}

            <footer className="input-area">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    maxLength={3000}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        // 💡 한글 입력 중 Enter 중복 처리 방지 (!e.nativeEvent.isComposing)
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            if (e.shiftKey || e.ctrlKey) {
                                // Shift+Enter 또는 Ctrl+Enter 면 기본 동작(다음 줄 이동)을 허용
                                return;
                            }
                            
                            // 그냥 Enter면 전송
                            e.preventDefault();
                            if (!input.trim()) {
                                alert(t('chat.inputEmptyAlert'));
                                return;
                            }
                            handleSubmit();
                        }
                    }}
                    placeholder={selectedRoom?.roomId ? t('chat.inputPlaceholder') : t('chat.newChatPlaceholder')}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button onClick={handleStop} className="stop-btn">{t('chat.stop')}</button>
                ) : (
                    <button
                        onClick={() => {
                            if (!input.trim()) {
                                alert(t('chat.inputEmptyAlert'));
                                return;
                            }
                            handleSubmit();
                        }}
                    >
                        {t('chat.send')}
                    </button>
                )}
            </footer>
        </div>

            <ActionPanel isCollapsed={actionPanelCollapsed} onToggle={handleActionPanelToggle} isLoading={isLoading} />
        </div>
    );
}