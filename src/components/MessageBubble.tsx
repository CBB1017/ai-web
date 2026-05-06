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

    // 💡 URL을 하이퍼링크로 변환하는 함수
    const renderContentWithLinks = (content: string) => {
        if (!content) return null;

        // URL 정규식
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a 
                        key={index} 
                        href={part} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="message-link"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className={`message-wrapper ${isUser ? 'user' : 'ai'}`}>
            {!isUser && (
                <div className="avatar ai">
                    {mode === 'KNOWLEDGE' ? '🎓' : '🤖'}
                </div>
            )}
            <div className="message-content">
                <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
                    <div className="bubble-text">
                        {renderContentWithLinks(msg.content)}
                    </div>
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
