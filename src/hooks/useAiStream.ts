import { fetchEventSource } from '@microsoft/fetch-event-source';
import {useAuth} from "../context/AuthContext.tsx";

export const useAiStream = () => {
    const { logout } = useAuth();

    // 💡 네 번째 인자로 AbortSignal을 받도록 수정
    const stream = async (
        url: string,
        prompt: string,
        roomId: string,
        onMessage: (chunk: string) => void,
        signal?: AbortSignal,
        onRoomIdReceived?: (roomId: string) => void
    ) => {
        try {
            await fetchEventSource(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ prompt, roomId }),
                credentials: 'include',
                signal: signal,
                openWhenHidden: true,

                async onopen(res) {
                    if (res.status === 401) {
                        logout();
                        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
                    }
                    if (res.status === 502 || res.status === 503) {
                        throw { status: res.status, message: "HIGH_DEMAND" };
                    }
                    if (!res.ok) {
                        const errorBody = await res.json().catch(() => ({}));
                        throw new Error(errorBody.message || `서버 오류 (${res.status})`);
                    }

                    const newRoomId = res.headers.get('X-Room-Id');
                    if (newRoomId && onRoomIdReceived) {
                        onRoomIdReceived(newRoomId);
                    }
                },

                onmessage(ev) {
                    try {
                        const data = JSON.parse(ev.data);
                        onMessage(data.response);
                    } catch {
                        onMessage(ev.data);
                    }
                },

                onerror(err) {
                    if (err.name === 'AbortError') return;
                    throw err; // Rethrow to stop retry and catch in useChatMessages
                }
            });
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                throw err;
            }
        }
    };

    return { stream };
};