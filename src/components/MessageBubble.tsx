import type {Props} from "../constants/constant.ts";

export default function MessageBubble({ msg, mode }: Props) {
    const isUser = msg.role === 'USER';

    return (
        <div className={`message-wrapper ${isUser ? 'user' : 'ai'}`}>
            {!isUser && (
                <div className="avatar ai">
                    {mode === 'KNOWLEDGE' ? '🎓' : '🤖'}
                </div>
            )}
            <div className="message-content">
                <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
                    {msg.content}
                </div>
                {/* 추후 타임스탬프 추가 가능 공간 */}
            </div>
            {isUser && (
                <div className="avatar user">
                    나
                </div>
            )}
        </div>
    );
}
