import type {Message} from "../constants/constant.ts";
import { useTranslation } from 'react-i18next';

interface MessageBubbleProps {
    msg: Message;
    mode?: string;
    isActionInProgress?: boolean;
}

export default function MessageBubble({ msg, mode, isActionInProgress }: MessageBubbleProps) {
    const isUser = msg.role === 'USER';
    const { t } = useTranslation();

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
                    {!isUser && isActionInProgress && (
                        <div className="message-action-spinner">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}
                </div>
            </div>
            {isUser && (
                <div className="avatar user">
                    {t('chat.me')}
                </div>
            )}
        </div>
    );
}
