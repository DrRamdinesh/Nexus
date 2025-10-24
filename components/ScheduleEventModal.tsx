import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types';

interface ScheduleEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    initialTitle?: string;
    initialDate?: Date;
}

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const formatTimeForInput = (date: Date): string => {
    return date.toTimeString().substring(0, 5);
};

export const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ isOpen, onClose, onSave, initialTitle = '', initialDate }) => {
    const [title, setTitle] = useState(initialTitle);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [invitees, setInvitees] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const now = initialDate ? new Date(initialDate) : new Date();
            const startDateTime = new Date(now.getTime());
            const endDateTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

            setTitle(initialTitle);
            setStartDate(formatDateForInput(startDateTime));
            setStartTime(formatTimeForInput(startDateTime));
            setEndDate(formatDateForInput(endDateTime));
            setEndTime(formatTimeForInput(endDateTime));
            setInvitees('');
            setError(null);
        }
    }, [isOpen, initialTitle, initialDate]);

    const handleSave = () => {
        if (!title.trim()) {
            setError('Title cannot be empty.');
            return;
        }

        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError('Invalid date or time format.');
            return;
        }

        if (end <= start) {
            setError('End time must be after start time.');
            return;
        }
        
        const inviteeList = invitees.split(/[,;\s]+/).filter(email => email.trim() !== '');

        onSave({
            title,
            start,
            end,
            invitees: inviteeList.length > 0 ? inviteeList : undefined,
        });
    };

    if (!isOpen) return null;

    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Schedule New Event</h3>
                
                {error && <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center mb-4">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className={labelClass}>Event Title</label>
                        <input id="event-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className={labelClass}>Start Date</label>
                            <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                             <label htmlFor="start-time" className={labelClass}>Start Time</label>
                            <input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={commonInputClass} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="end-date" className={labelClass}>End Date</label>
                            <input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                             <label htmlFor="end-time" className={labelClass}>End Time</label>
                            <input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={commonInputClass} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="invitees" className={labelClass}>Invitees (comma-separated emails)</label>
                        <textarea id="invitees" value={invitees} onChange={(e) => setInvitees(e.target.value)} className={`${commonInputClass} h-20`} placeholder="user1@example.com, user2@example.com"></textarea>
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
                        Save Event
                    </button>
                </div>
            </div>
        </div>
    );
};