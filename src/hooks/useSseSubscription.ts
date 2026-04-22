import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSetAtom } from 'jotai';
import { isActionInProgressAtom } from '../store/store';

export function useSseSubscription(
    onMessageUpdate: (messageId: string, content: string) => void,
    onErrorMessage: (error: string) => void
) {
    const { isAuthenticated } = useAuth();
    const setIsActionInProgress = useSetAtom(isActionInProgressAtom);
    
    // 콜백 함수들을 Ref에 저장하여 의존성에서 제거
    const onMessageUpdateRef = useRef(onMessageUpdate);
    const onErrorMessageRef = useRef(onErrorMessage);

    // 렌더링될 때마다 Ref 업데이트 (최신 참조 유지)
    useEffect(() => {
        onMessageUpdateRef.current = onMessageUpdate;
        onErrorMessageRef.current = onErrorMessage;
    });

    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('SSE 구독 시작 (최초 1회)');
        const eventSource = new EventSource('/api/chat/sse/subscribe', { withCredentials: true });

        const handleEmailSummary = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.messageId && data.content) {
                    // Ref를 통해 최신 함수 호출
                    onMessageUpdateRef.current(data.messageId, data.content);
                    setIsActionInProgress(false);
                }
            } catch (e) {
                console.error('SSE data parsing error:', e);
            }
        };

        const handleErrorEvent = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                onErrorMessageRef.current(data.message || '오류가 발생했습니다.');
                setIsActionInProgress(false);
            } catch (e) {
                console.error('SSE error data parsing error:', e);
            }
        };

        eventSource.addEventListener('email-summary-complete', handleEmailSummary);
        eventSource.addEventListener('error', handleErrorEvent);

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            setIsActionInProgress(false);
            eventSource.close();
        };

        return () => {
            console.log('SSE 구독 해제');
            eventSource.removeEventListener('email-summary-complete', handleEmailSummary);
            eventSource.removeEventListener('error', handleErrorEvent);
            eventSource.close();
        };
        // 의존성 배열에서 콜백을 제외하여 재연결 방지
    }, [isAuthenticated, setIsActionInProgress]);
}
