import React, { useMemo } from 'react';
import type { Project, Vendor } from '../types';
import { ProjectStatus } from '../types';
import { ArrowPathIcon } from './utility-bar/icons';

interface ProjectHeaderProps {
    projects: Project[];
    vendors: Vendor[];
    selectedProjectId: string;
    onSelectProject: (projectId: string) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

const statusColors: Record<ProjectStatus, { bg: string, text: string, progress: string }> = {
    [ProjectStatus.Green]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', progress: 'bg-green-500' },
    [ProjectStatus.Amber]: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300', progress: 'bg-amber-500' },
    [ProjectStatus.Red]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', progress: 'bg-red-500' },
};

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projects, vendors, selectedProjectId, onSelectProject, onRefresh, isRefreshing }) => {
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    const vendorsById = useMemo(() => new Map(vendors.map(v => [v.id, v.name])), [vendors]);

    if (!selectedProject) {
        return (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-center text-slate-500 dark:text-slate-400">No project selected.</p>
            </div>
        );
    }

    const color = statusColors[selectedProject.status];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <div className="relative inline-block">
                        <select
                            value={selectedProjectId}
                            onChange={(e) => onSelectProject(e.target.value)}
                            className="text-2xl font-bold text-slate-800 dark:text-slate-100 bg-transparent -ml-2 pl-2 pr-8 appearance-none focus:outline-none cursor-pointer"
                            aria-label="Select a project"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                         <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {vendorsById.get(selectedProject.vendorId)}
                    </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <button 
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Refresh project data"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex-1 text-right">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                            {selectedProject.status}
                        </span>
                    </div>
                    <div className="w-48">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Progress</span>
                             <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedProject.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className={`${color.progress} h-2 rounded-full`} style={{ width: `${selectedProject.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};