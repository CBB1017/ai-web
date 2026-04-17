import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { selectedRoomAtom } from '../store/store';
import {type ActionResponse, fetchRoomActions} from '../api/action';

interface ActionPanelProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isLoading?: boolean;
}

export default function ActionPanel({ isCollapsed, onToggle, isLoading }: ActionPanelProps) {
    const { t, i18n } = useTranslation();
    const selectedRoom = useAtomValue(selectedRoomAtom);
    const roomId = selectedRoom?.roomId;

    const { data: actions = [], refetch } = useQuery({
        queryKey: ['actions', roomId],
        queryFn: () => fetchRoomActions(roomId),
        enabled: !!roomId,
    });

    // 💡 답변 생성 중일 때 주기적으로 액션 내역 갱신
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading && roomId) {
            interval = setInterval(() => {
                refetch();
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, roomId, refetch]);

    const handleRollback = (_actionId: string) => {
        // TODO: 백엔드 롤백 API 구현 시 연결
        console.log('Rollback requested for:', _actionId);
    };

    const getStatusColor = (status: ActionResponse['status']) => {
        switch (status) {
            case 'SUCCESS':
                return '#22c55e';
            case 'FAILED':
                return '#ef4444';
            case 'ROLLBACK_SUCCESS':
                return '#3b82f6';
            case 'ROLLBACK_FAILED':
                return '#f59e0b';
            case 'RUNNING':
                return '#3b82f6';
            default:
                return '#94a3b8';
        }
    };

    const getStatusText = (status: ActionResponse['status']) => {
        switch (status) {
            case 'SUCCESS':
                return t('action.success');
            case 'FAILED':
                return t('action.failed');
            case 'ROLLBACK_SUCCESS':
                return t('action.rollbackSuccess');
            case 'ROLLBACK_FAILED':
                return t('action.rollbackFailed');
            case 'RUNNING':
                return '실행 중...'; // TODO: i18n 추가 필요 시 대응
            default:
                return status;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const locale = i18n.language === 'ko' ? 'ko-KR' : i18n.language === 'ja' ? 'ja-JP' : i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <aside 
            className={`action-panel ${isCollapsed ? 'collapsed' : ''}`}
            onMouseEnter={() => isCollapsed && window.innerWidth > 768 && onToggle()}
            onMouseLeave={() => !isCollapsed && window.innerWidth > 768 && onToggle()}
        >
            <div className="action-panel-header">
                {isCollapsed ? (
                    <button className="mini-icon-btn" onClick={onToggle}>⚡</button>
                ) : (
                    <>
                        <h3>{t('action.title')}</h3>
                        <button onClick={onToggle} className="panel-toggle">
                            →
                        </button>
                    </>
                )}
            </div>

            {!isCollapsed && (
                <div className="action-panel-content">
                    <div className="action-list">
                        {actions.length === 0 && !isLoading && (
                            <div className="empty-actions" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                표시할 액션이 없습니다.
                            </div>
                        )}
                        {actions.map((action, index) => (
                            <div key={action.id} className="action-item" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="action-header">
                                    <span className="action-tool-name">
                                        {action.actionName}
                                    </span>
                                    <span
                                        className="action-status"
                                        style={{ color: getStatusColor(action.status) }}
                                    >
                                        ● {getStatusText(action.status)}
                                    </span>
                                </div>
                                <div className="action-details">
                                    <span className="action-time">{formatTime(action.createdAt)}</span>
                                </div>

                                {action.status === 'FAILED' && action.content && (
                                    <div className="action-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                                        ⚠️ {action.content}
                                    </div>
                                )}

                                {action.status === 'SUCCESS' && (
                                    <button
                                        className="rollback-btn"
                                        onClick={() => handleRollback(action.id)}
                                    >
                                        {t('action.rollback')}
                                    </button>
                                )}
                                {(action.status === 'ROLLBACK_SUCCESS' || action.status === 'ROLLBACK_FAILED') && (
                                    <div className="rollback-info">
                                        {t('action.rolledBack')} - {getStatusText(action.status)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
