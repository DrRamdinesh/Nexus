import React from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';

interface ProjectStatusWidgetProps {
    projects: Project[];
    onViewProject: (project: Project) => void;
}

const statusConfig: Record<ProjectStatus, { title: string, color: string, textColor: string, hoverColor: string, ringColor: string }> = {
    [ProjectStatus.Red]: {
        title: 'At Risk',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        hoverColor: 'hover:bg-red-600',
        ringColor: 'ring-red-500'
    },
    [ProjectStatus.Amber]: {
        title: 'Needs Attention',
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        hoverColor: 'hover:bg-amber-600',
        ringColor: 'ring-amber-500'
    },
    [ProjectStatus.Green]: {
        title: 'On Track',
        color: 'bg-green-500',
        textColor: 'text-green-600 dark:text-green-400',
        hoverColor: 'hover:bg-green-600',
        ringColor: 'ring-green-500'
    }
};

const RAGSection: React.FC<{
    status: ProjectStatus;
    projects: Project[];
    onViewProject: (project: Project) => void;
}> = ({ status, projects, onViewProject }) => {
    const config = statusConfig[status];

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 min-w-0">
            <h3 className={`text-lg font-semibold ${config.textColor}`}>{config.title} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({projects.length})</span></h3>
            <div className="mt-4 flex flex-wrap gap-2">
                {projects.map(project => (
                    <div key={project.id} className="group relative">
                        <button
                            onClick={() => onViewProject(project)}
                            className={`w-7 h-7 rounded-md ${config.color} ${config.hoverColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:${config.ringColor}`}
                            aria-label={`View project ${project.name}`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded-md py-1 px-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                            {project.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">No projects in this category.</p>
                )}
            </div>
        </div>
    );
};

export const ProjectStatusWidget: React.FC<ProjectStatusWidgetProps> = ({ projects, onViewProject }) => {
    const projectsByStatus = {
        [ProjectStatus.Red]: projects.filter(p => p.status === ProjectStatus.Red),
        [ProjectStatus.Amber]: projects.filter(p => p.status === ProjectStatus.Amber),
        [ProjectStatus.Green]: projects.filter(p => p.status === ProjectStatus.Green),
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Projects RAG Status</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <RAGSection status={ProjectStatus.Red} projects={projectsByStatus[ProjectStatus.Red]} onViewProject={onViewProject} />
                <RAGSection status={ProjectStatus.Amber} projects={projectsByStatus[ProjectStatus.Amber]} onViewProject={onViewProject} />
                <RAGSection status={ProjectStatus.Green} projects={projectsByStatus[ProjectStatus.Green]} onViewProject={onViewProject} />
            </div>
        </div>
    );
};