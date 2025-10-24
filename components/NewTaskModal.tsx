import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { TaskPriority, TaskStatus } from '../types';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id'>) => void;
    projectNames: string[];
    allTasks: Task[];
    initialData?: Partial<Task> | null;
}

const assignees = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank'];

const initialState = {
    title: '',
    project: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    assignedTo: '',
    dependsOn: [] as string[],
};

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, projectNames, allTasks, initialData }) => {
    const [taskData, setTaskData] = useState(initialState);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const defaultProject = projectNames.length > 0 ? projectNames[0] : '';
            setTaskData({
                title: initialData?.title || '',
                project: initialData?.project || defaultProject,
                priority: initialData?.priority || TaskPriority.Medium,
                dueDate: initialData?.dueDate && initialData.dueDate !== 'TBD' ? initialData.dueDate : '',
                assignedTo: initialData?.assignedTo || '',
                dependsOn: initialData?.dependsOn || [],
            });
            setError(null);
        }
    }, [isOpen, projectNames, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleDependencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type the 'option' parameter to HTMLOptionElement to resolve the 'unknown' type error.
        const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setTaskData(prev => ({ ...prev, dependsOn: selectedOptions }));
    };

    const handleSave = () => {
        setError(null);
        if (!taskData.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!taskData.project) {
            setError('Please select a project.');
            return;
        }

        if (taskData.dueDate) {
            const parts = taskData.dueDate.split('-').map(p => parseInt(p, 10));
            const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setError('Due date cannot be in the past.');
                return;
            }
        }

        const newTaskData: Omit<Task, 'id'> = {
            title: taskData.title.trim(),
            project: taskData.project,
            priority: taskData.priority,
            dueDate: taskData.dueDate.trim() || 'TBD',
            status: TaskStatus.Upcoming,
            // FIX: Added creationDate on new task creation.
            creationDate: new Date().toISOString().split('T')[0],
            assignedTo: taskData.assignedTo || undefined,
            dependsOn: taskData.dependsOn.length > 0 ? taskData.dependsOn : undefined,
        };
        onSave(newTaskData);
    };

    if (!isOpen) return null;

    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Create New Task</h3>
                
                {error && <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center mb-4">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="task-title" className={labelClass}>Task Title</label>
                        <input id="task-title" name="title" type="text" value={taskData.title} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="task-project" className={labelClass}>Project</label>
                            <select id="task-project" name="project" value={taskData.project} onChange={handleChange} className={commonInputClass}>
                                {projectNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="task-priority" className={labelClass}>Priority</label>
                            <select id="task-priority" name="priority" value={taskData.priority} onChange={handleChange} className={commonInputClass}>
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="task-duedate" className={labelClass}>Due Date</label>
                            <input id="task-duedate" name="dueDate" type="date" value={taskData.dueDate} onChange={handleChange} className={commonInputClass} />
                        </div>
                        <div>
                            <label htmlFor="task-assignedTo" className={labelClass}>Assign To</label>
                            <select id="task-assignedTo" name="assignedTo" value={taskData.assignedTo} onChange={handleChange} className={commonInputClass}>
                                <option value="">Unassigned</option>
                                {assignees.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="task-dependencies" className={labelClass}>Dependencies (Hold Ctrl/Cmd to select multiple)</label>
                        <select
                            id="task-dependencies"
                            name="dependsOn"
                            multiple
                            value={taskData.dependsOn}
                            onChange={handleDependencyChange}
                            className={`${commonInputClass} h-24`}
                        >
                            {allTasks.map(task => (
                                <option key={task.id} value={task.id}>{task.title} ({task.project})</option>
                            ))}
                        </select>
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
                        Save Task
                    </button>
                </div>
            </div>
        </div>
    );
};