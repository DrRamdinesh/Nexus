import React, { useState, useEffect, FC } from 'react';
import type { ScheduledReport } from '../types';

interface ScheduleReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (schedule: Omit<ScheduledReport, 'id'>) => void;
    targetType: 'Project' | 'Vendor';
    targetName: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialState = {
    name: '',
    reportDetailLevel: 'Detailed' as 'Brief' | 'Detailed',
    frequency: 'Weekly' as ScheduledReport['frequency'],
    time: '09:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    date: getTodayDateString(),
    recipients: '',
};

export const ScheduleReportModal: FC<ScheduleReportModalProps> = ({ isOpen, onClose, onSave, targetType, targetName }) => {
    const [scheduleData, setScheduleData] = useState(initialState);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setScheduleData({
                ...initialState,
                name: `${targetName} ${targetType} Report`,
                date: getTodayDateString(),
            });
            setError(null);
        }
    }, [isOpen, targetType, targetName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setScheduleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setError(null);
        if (!scheduleData.name.trim()) {
            setError('Report name is required.');
            return;
        }
        if (scheduleData.recipients.trim() === '') {
            setError('At least one recipient email is required.');
            return;
        }
        
        const recipientList = scheduleData.recipients.split(/[,;\s]+/).filter(email => email.trim() !== '');
         if (recipientList.some(email => !/\S+@\S+\.\S+/.test(email))) {
            setError('Please enter valid, comma-separated email addresses.');
            return;
        }


        const newSchedule: Omit<ScheduledReport, 'id'> = {
            name: scheduleData.name.trim(),
            reportDetailLevel: scheduleData.reportDetailLevel,
            targetType,
            targetName,
            frequency: scheduleData.frequency,
            time: scheduleData.time,
            recipients: recipientList,
            dayOfWeek: scheduleData.frequency === 'Weekly' ? Number(scheduleData.dayOfWeek) : undefined,
            dayOfMonth: scheduleData.frequency === 'Monthly' ? Number(scheduleData.dayOfMonth) : undefined,
            date: scheduleData.frequency === 'One-time' ? scheduleData.date : undefined,
        };
        onSave(newSchedule);
    };

    if (!isOpen) return null;

    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Schedule Report</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">For {targetType}: <span className="font-semibold">{targetName}</span></p>
                
                {error && <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center mb-4">{error}</div>}

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="schedule-name" className={labelClass}>Report Name</label>
                        <input id="schedule-name" name="name" type="text" value={scheduleData.name} onChange={handleChange} className={commonInputClass} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="schedule-detail" className={labelClass}>Detail Level</label>
                            <select id="schedule-detail" name="reportDetailLevel" value={scheduleData.reportDetailLevel} onChange={handleChange} className={commonInputClass}>
                                <option value="Detailed">Detailed</option>
                                <option value="Brief">Brief</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="schedule-frequency" className={labelClass}>Frequency</label>
                            <select id="schedule-frequency" name="frequency" value={scheduleData.frequency} onChange={handleChange} className={commonInputClass}>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="One-time">One-time</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {scheduleData.frequency === 'Weekly' && (
                            <div>
                                <label htmlFor="schedule-dayOfWeek" className={labelClass}>Day of Week</label>
                                <select id="schedule-dayOfWeek" name="dayOfWeek" value={scheduleData.dayOfWeek} onChange={handleChange} className={commonInputClass}>
                                    <option value={1}>Monday</option>
                                    <option value={2}>Tuesday</option>
                                    <option value={3}>Wednesday</option>
                                    <option value={4}>Thursday</option>
                                    <option value={5}>Friday</option>
                                    <option value={6}>Saturday</option>
                                    <option value={0}>Sunday</option>
                                </select>
                            </div>
                        )}
                        {scheduleData.frequency === 'Monthly' && (
                            <div>
                                <label htmlFor="schedule-dayOfMonth" className={labelClass}>Day of Month</label>
                                <input id="schedule-dayOfMonth" name="dayOfMonth" type="number" min="1" max="31" value={scheduleData.dayOfMonth} onChange={handleChange} className={commonInputClass} />
                            </div>
                        )}
                        {scheduleData.frequency === 'One-time' && (
                            <div>
                                <label htmlFor="schedule-date" className={labelClass}>Date</label>
                                <input id="schedule-date" name="date" type="date" value={scheduleData.date} onChange={handleChange} className={commonInputClass} />
                            </div>
                        )}
                         <div className={scheduleData.frequency === 'Daily' ? 'col-span-2' : ''}>
                            <label htmlFor="schedule-time" className={labelClass}>Time</label>
                            <input id="schedule-time" name="time" type="time" value={scheduleData.time} onChange={handleChange} className={commonInputClass} />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="schedule-recipients" className={labelClass}>Recipients (comma-separated)</label>
                        <textarea id="schedule-recipients" name="recipients" value={scheduleData.recipients} onChange={handleChange} className={`${commonInputClass} h-20`} placeholder="user1@example.com, user2@example.com"></textarea>
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
                        Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};