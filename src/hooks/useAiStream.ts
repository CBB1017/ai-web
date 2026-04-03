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

                async onopen(res) {
                    if (res.status === 401) {
                        logout();
                        throw new Error("Unauthorized");
                    }
                    if (!res.ok) throw new Error("Server Error");

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
                    // 사용자가 의도적으로 중단한 경우(AbortError)는 에러로 던지지 않음
                    if (err.name === 'AbortError') return;
                    throw err;
                }
            });
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Stream Error:", err);
            }
        }
    };

    return { stream };
};