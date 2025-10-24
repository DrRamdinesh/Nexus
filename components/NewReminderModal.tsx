import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';

interface NewReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reminder: Omit<Reminder, 'id'>) => void;
}

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const formatTimeForInput = (date: Date): string => {
    return date.toTimeString().substring(0, 5);
};


export const NewReminderModal: React.FC<NewReminderModalProps> = ({ isOpen, onClose, onSave }) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setText('');
            setDate(formatDateForInput(now));
            setTime(formatTimeForInput(now));
            setError(null);
        }
    }, [isOpen]);

    const handleSave = () => {
        setError(null);
        if (!text.trim()) {
            setError('Reminder text is required.');
            return;
        }

        const reminderDateTime = new Date(`${date}T${time}`);
        if (isNaN(reminderDateTime.getTime()) || !date || !time) {
            setError('Invalid date or time.');
            return;
        }

        const newReminderData: Omit<Reminder, 'id'> = {
            text: text.trim(),
            time: reminderDateTime,
        };
        onSave(newReminderData);
    };

    if (!isOpen) return null;

    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">New Reminder</h3>
                
                {error && <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center mb-4">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="reminder-text" className={labelClass}>Reminder</label>
                        <input id="reminder-text" name="text" type="text" value={text} onChange={(e) => setText(e.target.value)} className={commonInputClass} placeholder="Follow up with..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reminder-date" className={labelClass}>Date</label>
                            <input id="reminder-date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                            <label htmlFor="reminder-time" className={labelClass}>Time</label>
                            <input id="reminder-time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={commonInputClass} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        Save Reminder
                    </button>
                </div>
            </div>
        </div>
    );
};