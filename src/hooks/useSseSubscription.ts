import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSetAtom } from 'jotai';
import { isActionInProgressAtom } from '../store/store';
import { logInfo, logError } from '../otel';

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

        logInfo('SSE: Subscription started');
        const eventSource = new EventSource('/api/chat/sse/subscribe', { withCredentials: true });

        const handleEmailSummary = (event: MessageEvent) => {
            if (!event.data || event.data === 'undefined') {
                logError('SSE: Received empty or undefined data in email-summary-complete');
                return;
            }
            try {
                const data = JSON.parse(event.data);
                if (data.messageId && data.content) {
                    // Ref를 통해 최신 함수 호출
                    onMessageUpdateRef.current(data.messageId, data.content);
                    setIsActionInProgress(false);
                }
            } catch (e) {
                logError('SSE: Data parsing error', e, { rawData: event.data });
            }
        };

        const handleErrorEvent = (event: MessageEvent) => {
            if (!event.data || event.data === 'undefined') {
                logError('SSE: Received empty or undefined data in error event');
                onErrorMessageRef.current('알 수 없는 서버 오류가 발생했습니다.');
                setIsActionInProgress(false);
                return;
            }
            try {
                const data = JSON.parse(event.data);
                onErrorMessageRef.current(data.message || '오류가 발생했습니다.');
                setIsActionInProgress(false);
            } catch (e) {
                logError('SSE: Error data parsing error', e, { rawData: event.data });
                onErrorMessageRef.current('서버 응답 처리 중 오류가 발생했습니다.');
                setIsActionInProgress(false);
            }
        };

        eventSource.addEventListener('email-summary-complete', handleEmailSummary);
        eventSource.addEventListener('error', handleErrorEvent);

        eventSource.onerror = (error) => {
            logError('SSE: Connection error (onerror)', error);
            setIsActionInProgress(false);
            eventSource.close();
        };

        return () => {
            logInfo('SSE: Subscription closed');
            eventSource.removeEventListener('email-summary-complete', handleEmailSummary);
            eventSource.removeEventListener('error', handleErrorEvent);
            eventSource.close();
        };
        // 의존성 배열에서 콜백을 제외하여 재연결 방지
    }, [isAuthenticated, setIsActionInProgress]);
}
