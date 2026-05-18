import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { selectedRoomAtom, isActionInProgressAtom } from '../store/store';
import { type ActionResponse, fetchRoomActions, fetchMyActions } from '../api/action';
import { logInfo } from '../otel';

interface ActionPanelProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onSidebarOpen?: () => void;
    isLoading?: boolean;
    intentId?: string;
}

type ViewMode = 'ROOM' | 'ALL';

export default function ActionPanel({ isCollapsed, onToggle, onSidebarOpen, isLoading, intentId }: ActionPanelProps) {
    const { t, i18n } = useTranslation();
    const selectedRoom = useAtomValue(selectedRoomAtom);
    const isActionInProgress = useAtomValue(isActionInProgressAtom);
    const roomId = selectedRoom?.roomId;
    
    const [viewMode, setViewMode] = useState<ViewMode>('ALL');

    // 방이 바뀌거나 액션이 시작되면 자동으로 'ROOM' 모드로 전환
    useEffect(() => {
        if (roomId || isActionInProgress) {
            setViewMode('ROOM');
        }
    }, [roomId, isActionInProgress]);

    const { data: actions = [] } = useQuery({
        queryKey: ['actions', viewMode, roomId],
        queryFn: () => {
            if (viewMode === 'ROOM' && roomId) {
                return fetchRoomActions(roomId);
            }
            return fetchMyActions();
        },
        enabled: viewMode === 'ALL' || !!roomId,
    });

    const handleRollback = (actionId: string) => {
        logInfo('Rollback requested', { actionId });
    };

    const getStatusColor = (status: ActionResponse['status']) => {
        switch (status) {
            case 'SUCCESS': return '#22c55e';
            case 'FAILED': return '#ef4444';
            case 'ROLLBACK_SUCCESS': return '#3b82f6';
            case 'ROLLBACK_FAILED': return '#f59e0b';
            case 'RUNNING': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    const getStatusText = (status: ActionResponse['status']) => {
        switch (status) {
            case 'SUCCESS': return t('action.success');
            case 'FAILED': return t('action.failed');
            case 'ROLLBACK_SUCCESS': return t('action.rollbackSuccess');
            case 'ROLLBACK_FAILED': return t('action.rollbackFailed');
            case 'RUNNING': return t('action.running');
            default: return status;
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
                    <button 
                        className={`mini-icon-btn ${isActionInProgress ? 'action-active' : ''}`} 
                        onClick={onToggle}
                    >
                        {isActionInProgress ? '⏳' : '⚡'}
                    </button>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3>{t('action.title')}</h3>
                            {isActionInProgress && <span className="action-spinner-mini"></span>}
                        </div>
                        <button onClick={onToggle} className="panel-toggle">
                            →
                        </button>
                    </>
                )}
            </div>

            <div className="action-view-selector">
                <button 
                    className={viewMode === 'ROOM' ? 'active' : ''} 
                    onClick={() => setViewMode('ROOM')}
                >
                    {t('action.room')}
                </button>
                <button 
                    className={viewMode === 'ALL' ? 'active' : ''} 
                    onClick={() => setViewMode('ALL')}
                >
                    {t('action.all')}
                </button>
            </div>

            <div className="action-panel-content">
                <div className="action-list">
                    {actions.length === 0 && !isLoading && (
                        <div className="empty-actions" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                            {viewMode === 'ROOM' && !roomId ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                    <span>{t('action.selectRoomPrompt')}</span>
                                    {onSidebarOpen && (
                                        <button 
                                            onClick={onSidebarOpen}
                                            style={{ 
                                                padding: '5px 10px', 
                                                fontSize: '0.75rem', 
                                                borderRadius: '6px', 
                                                border: '1px solid var(--accent)',
                                                background: 'transparent',
                                                color: 'var(--accent)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('action.openSidebar')}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                t('action.noActions')
                            )}
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

                            {/* MCP 도구(연장근무, 휴가, 근무계획)일 때만 롤백 버튼 표시 */}
                            {action.status === 'SUCCESS' && 
                             ['OVERTIME_ONEDAY', 'OVERTIME_MONTHLY', 'VACATION', 'WORK_PLAN'].includes(intentId || '') && (
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
        </aside>
    );
}
