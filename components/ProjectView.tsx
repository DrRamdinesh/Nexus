import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Project, Vendor, Task, Defect, ToolConfiguration, Tool } from '../types';
import { ProjectStatus, TaskStatus, TaskPriority, DefectSeverity, ConnectionStatus } from '../types';
import { ArrowLeftIcon, BugIcon, CheckCircleIcon, ExclamationCircleIcon, ListBulletIcon, ArrowPathIcon } from './utility-bar/icons';
import { getProjectDetails } from '../../services/toolService';

interface ProjectViewProps {
    project: Project;
    vendors: Vendor[];
    tasks: Task[];
    defects: Defect[];
    onBack: () => void;
    toolConfigs: ToolConfiguration[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    setDefects: React.Dispatch<React.SetStateAction<Defect[]>>;
}

const statusColors: Record<ProjectStatus, { bg: string, text: string, progress: string }> = {
    [ProjectStatus.Green]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', progress: 'bg-green-500' },
    [ProjectStatus.Amber]: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300', progress: 'bg-amber-500' },
    [ProjectStatus.Red]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', progress: 'bg-red-500' },
};

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.High]: 'border-l-red-500',
    [TaskPriority.Medium]: 'border-l-amber-500',
    [TaskPriority.Low]: 'border-l-blue-500',
};

const severityConfig: Record<DefectSeverity, { icon: React.ReactNode, textColor: string }> = {
    [DefectSeverity.Critical]: {
        icon: <div className="w-2.5 h-2.5 rounded-full bg-red-500" />,
        textColor: 'text-red-600 dark:text-red-400',
    },
     [DefectSeverity.High]: {
        icon: <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />,
        textColor: 'text-orange-600 dark:text-orange-400',
    },
    [DefectSeverity.Medium]: {
        icon: <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />,
        textColor: 'text-amber-600 dark:text-amber-400',
    },
    [DefectSeverity.Low]: {
        icon: <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />,
        textColor: 'text-blue-600 dark:text-blue-400',
    },
};

const KPIStat: React.FC<{ icon: React.ReactNode; value: number | string; label: string; }> = ({ icon, value, label }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

export const ProjectView: React.FC<ProjectViewProps> = ({ project, vendors, tasks, defects, onBack, toolConfigs, setProjects, setTasks, setDefects }) => {
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null);

    const toolConfig = useMemo(() => toolConfigs.find(tc => tc.tool === project.tool), [toolConfigs, project.tool]);
    const canRefresh = useMemo(() => toolConfig && toolConfig.status === ConnectionStatus.Connected, [toolConfig]);
    
    const handleRefresh = useCallback(async () => {
        if (!canRefresh || !toolConfig) {
            return;
        }

        setIsRefreshing(true);
        setRefreshError(null);

        try {
            const { updatedProject, tasks: newTasks, defects: newDefects } = await getProjectDetails(project, toolConfig);
            
            setProjects(prev => prev.map(p => (p.id === updatedProject.id ? updatedProject : p)));

            const toolPrefixes: Partial<Record<Tool, string>> = {
                'Jira': 'JIRA-',
                'Trello': 'TR-',
                'OpenProject': 'OP-',
                'Rally': 'RA-',
            };
            const prefix = toolPrefixes[project.tool];

            if (prefix) {
                setTasks(prev => [
                    ...prev.filter(t => !(t.project === project.name && t.id.startsWith(prefix))),
                    ...newTasks
                ]);
                setDefects(prev => [
                    ...prev.filter(d => !(d.project === project.name && d.id.startsWith(prefix))),
                    ...newDefects
                ]);
            } else {
                 setTasks(prev => [...prev.filter(t => t.project !== project.name), ...newTasks]);
                setDefects(prev => [...prev.filter(d => d.project !== project.name), ...newDefects]);
            }

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setRefreshError(`Failed to refresh data: ${errorMessage}`);
        } finally {
            setIsRefreshing(false);
        }
    }, [project, canRefresh, toolConfig, setProjects, setTasks, setDefects]);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    const projectTasks = useMemo(() => tasks.filter(t => t.project === project.name), [tasks, project.name]);
    const projectDefects = useMemo(() => defects.filter(d => d.project === project.name), [defects, project.name]);
    const vendor = useMemo(() => vendors.find(v => v.id === project.vendorId), [vendors, project.vendorId]);
    
    const kpis = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            totalTasks: projectTasks.length,
            openDefects: projectDefects.length,
            overdueTasks: projectTasks.filter(
                t => t.status !== TaskStatus.Completed && t.dueDate !== 'Complete' && t.dueDate !== 'TBD' && new Date(t.dueDate) < today
            ).length,
        };
    }, [projectTasks, projectDefects]);

    const color = statusColors[project.status];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={onBack}
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{project.name}</h1>
                    <div className="flex items-center space-x-4">
                        {canRefresh && (
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                aria-label="Refresh project data from external tool"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                            </button>
                        )}
                        <span className={`text-lg font-bold px-4 py-1 rounded-full ${color.bg} ${color.text}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>

             {refreshError && (
                <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center">
                    {refreshError}
                </div>
            )}


            {/* Project Summary Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Vendor</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor?.name || 'N/A'}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tool</p>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{project.tool}</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Progress</span>
                             <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className={`${color.progress} h-2.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPIStat icon={<ListBulletIcon className="w-8 h-8 text-indigo-500" />} value={kpis.totalTasks} label="Total Tasks" />
                <KPIStat icon={<BugIcon className="w-8 h-8 text-amber-500" />} value={kpis.openDefects} label="Open Defects" />
                <KPIStat icon={<ExclamationCircleIcon className="w-8 h-8 text-red-500" />} value={kpis.overdueTasks} label="Overdue Tasks" />
            </div>

            {/* Tasks and Defects Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Tasks Section */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Tasks ({projectTasks.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-3 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg">
                        {projectTasks.length > 0 ? projectTasks.map(task => (
                            <div key={task.id} className={`bg-white dark:bg-slate-800 p-3 rounded-md border-l-4 shadow-sm ${priorityColors[task.priority]}`}>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span>Due: {task.dueDate}</span>
                                    <span className="font-semibold">{task.status}</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tasks for this project.</p>}
                    </div>
                </div>

                {/* Defects Section */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Defects ({projectDefects.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-3 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg">
                        {projectDefects.length > 0 ? projectDefects.map(defect => (
                            <div key={defect.id} className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 pt-1.5">{severityConfig[defect.severity].icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${severityConfig[defect.severity].textColor} truncate`}>{defect.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Created: {defect.creationDate}</p>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No defects for this project.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};