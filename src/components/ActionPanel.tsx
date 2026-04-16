import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MCPAction {
    id: string;
    toolName: string;
    timestamp: Date;
    status: 'success' | 'failed' | 'rollback-success' | 'rollback-failed';
    duration: number;
    canRollback: boolean;
    isRolledBack: boolean;
}

interface ActionPanelProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function ActionPanel({ isCollapsed, onToggle }: ActionPanelProps) {
    const { t, i18n } = useTranslation();
    const [actions, setActions] = useState<MCPAction[]>([
        {
            id: '1',
            toolName: 'search_documents',
            timestamp: new Date(Date.now() - 5000),
            status: 'success',
            duration: 1.2,
            canRollback: false,
            isRolledBack: false,
        },
        {
            id: '2',
            toolName: 'update_database',
            timestamp: new Date(Date.now() - 15000),
            status: 'success',
            duration: 0.8,
            canRollback: true,
            isRolledBack: false,
        },
        {
            id: '3',
            toolName: 'send_email',
            timestamp: new Date(Date.now() - 30000),
            status: 'failed',
            duration: 2.5,
            canRollback: false,
            isRolledBack: false,
        },
    ]);

    const handleRollback = (actionId: string) => {
        setActions((prev) =>
            prev.map((action) =>
                action.id === actionId
                    ? {
                          ...action,
                          isRolledBack: true,
                          status: Math.random() > 0.2 ? 'rollback-success' : 'rollback-failed',
                      }
                    : action
            )
        );
    };

    const getStatusColor = (status: MCPAction['status']) => {
        switch (status) {
            case 'success':
                return '#22c55e';
            case 'failed':
                return '#ef4444';
            case 'rollback-success':
                return '#3b82f6';
            case 'rollback-failed':
                return '#f59e0b';
        }
    };

    const getStatusText = (status: MCPAction['status']) => {
        switch (status) {
            case 'success':
                return t('action.success');
            case 'failed':
                return t('action.failed');
            case 'rollback-success':
                return t('action.rollbackSuccess');
            case 'rollback-failed':
                return t('action.rollbackFailed');
        }
    };

    const formatTime = (date: Date) => {
        const locale = i18n.language === 'ko' ? 'ko-KR' : i18n.language === 'ja' ? 'ja-JP' : i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <aside 
            className={`action-panel ${isCollapsed ? 'collapsed' : ''}`}
            // PC에서 마우스가 들어오면 자동으로 열림
            onMouseEnter={() => isCollapsed && window.innerWidth > 768 && onToggle()}
            // PC에서 마우스가 나가면 자동으로 닫힘
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
                        {actions.map((action, index) => (
                            <div key={action.id} className="action-item" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="action-header">
                                    <a href="#" className="action-tool-name" onClick={(e) => e.preventDefault()}>
                                        {action.toolName}
                                    </a>
                                    <span
                                        className="action-status"
                                        style={{ color: getStatusColor(action.status) }}
                                    >
                                        ● {getStatusText(action.status)}
                                    </span>
                                </div>
                                <div className="action-details">
                                    <span className="action-time">{formatTime(action.timestamp)}</span>
                                    <span className="action-duration">{action.duration}{t('action.seconds')}</span>
                                </div>
                                {action.canRollback && !action.isRolledBack && (
                                    <button
                                        className="rollback-btn"
                                        onClick={() => handleRollback(action.id)}
                                    >
                                        {t('action.rollback')}
                                    </button>
                                )}
                                {action.isRolledBack && (
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
