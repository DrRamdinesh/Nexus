import React, { useState } from 'react';
import type { Reminder } from '../types';
import { PlusIcon, TrashIcon, ClockIcon } from '../constants';
import { NewReminderModal } from './NewReminderModal';

interface ReminderBoardWidgetProps {
    reminders: Reminder[];
    setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}

const formatReminderTime = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);

    const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (reminderDate.getTime() === today.getTime()) {
        return `Today, ${timeString}`;
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (reminderDate.getTime() === tomorrow.getTime()) {
        return `Tomorrow, ${timeString}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeString}`;
}

export const ReminderBoardWidget: React.FC<ReminderBoardWidgetProps> = ({ reminders, setReminders }) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleSaveReminder = (newReminderData: Omit<Reminder, 'id'>) => {
        const newReminder: Reminder = {
            ...newReminderData,
            id: `REM-${Date.now()}`
        };
        setReminders(prev => [...prev, newReminder].sort((a,b) => a.time.getTime() - b.time.getTime()));
        setIsAdding(false);
    };

    const handleDeleteReminder = (reminderId: string) => {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
    };
    
    const sortedReminders = [...reminders].sort((a, b) => a.time.getTime() - b.time.getTime());

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Reminder Board</h3>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center space-x-1 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="Add new reminder"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>New Reminder</span>
                    </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2">
                    {sortedReminders.length > 0 ? (
                        <ul className="space-y-2">
                            {sortedReminders.map(reminder => (
                                <li key={reminder.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md group">
                                    <div className="flex-shrink-0">
                                        <ClockIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{reminder.text}</p>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{formatReminderTime(reminder.time)}</span>
                                    <button
                                        onClick={() => handleDeleteReminder(reminder.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 dark:hover:text-red-400"
                                        aria-label={`Delete reminder: ${reminder.text}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <ClockIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No reminders set.</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Click "New Reminder" to add one.</p>
                        </div>
                    )}
                </div>
            </div>
            <NewReminderModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                onSave={handleSaveReminder}
            />
        </>
    );
};