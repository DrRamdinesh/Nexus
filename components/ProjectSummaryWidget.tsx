import React, { useState } from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import { ProjectsIcon, CheckCircleIcon, ExclamationCircleIcon } from './utility-bar/icons';

interface ProjectSummaryWidgetProps {
    projects: Project[];
    onViewProject: (project: Project) => void;
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
    colorClass: string;
    projects: Project[];
    onProjectClick: (project: Project) => void;
}> = ({ icon, value, label, colorClass, projects, onProjectClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center space-x-4 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600">
                <div className={`p-3 rounded-full ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                </div>
            </div>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 p-2 transition-all duration-200 ease-in-out ${isHovered && projects.length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-white dark:border-b-slate-800"></div>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2 px-2">{label}</h4>
                {projects.length > 0 ? (
                    <ul className="max-h-40 overflow-y-auto space-y-1">
                        {projects.map(project => (
                            <li key={project.id}>
                                <button
                                    onClick={() => onProjectClick(project)}
                                    className="w-full text-left text-sm p-1.5 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {project.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4">No projects in this category.</p>
                )}
            </div>
        </div>
    );
};


export const ProjectSummaryWidget: React.FC<ProjectSummaryWidgetProps> = ({ projects, onViewProject }) => {
    const totalProjects = projects;
    const onTrackProjects = projects.filter(p => p.status === ProjectStatus.Green);
    const atRiskProjects = projects.filter(p => p.status === ProjectStatus.Amber || p.status === ProjectStatus.Red);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
                icon={<ProjectsIcon className="w-6 h-6 text-indigo-800 dark:text-indigo-200" />}
                value={totalProjects.length}
                label="Total Projects"
                colorClass="bg-indigo-100 dark:bg-indigo-500/30"
                projects={totalProjects}
                onProjectClick={onViewProject}
            />
            <StatCard 
                icon={<CheckCircleIcon className="w-6 h-6 text-green-800 dark:text-green-200" />}
                value={onTrackProjects.length}
                label="On Track Projects"
                colorClass="bg-green-100 dark:bg-green-500/30"
                projects={onTrackProjects}
                onProjectClick={onViewProject}
            />
            <StatCard 
                icon={<ExclamationCircleIcon className="w-6 h-6 text-red-800 dark:text-red-200" />}
                value={atRiskProjects.length}
                label="Projects at Risk"
                colorClass="bg-red-100 dark:bg-red-500/30"
                projects={atRiskProjects}
                onProjectClick={onViewProject}
            />
        </div>
    );
};