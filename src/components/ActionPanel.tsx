import { useState } from 'react';

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
    const [isHovered, setIsHovered] = useState(false);
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
                return '성공';
            case 'failed':
                return '실패';
            case 'rollback-success':
                return '롤백 성공';
            case 'rollback-failed':
                return '롤백 실패';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <>
            {isCollapsed && (
                <div
                    className="action-hover-trigger"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {isHovered && (
                        <button onClick={onToggle} className="panel-toggle-hover">
                            ←
                        </button>
                    )}
                </div>
            )}

            <aside className={`action-panel ${isCollapsed ? 'collapsed' : ''}`}>
                {!isCollapsed && (
                    <>
                        <div className="action-panel-header">
                            <h3>액션 내역</h3>
                            <button onClick={onToggle} className="panel-toggle">
                                →
                            </button>
                        </div>

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
                                            <span className="action-duration">{action.duration}초</span>
                                        </div>
                                        {action.canRollback && !action.isRolledBack && (
                                            <button
                                                className="rollback-btn"
                                                onClick={() => handleRollback(action.id)}
                                            >
                                                롤백
                                            </button>
                                        )}
                                        {action.isRolledBack && (
                                            <div className="rollback-info">
                                                롤백됨 - {getStatusText(action.status)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
