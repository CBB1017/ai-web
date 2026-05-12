import { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '../hooks/useChatMessages';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import ActionPanel from './ActionPanel';
import {useAuth} from "../context/AuthContext.tsx";
import type {ChatMode, ChatRoom} from "../constants/constant.ts";
import {useAtom, useSetAtom, useAtomValue} from "jotai";
import { useTranslation } from 'react-i18next';
import {useSseSubscription} from "../hooks/useSseSubscription";
import {logInfo} from "../otel.ts";
import {fetchBirthdays} from "../api/birthday.ts";
import {fetchBoardPosts} from "../api/board.ts";
import {selectedRoomAtom, birthdaysAtom, boardPostsAtom, isActionInProgressAtom} from "../store/store.ts";

function LoadingNotice() {
    const { t } = useTranslation();
    const [index, setIndex] = useState(-1); // -1 means showing "Generating..."
    const [birthdays] = useAtom(birthdaysAtom);
    const [boardPosts] = useAtom(boardPostsAtom);
    const [combinedNotices, setCombinedNotices] = useState<any[]>([]);

    useEffect(() => {
        // 공지와 생일자 데이터를 섞음
        const birthdayNotices = birthdays.map(b => ({
            type: 'BIRTHDAY',
            name: `${b.name} ${b.position}`,
            day: parseInt(b.day, 10).toString()
        }));

        const boardNotices = Object.values(boardPosts).flat().map(post => ({
            type: 'NOTICE',
            title: post.title,
            link: post.url
        }));

        // 랜덤 셔플 함수
        const shuffle = (array: any[]) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        const combined = shuffle([...boardNotices, ...birthdayNotices]);
        setCombinedNotices(combined);
    }, [birthdays, boardPosts]);

    useEffect(() => {
        if (combinedNotices.length === 0) return;
        
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % combinedNotices.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [combinedNotices.length]);

    return (
        <div className="loading-notice-container">
            <div className="loader"></div>
            <div className="loading-text-wrapper">
                {index === -1 || !combinedNotices[index] ? (
                    <span className="loading-text fadeIn">{t('chat.generating')}</span>
                ) : (
                    <div key={index} className="loading-text fadeIn">
                        {combinedNotices[index].type === 'NOTICE' ? (
                            <a href={combinedNotices[index].link} className="notice-link">
                                {t('chat.notice', { title: combinedNotices[index].title })}
                            </a>
                        ) : (
                            <div className="birthday-info">
                                <span>{t('chat.birthday', { name: combinedNotices[index].name, day: combinedNotices[index].day })}</span>
                                <button className="congratulate-btn">{t('chat.congratulate')}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function TopNoticeBar() {
    const { t } = useTranslation();
    const [birthdays] = useAtom(birthdaysAtom);
    const [boardPosts] = useAtom(boardPostsAtom);
    const [index, setIndex] = useState(0);
    const [combinedNotices, setCombinedNotices] = useState<any[]>([]);

    useEffect(() => {
        const birthdayNotices = birthdays.map(b => ({
            type: 'BIRTHDAY',
            name: `${b.name} ${b.position}`,
            day: parseInt(b.day, 10).toString()
        }));

        const boardNotices = Object.values(boardPosts).flat().map(post => ({
            type: 'NOTICE',
            title: post.title,
            link: post.url
        }));

        setCombinedNotices([...boardNotices, ...birthdayNotices]);
    }, [birthdays, boardPosts]);

    useEffect(() => {
        if (combinedNotices.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % combinedNotices.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [combinedNotices.length]);

    if (combinedNotices.length === 0) return null;

    const handlePrev = () => {
        setIndex((prev) => (prev - 1 + combinedNotices.length) % combinedNotices.length);
    };

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % combinedNotices.length);
    };

    const current = combinedNotices[index];

    if (!current) return null;

    return (
        <div className="top-notice-bar">
            <span className="notice-badge">{current.type === 'NOTICE' ? t('chat.noticeBadge', { defaultValue: '공지' }) : t('chat.birthdayBadge', { defaultValue: '생일' })}</span>
            <div className="notice-content-wrapper">
                <div key={index} className="notice-text-item fadeIn">
                    {current.type === 'NOTICE' ? (
                        <a href={current.link} target="_blank" rel="noopener noreferrer" className="top-notice-link">
                            {current.title}
                        </a>
                    ) : (
                        <span>{t('chat.birthdayMessage', { name: current.name, day: current.day, defaultValue: `${current.day}일은 ${current.name}님의 생일입니다! 🎉` })}</span>
                    )}
                </div>
            </div>
            <div className="notice-nav">
                <button onClick={handlePrev} className="nav-btn">{"<"}</button>
                <div className="notice-pagination">
                    {index + 1} / {combinedNotices.length}
                </div>
                <button onClick={handleNext} className="nav-btn">{">"}</button>
            </div>
        </div>
    );
}

export default function Chat() {
    const { user, logout } = useAuth();
    const [mode,] = useState<ChatMode>('GENERAL');
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

    const [selectedRoom, setSelectedRoom] = useAtom<ChatRoom>(selectedRoomAtom);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
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
        updateMessageById,
        lastIntentId,
        setLastIntentId,
        addErrorMessage
    } = useChatMessages();

    // 실제 MCP 인텐트 목록
    const mcpIntents = ['OVERTIME_ONEDAY', 'OVERTIME_MONTHLY', 'VACATION', 'WORK_PLAN'];

    // 응답이 완료되면 MCP 모드 초기화
    useEffect(() => {
        if (!isLoading && lastIntentId && mcpIntents.includes(lastIntentId)) {
            const timer = setTimeout(() => {
                setLastIntentId(undefined);
            }, 3000); // 3초 정도 표시 후 초기화
            return () => clearTimeout(timer);
        }
    }, [isLoading, lastIntentId, setLastIntentId]);

    const queryClient = useQueryClient();

    // 💡 탭이 다시 활성화될 때 데이터를 최신화 (SSE 유실 대비)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                logInfo('Tab became visible, syncing data...');
                // 사이드바 목록 갱신
                queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                // 현재 선택된 방의 메시지 목록 갱신
                if (selectedRoom?.roomId) {
                    queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedRoom.roomId] });
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [queryClient, selectedRoom?.roomId]);

    const setBirthdays = useSetAtom(birthdaysAtom);
    const [birthdays] = useAtom(birthdaysAtom);
    const setBoardPosts = useSetAtom(boardPostsAtom);
    const [boardPosts] = useAtom(boardPostsAtom);
    const isActionInProgress = useAtomValue(isActionInProgressAtom);

    // 💡 초기 데이터 로드 (생일자, 게시판 포스트)
    useEffect(() => {
        if (birthdays.length === 0) {
            fetchBirthdays().then(setBirthdays).catch(err => {
                logInfo('Failed to fetch birthdays', err);
            });
        }
        if (Object.keys(boardPosts).length === 0) {
            fetchBoardPosts().then(setBoardPosts).catch(err => {
                logInfo('Failed to fetch board posts', err);
            });
        }
    }, [birthdays.length, boardPosts, setBirthdays, setBoardPosts]);

    // SSE 구독 활성화 (메시지 업데이트, 에러 처리, 제목 업데이트, 액션 업데이트, 생일자 업데이트, 게시판 업데이트)
    useSseSubscription(
        updateMessageById, 
        addErrorMessage,
        (roomId, title) => {
            logInfo('SSE: Received title update', { roomId, title });
            // 💡 사이드바 목록 갱신
            queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
            
            // 💡 현재 보고 있는 방이라면 제목 업데이트
            if (selectedRoom?.roomId === roomId) {
                setSelectedRoom(prev => prev ? { ...prev, title } : prev);
            }
        },
        (action) => {
            logInfo('SSE: Received action update', action);
            // 💡 액션 목록 갱신
            queryClient.invalidateQueries({ queryKey: ['actions'] });
        },
        (updatedBirthdays) => {
            logInfo('SSE: Received birthday update', updatedBirthdays);
            setBirthdays(updatedBirthdays);
        },
        (updatedBoardPosts) => {
            logInfo('SSE: Received board update', updatedBoardPosts);
            setBoardPosts(updatedBoardPosts);
        }
    );

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
        const nextPinned = !isSidebarPinned;
        setIsSidebarPinned(nextPinned);
        if (nextPinned) {
            setSidebarCollapsed(false);
        }
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
        { key: 'workPlan', text: t('chat.suggestions.workPlan') },
        { key: 'roomReservation', text: t('chat.suggestions.roomReservation') },
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
                <div className="header-left">
                    <button className="mobile-sidebar-toggle" onClick={handleSidebarToggle}>
                        ☰
                    </button>
                    <div className="logo">
                        <span className="user-name">🤖 {formatUserName(user?.username)}</span>
                        <span className="service-suffix">{t('chat.userSuffix')}</span>
                    </div>
                </div>

                <div className="header-center">
                    <img src="/logo.png" alt="logo" className="header-logo" />
                </div>

                <div className="header-right">
                    <button className="mobile-action-toggle" onClick={handleActionPanelToggle}>
                        ⚡
                    </button>

                    <div className="language-selector" style={{ display: 'flex', gap: '5px' }}>
                        <select value={i18n.resolvedLanguage} onChange={(e) => changeLanguage(e.target.value)} style={{ padding: '2px 5px', fontSize: '0.8rem', borderRadius: '5px' }}>
                            <option value="ko">KO</option>
                            <option value="en">EN</option>
                            <option value="ja">JA</option>
                            <option value="vi">VI</option>
                        </select>
                    </div>

                    <div className="pc-logout-btn">
                        <button 
                            onClick={() => logoutMutation.mutate()} 
                            disabled={logoutMutation.isPending}
                            style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '8px', height: 'auto', width: 'auto' }}
                        >
                            {logoutMutation.isPending ? t('chat.loggingOut') : t('chat.logout')}
                        </button>
                    </div>

                    <div className="profile-container" ref={profileRef}>
                        <button className="profile-icon-btn" onClick={toggleProfile}>
                            👤
                        </button>
                        {isProfileOpen && (
                            <div className="profile-dropdown">
                                <div className="profile-info-item">
                                    <span className="user-name-dropdown">🤖 {formatUserName(user?.username)}</span>
                                    <span className="service-suffix-dropdown">{t('chat.userSuffix')}</span>
                                </div>
                                <div className="profile-divider"></div>
                                <button
                                    className="logout-dropdown-btn"
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                >
                                    {logoutMutation.isPending ? t('chat.loggingOut') : t('chat.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <TopNoticeBar />

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
                        <MessageBubble 
                            key={idx} 
                            msg={msg} 
                            mode={mode} 
                            isActionInProgress={
                                isActionInProgress && 
                                !isLoading && 
                                msg.role === 'ASSISTANT' && 
                                idx === messages.length - 1
                            }
                        />
                    ))}

                {isLoading && (messages.length === 0 || messages[messages.length - 1]?.content === '') && (
                    <LoadingNotice />
                )}
            </main>

            <footer className="input-area">
                <div className="textarea-wrapper">
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
                    />
                    {modeInfo && (
                        <div className="input-mode-badge">
                            <span className={`mode-badge ${modeInfo.className}`}>
                                {modeInfo.label}
                            </span>
                        </div>
                    )}
                </div>
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

            <ActionPanel 
                isCollapsed={actionPanelCollapsed} 
                onToggle={handleActionPanelToggle}
                onSidebarOpen={() => setSidebarCollapsed(false)}
                isLoading={isLoading} 
                intentId={lastIntentId}
            />
        </div>
    );
}