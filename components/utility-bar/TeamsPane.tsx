import React, { useMemo, useState } from 'react';
import { Project, Task, Defect, TeamMember, TaskPriority, DefectSeverity } from '../../types';
import { UserIcon } from '../../constants';
import { ListBulletIcon, BugIcon } from './icons';


interface TeamsPaneProps {
    projects: Project[];
    tasks: Task[];
    defects: Defect[];
    teamMembers: TeamMember[];
    onItemClick: (itemType: 'Task' | 'Defect', itemId: string) => void;
}

interface AggregatedMemberData {
    id: string;
    tasks: Task[];
    defects: Defect[];
    projects: Set<string>;
}

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.High]: 'border-l-red-500',
    [TaskPriority.Medium]: 'border-l-amber-500',
    [TaskPriority.Low]: 'border-l-blue-500',
};

const severityConfig: Record<DefectSeverity, { icon: React.ReactNode, textColor: string }> = {
    [DefectSeverity.Critical]: { icon: <div className="w-2 h-2 rounded-full bg-red-500" />, textColor: 'text-red-600 dark:text-red-400' },
    [DefectSeverity.High]: { icon: <div className="w-2 h-2 rounded-full bg-orange-500" />, textColor: 'text-orange-600 dark:text-orange-400' },
    [DefectSeverity.Medium]: { icon: <div className="w-2 h-2 rounded-full bg-amber-500" />, textColor: 'text-amber-600 dark:text-amber-400' },
    [DefectSeverity.Low]: { icon: <div className="w-2 h-2 rounded-full bg-blue-500" />, textColor: 'text-blue-600 dark:text-blue-400' },
};

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);


export const TeamsPane: React.FC<TeamsPaneProps> = ({ projects, tasks, defects, teamMembers, onItemClick }) => {
    const [projectFilter, setProjectFilter] = useState('All');
    const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
    
    const teamMemberProfiles = useMemo(() => new Map(teamMembers.map(m => [m.id, m])), [teamMembers]);

    const aggregatedData = useMemo(() => {
        const memberMap = new Map<string, AggregatedMemberData>();

        const getOrCreateMember = (name: string) => {
            if (!memberMap.has(name)) {
                memberMap.set(name, { id: name, tasks: [], defects: [], projects: new Set() });
            }
            return memberMap.get(name)!;
        };

        tasks.forEach(task => {
            if (task.assignedTo) {
                const member = getOrCreateMember(task.assignedTo);
                member.tasks.push(task);
                member.projects.add(task.project);
            }
        });

        defects.forEach(defect => {
            if (defect.assignedTo) {
                const member = getOrCreateMember(defect.assignedTo);
                member.defects.push(defect);
                member.projects.add(defect.project);
            }
        });

        return Array.from(memberMap.values());
    }, [tasks, defects]);

    const filteredTeam = useMemo(() => {
        if (projectFilter === 'All') {
            return aggregatedData;
        }
        return aggregatedData.filter(member => member.projects.has(projectFilter));
    }, [aggregatedData, projectFilter]);

    const projectOptions = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.name)))], [projects]);
    const selectClass = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <label htmlFor="project-filter-team" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Filter by Project</label>
                <select id="project-filter-team" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className={selectClass}>
                    {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredTeam.length > 0 ? filteredTeam.map(member => {
                    const profile = teamMemberProfiles.get(member.id);
                    if (!profile) return null;
                    const isExpanded = expandedMemberId === member.id;

                    return (
                        <div key={member.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-200">
                            <button className="w-full text-left" onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.fullName}</p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{profile.jobTitle}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                                            <ListBulletIcon className="w-4 h-4" /> <span>{member.tasks.length}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                                            <BugIcon className="w-4 h-4" /> <span>{member.defects.length}</span>
                                        </div>
                                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    {member.tasks.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Assigned Tasks</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                {member.tasks.map(task => (
                                                    <button key={task.id} onClick={() => onItemClick('Task', task.id)} className={`w-full text-left p-2 rounded-md border-l-4 ${priorityColors[task.priority]} bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700`}>
                                                        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{task.project}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                     {member.defects.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Assigned Defects</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                {member.defects.map(defect => (
                                                    <button key={defect.id} onClick={() => onItemClick('Defect', defect.id)} className="w-full text-left p-2 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                         <div className="flex items-start space-x-2">
                                                            <div className="flex-shrink-0 pt-1.5">{severityConfig[defect.severity].icon}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm ${severityConfig[defect.severity].textColor} truncate`}>{defect.title}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{defect.project}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p className="text-sm">No team members match the current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};