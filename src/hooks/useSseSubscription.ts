import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSetAtom } from 'jotai';
import { isActionInProgressAtom, type BirthdayResponse } from '../store/store';
import { logInfo, logError } from '../otel';
import { useTranslation } from 'react-i18next';

export function useSseSubscription(
    onMessageUpdate: (messageId: string, content: string) => void,
    onErrorMessage: (error: string) => void,
    onTitleUpdate: (roomId: string, title: string) => void,
    onActionUpdate: (action: any) => void,
    onBirthdayUpdate?: (birthdays: BirthdayResponse[]) => void,
    onBoardUpdate?: (boardPosts: any) => void,
    onRecentBoardUpdate?: (recentPosts: any) => void
) {
    const { isAuthenticated } = useAuth();
    const setIsActionInProgress = useSetAtom(isActionInProgressAtom);
    const { t } = useTranslation();
    
    // 콜백 함수들을 Ref에 저장하여 의존성에서 제거
    const onMessageUpdateRef = useRef(onMessageUpdate);
    const onErrorMessageRef = useRef(onErrorMessage);
    const onTitleUpdateRef = useRef(onTitleUpdate);
    const onActionUpdateRef = useRef(onActionUpdate);
    const onBirthdayUpdateRef = useRef(onBirthdayUpdate);
    const onBoardUpdateRef = useRef(onBoardUpdate);
    const onRecentBoardUpdateRef = useRef(onRecentBoardUpdate);

    // 알림 권한 요청
    useEffect(() => {
        if (isAuthenticated && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    logInfo(`Notification permission: ${permission}`);
                });
            }
        }
    }, [isAuthenticated]);

    // 렌더링될 때마다 Ref 업데이트 (최신 참조 유지)
    useEffect(() => {
        onMessageUpdateRef.current = onMessageUpdate;
        onErrorMessageRef.current = onErrorMessage;
        onTitleUpdateRef.current = onTitleUpdate;
        onActionUpdateRef.current = onActionUpdate;
        onBirthdayUpdateRef.current = onBirthdayUpdate;
        onBoardUpdateRef.current = onBoardUpdate;
        onRecentBoardUpdateRef.current = onRecentBoardUpdate;
    });

    const eventSourceRef = useRef<EventSource | null>(null);
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = () => {
        if (!isAuthenticated) return;
        
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        logInfo(`SSE: Attempting connection (Retry: ${retryCountRef.current})`);
        const eventSource = new EventSource('/api/v1/chat/sse/subscribe', { withCredentials: true });
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('email-summary-complete', handleEmailSummary);
        eventSource.addEventListener('chat-title-update', handleTitleUpdate);
        eventSource.addEventListener('action-list-update', handleActionUpdate);
        eventSource.addEventListener('birthday-update', handleBirthdayUpdate);
        eventSource.addEventListener('board-update', handleBoardUpdate);
        eventSource.addEventListener('recent-board-update', handleRecentBoardUpdate);
        eventSource.addEventListener('error', handleErrorEvent);

        eventSource.onopen = () => {
            logInfo('SSE: Connection established');
            retryCountRef.current = 0; // 성공 시 카운트 초기화
        };

        eventSource.onerror = (error) => {
            logError('SSE: Connection error', error);
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            const maxRetries = 10;
            if (retryCountRef.current < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000); // 지수 백오프 (최대 30초)
                logInfo(`SSE: Retrying in ${delay}ms...`);
                retryTimeoutRef.current = setTimeout(() => {
                    retryCountRef.current++;
                    connect();
                }, delay);
            } else {
                logError('SSE: Max retries reached');
                onErrorMessageRef.current('알림 서버와의 연결이 끊겼습니다. 페이지를 새로고침 해주세요.');
                setIsActionInProgress(false);
            }
        };
    };

    const handleEmailSummary = (event: MessageEvent) => {
        setIsActionInProgress(false);
        if (!event.data || event.data === 'undefined') {
            logError('SSE: Received empty or undefined data in email-summary-complete');
            return;
        }
        try {
            const data = JSON.parse(event.data);
            if (data.messageId && data.content) {
                onMessageUpdateRef.current(data.messageId, data.content);
                showBrowserNotification(t('chat.notifications.emailSummaryTitle'), t('chat.notifications.emailSummaryBody'));
            }
        } catch (e) {
            logError('SSE: Data parsing error', e, { rawData: event.data });
        }
    };

    const handleTitleUpdate = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') return;
        try {
            const data = JSON.parse(event.data);
            if (data.roomId && data.title) onTitleUpdateRef.current(data.roomId, data.title);
        } catch (e) {
            logError('SSE: Title update parsing error', e);
        }
    };

    const handleActionUpdate = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') return;
        try {
            const data = JSON.parse(event.data);
            onActionUpdateRef.current(data);
        } catch (e) {
            logError('SSE: Action update parsing error', e);
        }
    };

    const handleBirthdayUpdate = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') return;
        try {
            const data = JSON.parse(event.data);
            if (onBirthdayUpdateRef.current) onBirthdayUpdateRef.current(data);
        } catch (e) {
            logError('SSE: Birthday update parsing error', e);
        }
    };

    const handleBoardUpdate = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') return;
        try {
            const data = JSON.parse(event.data);
            if (onBoardUpdateRef.current) onBoardUpdateRef.current(data);
        } catch (e) {
            logError('SSE: Board update parsing error', e);
        }
    };

    const handleRecentBoardUpdate = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') return;
        try {
            const data = JSON.parse(event.data);
            if (onRecentBoardUpdateRef.current) onRecentBoardUpdateRef.current(data);
        } catch (e) {
            logError('SSE: Recent board update parsing error', e);
        }
    };

    const handleErrorEvent = (event: MessageEvent) => {
        if (!event.data || event.data === 'undefined') {
            logError('SSE: Received empty or undefined data in error event');
            // background/foreground 전환 시 발생하는 일시적 연결 끊김은 connect() 단계에서 처리하므로
            // 여기서는 실제 에러 메시지가 온 경우만 처리하도록 변경 가능
            return;
        }
        try {
            const data = JSON.parse(event.data);
            onErrorMessageRef.current(data.message || '오류가 발생했습니다.');
            setIsActionInProgress(false);

            showBrowserNotification(
                t('chat.notifications.errorTitle'),
                data.message || '오류가 발생했습니다.'
            );
        } catch (e) {
            logError('SSE: Error data parsing error', e, { rawData: event.data });
            onErrorMessageRef.current('서버 응답 처리 중 오류가 발생했습니다.');
            setIsActionInProgress(false);
        }
    };

    const showBrowserNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: '/logo.png'
            });
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        connect();

        return () => {
            logInfo('SSE: Subscription closed');
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [isAuthenticated]);

    return { reconnect: connect };
}
