import React, { useMemo, useState } from 'react';
import { Project, ProjectStatus, Vendor, Tool } from '../../types';

interface ProjectsPaneProps {
    projects: Project[];
    vendors: Vendor[];
    onViewProject: (project: Project) => void;
}

const statusColors: Record<ProjectStatus, { bg: string, text: string, progress: string }> = {
    [ProjectStatus.Green]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', progress: 'bg-green-500' },
    [ProjectStatus.Amber]: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300', progress: 'bg-amber-500' },
    [ProjectStatus.Red]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', progress: 'bg-red-500' },
};

export const ProjectsPane: React.FC<ProjectsPaneProps> = ({ projects, vendors, onViewProject }) => {
    const vendorsById = useMemo(() => new Map(vendors.map(v => [v.id, v])), [vendors]);

    const [vendorFilter, setVendorFilter] = useState('All');
    const [toolFilter, setToolFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const vendorOptions = useMemo(() => ['All', ...Array.from(new Set(vendors.map(v => v.name)))], [vendors]);
    const toolOptions = useMemo(() => ['All', ...Object.values(Tool)], []);
    const statusOptions = useMemo(() => ['All', ...Object.values(ProjectStatus)], []);

    const filteredProjects = useMemo(() => {
        const vendorsByName = new Map(vendors.map(v => [v.name, v.id]));
        return projects.filter(project => {
            const vendorMatch = vendorFilter === 'All' || project.vendorId === vendorsByName.get(vendorFilter);
            const toolMatch = toolFilter === 'All' || project.tool === toolFilter;
            const statusMatch = statusFilter === 'All' || project.status === statusFilter;
            return vendorMatch && toolMatch && statusMatch;
        });
    }, [projects, vendors, vendorFilter, toolFilter, statusFilter]);
    
    const selectClass = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500";

    return (
        <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="space-y-3">
                    <div>
                        <label htmlFor="vendor-filter" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Vendor</label>
                        <select id="vendor-filter" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} className={selectClass}>
                            {vendorOptions.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="tool-filter" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tool</label>
                        <select id="tool-filter" value={toolFilter} onChange={e => setToolFilter(e.target.value)} className={selectClass}>
                           {toolOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="status-filter" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
                           {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-2">
                {filteredProjects.map(project => (
                    <div 
                        key={project.id} 
                        onClick={() => onViewProject(project)}
                        className="cursor-pointer p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewProject(project)}}
                        aria-label={`Select project ${project.name} for the main dashboard`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center space-x-2 min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[project.status].progress}`}></div>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{project.name}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{vendorsById.get(project.vendorId)?.name || 'Unknown Vendor'}</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className={`${statusColors[project.status].progress} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};