import React from 'react';
import type { Alert } from '../../types';
import { BugIcon, ListBulletIcon, BellIcon, TrashIcon } from './icons';

interface AlertsPaneProps {
    alerts: Alert[];
    onAlertClick: (alert: Alert) => void;
    onClearAll: () => void;
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const alertTypeConfig: Record<Alert['type'], { icon: React.FC<{ className?: string }>, color: string }> = {
    'New Critical Defect': { icon: BugIcon, color: 'text-red-500' },
    'New High-Priority Task': { icon: ListBulletIcon, color: 'text-amber-500' },
    'Task Assigned to You': { icon: ListBulletIcon, color: 'text-indigo-500' },
};

export const AlertsPane: React.FC<AlertsPaneProps> = ({ alerts, onAlertClick, onClearAll }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={onClearAll}
                    disabled={alerts.length === 0}
                    className="w-full flex items-center justify-center text-sm font-semibold p-2 rounded-md transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Clear All Notifications
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {alerts.length > 0 ? (
                    <ul className="space-y-1">
                        {alerts.map(alert => {
                            const config = alertTypeConfig[alert.type];
                            const Icon = config.icon;
                            return (
                                <li key={alert.id}>
                                    <button
                                        onClick={() => onAlertClick(alert)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`mt-1 ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{alert.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {alert.project} &bull; {formatTimeAgo(alert.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 px-4">
                        <BellIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                        <h4 className="font-semibold text-slate-600 dark:text-slate-300">All Caught Up!</h4>
                        <p className="text-sm">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};