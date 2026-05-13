import { fetchEventSource } from '@microsoft/fetch-event-source';
import {useAuth} from "../context/AuthContext.tsx";
import { logInfo, logError } from "../otel.ts";

export const useAiStream = () => {
    const { logout } = useAuth();

    // 💡 네 번째 인자로 AbortSignal을 받도록 수정
    const stream = async (
        url: string,
        prompt: string,
        roomId: string,
        language: string,
        onMessage: (chunk: string, intentId?: string) => void,
        signal?: AbortSignal,
        onRoomIdReceived?: (roomId: string) => void
    ) => {
        let currentIntentId: string | undefined = undefined;
        logInfo("AI Stream starting", { url, roomId, language });

        try {
            await fetchEventSource(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ prompt, roomId, language }),
                credentials: 'include',
                signal: signal,
                openWhenHidden: true,

                async onopen(res) {
                    if (res.status === 401) {
                        logError("AI Stream auth failed", new Error("401 Unauthorized"), { roomId });
                        logout();
                        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
                    }
                    if (res.status === 502 || res.status === 503 || res.status === 504) {
                        logError("AI Stream backend unavailable", new Error(`Status ${res.status}`), { roomId });
                        const error: any = new Error(res.status === 504 ? "GATEWAY_TIMEOUT" : "BACKEND_UNAVAILABLE");
                        error.status = res.status;
                        throw error;
                    }
                    if (!res.ok) {
                        const errorBody = await res.json().catch(() => ({}));
                        logError("AI Stream connection failed", new Error(errorBody.message || `Status ${res.status}`), { roomId, status: res.status });
                        throw new Error(errorBody.message || `서버 오류 (${res.status})`);
                    }

                    const newRoomId = res.headers.get('X-Room-Id');
                    const intentId = res.headers.get('X-Intent-Id');
                    
                    logInfo("AI Stream connection opened", { roomId: newRoomId || roomId, intentId });

                    if (newRoomId && onRoomIdReceived) {
                        onRoomIdReceived(newRoomId);
                    }

                    if (intentId) {
                        currentIntentId = intentId;
                    }
                },

                onmessage(ev) {
                    try {
                        const data = JSON.parse(ev.data);
                        onMessage(data.response, currentIntentId);
                    } catch {
                        onMessage(ev.data, currentIntentId);
                    }
                },

                onerror(err) {
                    if (err.name === 'AbortError' || (err instanceof Error && err.message.includes('abort'))) {
                        logInfo("AI Stream aborted by user", { roomId });
                        throw err; // Abort는 재시도하지 않도록 throw
                    }
                    
                    // 채팅(POST)의 경우 중복 요청이 위험할 수 있으므로 모든 에러 발생 시 즉시 중단하도록 설정
                    logError("AI Stream error occurred, stopping stream", err, { roomId, intentId: currentIntentId });
                    throw err; // 어떤 에러가 발생해도 재시도하지 않고 throw 함으로써 중단
                }
            });
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                logError("AI Stream exception", err, { roomId });
                throw err;
            }
        }
    };

    return { stream };
};