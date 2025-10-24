import React, { FC } from 'react';
import type { ScheduledReport } from '../types';
import { ClockIcon, TrashIcon } from '../constants';

interface ScheduledReportsWidgetProps {
    schedules: ScheduledReport[];
    onDeleteSchedule: (scheduleId: string) => void;
}

const formatFrequency = (schedule: ScheduledReport): string => {
    const time = new Date(`1970-01-01T${schedule.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    switch(schedule.frequency) {
        case 'Daily':
            return `Daily at ${time}`;
        case 'Weekly':
            const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek ?? 0];
            return `Weekly on ${day} at ${time}`;
        case 'Monthly':
            return `Monthly on day ${schedule.dayOfMonth} at ${time}`;
        case 'One-time':
            return `Once on ${schedule.date} at ${time}`;
        default:
            return 'Custom';
    }
};

export const ScheduledReportsWidget: FC<ScheduledReportsWidgetProps> = ({ schedules, onDeleteSchedule }) => {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Scheduled Reports</h3>
            <div className="max-h-80 overflow-y-auto pr-2">
                {schedules.length > 0 ? (
                    <ul className="space-y-3">
                        {schedules.map(schedule => (
                            <li key={schedule.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md flex items-start space-x-3">
                                <div className="flex-shrink-0 pt-1">
                                    <ClockIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{schedule.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {schedule.targetType}: {schedule.targetName} ({schedule.reportDetailLevel})
                                    </p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">{formatFrequency(schedule)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate" title={schedule.recipients.join(', ')}>
                                        To: {schedule.recipients.join(', ')}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => onDeleteSchedule(schedule.id)}
                                        className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        aria-label={`Delete schedule ${schedule.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <ClockIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No reports have been scheduled yet.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Use the "Schedule Report" button above to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};