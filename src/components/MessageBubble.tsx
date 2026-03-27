import type { ChatMode, Message } from '../hooks/useChatMessages';

interface Props {
    msg: Message;
    mode: ChatMode;
}

export default function MessageBubble({ msg, mode }: Props) {
    const isUser = msg.role === 'user';

    return (
        <div
            className={`message ${msg.role}`}
            style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row'
            }}
        >
            <div
                className="avatar"
                style={{
                    background: isUser ? '#e5e7eb' : 'var(--primary-gradient)',
                    color: isUser ? '#374151' : 'white'
                }}
            >
                {isUser ? '나' : (mode === 'KNOWLEDGE' ? '🎓' : 'AI')}
            </div>
            <div
                className="bubble"
                style={{
                    background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)'
                }}
            >
                {msg.content}
            </div>
        </div>
    );
}