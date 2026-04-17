import type {Props} from "../constants/constant.ts";
import { useTranslation } from 'react-i18next';

export default function MessageBubble({ msg, mode }: Props) {
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
                    {/* React automatically escapes strings, preventing basic XSS. 
                        Do NOT use dangerouslySetInnerHTML without DOMPurify. */}
                    {msg.content}
                </div>
                {/* 추후 타임스탬프 추가 가능 공간 */}
            </div>
            {isUser && (
                <div className="avatar user">
                    {t('chat.me')}
                </div>
            )}
        </div>
    );
}
