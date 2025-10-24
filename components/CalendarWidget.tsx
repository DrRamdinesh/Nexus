import React, { useState } from 'react';
import type { CalendarEvent } from '../types';
import { PlusIcon, UsersIcon } from '../constants';
import { ScheduleEventModal } from './ScheduleEventModal';

interface CalendarWidgetProps {
    events: CalendarEvent[];
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, onAddEvent }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today for accurate comparison

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });
    
    const getEventsForDay = (date: Date) => {
        return events.filter(event => 
            event.start.getFullYear() === date.getFullYear() &&
            event.start.getMonth() === date.getMonth() &&
            event.start.getDate() === date.getDate()
        ).sort((a, b) => a.start.getTime() - b.start.getTime());
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '');
    }
    
    const handleSaveEvent = (event: Omit<CalendarEvent, 'id'>) => {
        onAddEvent(event);
        setIsAddingEvent(false);
    };

    const selectedDayEvents = getEventsForDay(selectedDate);

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">This Week's Calendar</h3>
                    <button 
                        onClick={() => setIsAddingEvent(true)}
                        className="flex items-center space-x-1 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="Add new event"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Event</span>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((date, index) => {
                        const isToday = date.getTime() === today.getTime();
                        const isSelected = date.getTime() === selectedDate.getTime();
                        
                        const dayClasses = `flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                            ${isSelected ? 'bg-indigo-600' : isToday ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`;
                        
                        const dateTextClasses = `text-lg font-bold mt-1 
                            ${isSelected ? 'text-white' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`;

                        return (
                            <button 
                                key={index} 
                                onClick={() => setSelectedDate(date)}
                                className={dayClasses}
                                aria-label={`View events for ${date.toDateString()}`}
                                aria-pressed={isSelected}
                            >
                                <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{daysOfWeek[date.getDay()]}</span>
                                <span className={dateTextClasses}>{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-4">
                     <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    <div className="max-h-40 overflow-y-auto pr-2">
                        <ul className="space-y-3">
                            {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
                                <li key={event.id} className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                     <div className="text-center w-20 flex-shrink-0">
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatTime(event.start)}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">to {formatTime(event.end)}</p>
                                    </div>
                                    <div className="w-1 self-stretch bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                                    <div className="flex-1">
                                       <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.title}</p>
                                       {event.invitees && event.invitees.length > 0 && (
                                           <div className="relative group flex items-center mt-1">
                                                <UsersIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                                    {event.invitees.length} attendee{event.invitees.length > 1 ? 's' : ''}
                                                </span>
                                                <div className="absolute bottom-full left-0 mb-2 w-max max-w-xs
                                                    bg-slate-800 text-white text-xs rounded-md py-1.5 px-3 z-10 
                                                    opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none
                                                    shadow-lg border border-slate-700">
                                                    <ul className="space-y-0.5">
                                                        {event.invitees.map(email => <li key={email}>{email}</li>)}
                                                    </ul>
                                                     <div className="absolute top-full left-4 w-0 h-0
                                                        border-x-4 border-x-transparent
                                                        border-t-4 border-t-slate-800"></div>
                                                </div>
                                           </div>
                                       )}
                                    </div>
                                </li>
                            )) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No events scheduled for this day.</p>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <ScheduleEventModal 
                isOpen={isAddingEvent}
                onClose={() => setIsAddingEvent(false)}
                onSave={handleSaveEvent}
                initialDate={selectedDate}
            />
        </>
    );
};