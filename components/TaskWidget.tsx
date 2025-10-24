import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { TaskPriority, TaskStatus } from '../types';
import { NewTaskModal } from './NewTaskModal';
import { PlusIcon } from '../constants';

interface TaskWidgetProps {
    title: string;
    allTasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onAddTask: () => void;
    highlightedItemId: string | null;
}

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.High]: 'border-l-red-500',
    [TaskPriority.Medium]: 'border-l-amber-500',
    [TaskPriority.Low]: 'border-l-blue-500',
};

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

interface ConfirmationState {
    taskId: string;
    field: 'title' | 'dueDate' | 'priority';
    newValue: string;
    originalValue: string;
}

export const TaskWidget: React.FC<TaskWidgetProps> = ({ title, allTasks, setTasks, onAddTask, highlightedItemId }) => {
    const allTasksById = useMemo(() => new Map(allTasks.map(t => [t.id, t])), [allTasks]);
    const [editingState, setEditingState] = useState<{ taskId: string; field: 'title' | 'dueDate' | 'priority' } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [confirmationState, setConfirmationState] = useState<ConfirmationState | { error: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('All Active');

    const itemRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

    useEffect(() => {
        if (highlightedItemId) {
            const element = itemRefs.current.get(highlightedItemId);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedItemId]);
    
    const statusOptions = ['All Active', ...Object.values(TaskStatus)];

    const projectNames = useMemo(() => {
        const uniqueProjects = new Set(allTasks.map(t => t.project));
        return ['All Projects', ...Array.from(uniqueProjects)];
    }, [allTasks]);

    const filteredTasks = useMemo(() => {
        let tempTasks = allTasks;

        // Filter by status
        if (selectedStatus === 'All Active') {
            tempTasks = tempTasks.filter(task => task.status === TaskStatus.Upcoming || task.status === TaskStatus.Pending);
        } else if (Object.values(TaskStatus).includes(selectedStatus as TaskStatus)) {
            tempTasks = tempTasks.filter(task => task.status === selectedStatus);
        }
        
        return tempTasks;
    }, [allTasks, selectedStatus]);

    const isTaskBlocked = (task: Task): { blocked: boolean; reasons: string[] } => {
        if (!task.dependsOn || task.dependsOn.length === 0) {
            return { blocked: false, reasons: [] };
        }

        const blockingTasks: string[] = [];
        
        for (const depId of task.dependsOn) {
            const dependencyTask = allTasksById.get(depId);
            if (dependencyTask && dependencyTask.status !== TaskStatus.Completed) {
                blockingTasks.push(dependencyTask.title);
            }
        }

        return {
            blocked: blockingTasks.length > 0,
            reasons: blockingTasks
        };
    };

    const handleEditStart = (task: Task, field: 'title' | 'dueDate' | 'priority') => {
        const { blocked } = isTaskBlocked(task);
        if (blocked || confirmationState) return; // Don't start a new edit if confirmation is pending or task is blocked
        setEditingState({ taskId: task.id, field });
        setEditValue(task[field]);
    };

    const handlePrepareConfirmation = () => {
        if (!editingState) return;

        const originalTask = allTasks.find(t => t.id === editingState.taskId);
        if (!originalTask) {
            setEditingState(null);
            return;
        }

        const originalValue = originalTask[editingState.field];

        // Due Date Validation
        if (editingState.field === 'dueDate') {
            const allowedStrings = ['Complete', 'TBD'];
            if (!allowedStrings.includes(editValue)) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(editValue)) {
                    setConfirmationState({ error: 'Invalid format. Use YYYY-MM-DD, "TBD", or "Complete".' });
                    setEditingState(null);
                    return;
                }

                const parts = editValue.split('-').map(p => parseInt(p, 10));
                const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (isNaN(selectedDate.getTime()) || selectedDate.getFullYear() !== parts[0] || selectedDate.getMonth() !== parts[1] - 1 || selectedDate.getDate() !== parts[2]) {
                     setConfirmationState({ error: 'Invalid date entered (e.g., month or day out of range).' });
                     setEditingState(null);
                     return;
                }

                if (selectedDate < today) {
                    setConfirmationState({ error: 'Due date cannot be in the past.' });
                    setEditingState(null);
                    return;
                }
            }
        }

        // Prevent saving an empty title or if value hasn't changed
        if ((editingState.field === 'title' && !editValue.trim()) || editValue === originalValue) {
            setEditingState(null);
            return;
        }

        setConfirmationState({
            taskId: editingState.taskId,
            field: editingState.field,
            newValue: editValue,
            originalValue: originalValue,
        });
        setEditingState(null);
    };
    
    const handleConfirmChange = () => {
        if (!confirmationState || 'error' in confirmationState) return;

        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === confirmationState.taskId
                    ? { ...t, [confirmationState.field]: confirmationState.newValue }
                    : t
            )
        );
        setConfirmationState(null);
    };

    const handleCancelChange = () => {
        setConfirmationState(null);
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePrepareConfirmation();
        } else if (e.key === 'Escape') {
            setEditingState(null);
        }
    };
    
    const commonInputClass = "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-none focus:ring-1 focus:ring-indigo-500 rounded";
    const selectClass = "w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";


    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                     <button 
                        onClick={onAddTask}
                        className="flex items-center space-x-1 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="Add new task"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>New Task</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                        <label htmlFor="status-filter" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Status
                        </label>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={selectClass}
                            aria-label="Filter tasks by status"
                        >
                            {statusOptions.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <ul className="space-y-2">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => {
                            const { blocked, reasons } = isTaskBlocked(task);
                            const isHighlighted = task.id === highlightedItemId;

                            return (
                                <li 
                                    key={task.id} 
                                    // FIX: The ref callback should not return a value and should handle cleanup.
                                    ref={(el) => {
                                        if (el) {
                                            itemRefs.current.set(task.id, el);
                                        } else {
                                            itemRefs.current.delete(task.id);
                                        }
                                    }}
                                    className={`p-3 rounded-md border-l-4 ${priorityColors[task.priority]} relative group transition-opacity ${blocked ? 'opacity-60 cursor-not-allowed' : 'bg-slate-50/50 dark:bg-slate-800/20'} ${isHighlighted ? 'animate-pulse-highlight' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-3 flex-grow min-w-0">
                                            {blocked && <LockIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />}
                                            <div className="flex-grow min-w-0">
                                                {editingState?.taskId === task.id && editingState.field === 'title' ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handlePrepareConfirmation}
                                                        onKeyDown={handleInputKeyDown}
                                                        className={`w-full p-0 text-sm font-medium ${commonInputClass}`}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <p
                                                        onClick={() => handleEditStart(task, 'title')}
                                                        className={`text-sm font-medium text-slate-800 dark:text-slate-200 truncate ${!blocked ? 'cursor-pointer' : ''}`}
                                                    >
                                                        {task.title}
                                                    </p>
                                                )}
                                                
                                                {editingState?.taskId === task.id && editingState.field === 'priority' ? (
                                                    <select
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handlePrepareConfirmation}
                                                        onKeyDown={handleInputKeyDown}
                                                        className={`text-xs mt-1 w-full ${commonInputClass}`}
                                                        autoFocus
                                                    >
                                                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                ) : (
                                                     <div className="flex items-center space-x-2 mt-1">
                                                        <p
                                                            onClick={() => handleEditStart(task, 'priority')}
                                                            className={`text-xs text-slate-500 dark:text-slate-400 ${!blocked ? 'cursor-pointer' : ''} truncate`}
                                                            title={`${task.project} | ${task.assignedTo || 'Unassigned'} | ${task.priority}`}
                                                        >
                                                            <span>{task.project}</span>
                                                            <span className="mx-1 text-slate-400 dark:text-slate-500">&bull;</span>
                                                            <span className={task.assignedTo ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>{task.assignedTo || 'Unassigned'}</span>
                                                            <span className="mx-1 text-slate-400 dark:text-slate-500">&bull;</span>
                                                            <span className="font-semibold">{task.priority}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {editingState?.taskId === task.id && editingState.field === 'dueDate' ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={handlePrepareConfirmation}
                                                onKeyDown={handleInputKeyDown}
                                                className={`w-24 text-right text-xs p-0 ${commonInputClass}`}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                onClick={() => handleEditStart(task, 'dueDate')}
                                                className={`text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2 ${!blocked ? 'cursor-pointer' : ''}`}
                                            >
                                                {task.dueDate}
                                            </span>
                                        )}
                                    </div>

                                    {blocked && reasons.length > 0 && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
                                                        bg-slate-800 text-white text-xs rounded-md py-1.5 px-3 z-10 
                                                        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none
                                                        shadow-lg border border-slate-700">
                                            <span className="font-semibold">Blocked by:</span>
                                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                                {reasons.map((reason, index) => <li key={index}>{reason}</li>)}
                                            </ul>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                                                            border-x-4 border-x-transparent
                                                            border-t-4 border-t-slate-800"></div>
                                        </div>
                                    )}
                                </li>
                            )
                        }) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No tasks match the current filters.</p>}
                    </ul>
                </div>

                {/* Confirmation Modal */}
                {confirmationState && (
                    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border dark:border-slate-700">
                            {'error' in confirmationState ? (
                                <>
                                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Validation Error</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{confirmationState.error}</p>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => setConfirmationState(null)}
                                            className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Confirm Change</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                        Are you sure you want to change the <span className="font-bold text-indigo-600 dark:text-indigo-400">{confirmationState.field}</span>?
                                    </p>
                                    <div className="text-sm space-y-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                                        <p><span className="text-slate-500 dark:text-slate-400">From:</span> <span className="text-red-600 dark:text-red-400 line-through">{confirmationState.originalValue}</span></p>
                                        <p><span className="text-slate-500 dark:text-slate-400">To:</span> <span className="text-green-600 dark:text-green-400 font-semibold">{confirmationState.newValue}</span></p>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            onClick={handleCancelChange}
                                            className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmChange}
                                            className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};