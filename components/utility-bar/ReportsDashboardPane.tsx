import React, { useMemo, useState } from 'react';
import type { Project, Task, Defect } from '../../types';
import { TaskStatus, DefectSeverity } from '../../types';

interface ReportsDashboardPaneProps {
    projects: Project[];
    tasks: Task[];
    defects: Defect[];
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">{title}</h3>
        <div className="h-64 flex items-center justify-center">
            {children}
        </div>
    </div>
);

const ProjectHealthChart: React.FC<{ tasks: Task[]; defects: Defect[] }> = ({ tasks, defects }) => {
    const healthScore = useMemo(() => {
        if (tasks.length === 0) return 0;

        const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
        const completionPercentage = (completedTasks / tasks.length) * 100;

        // Penalize for critical defects. Each critical defect reduces the score by 15 points.
        const criticalDefects = defects.filter(d => d.severity === DefectSeverity.Critical).length;
        const penalty = criticalDefects * 15;

        return Math.max(0, Math.round(completionPercentage - penalty));
    }, [tasks, defects]);
    
    const getScoreColor = (score: number) => {
        if (score > 80) return 'stroke-green-500';
        if (score > 50) return 'stroke-amber-500';
        return 'stroke-red-500';
    };

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (healthScore / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="12" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={`animate-dash transition-all duration-500 ${getScoreColor(healthScore)}`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{healthScore}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Health Score</span>
            </div>
        </div>
    );
};


const SprintProgressChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const chartData = useMemo(() => {
        const data: { day: string; scope: number; completed: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Look at the last 14 days
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // FIX: The Task type now has a creationDate. The filter is now valid.
            const tasksInScope = tasks.filter(t => new Date(t.creationDate) <= date);
            const tasksCompleted = tasksInScope.filter(t => t.status === TaskStatus.Completed && new Date(t.dueDate) <= date);
            
            data.push({
                day: dayStr,
                scope: tasksInScope.length,
                completed: tasksCompleted.length,
            });
        }
        return data;
    }, [tasks]);
    
     if (tasks.length === 0) return <p className="text-sm text-slate-400 dark:text-slate-500">No task data available.</p>;

    const maxVal = Math.max(...chartData.map(d => d.scope), 1);

    return (
        <div className="w-full h-full flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 300 180">
                {/* Y-Axis labels and grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => (
                    <g key={p}>
                        <text x="0" y={150 - (p * 140)} dy="3" fontSize="10" className="fill-slate-400">{Math.round(maxVal * p)}</text>
                        <line x1="25" y1={150 - (p * 140)} x2="300" y2={150 - (p * 140)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="0.5" />
                    </g>
                ))}

                {/* Scope line */}
                <polyline
                    fill="none"
                    className="stroke-slate-300 dark:stroke-slate-600 animate-dash"
                    strokeWidth="2"
                    points={chartData.map((d, i) => `${30 + i * (265 / 13)} ${150 - (d.scope / maxVal) * 140}`).join(' ')}
                />
                
                {/* Completed line */}
                <polyline
                    fill="none"
                    className="stroke-indigo-500 animate-dash"
                    strokeWidth="2.5"
                    points={chartData.map((d, i) => `${30 + i * (265 / 13)} ${150 - (d.completed / maxVal) * 140}`).join(' ')}
                />
                
                 {/* Data points for completed line */}
                {chartData.map((d, i) => (
                    <circle key={i} cx={30 + i * (265 / 13)} cy={150 - (d.completed / maxVal) * 140} r="2.5" className="fill-indigo-500" />
                ))}

                {/* X-Axis labels */}
                {chartData.map((d, i) => {
                     if (i % 3 === 0) { // Show label every 3 days
                         return <text key={i} x={30 + i * (265 / 13)} y="165" textAnchor="middle" fontSize="9" className="fill-slate-400">{d.day}</text>;
                     }
                     return null;
                })}
            </svg>
        </div>
    );
};

const BugTrendsChart: React.FC<{ defects: Defect[] }> = ({ defects }) => {
    const severityOrder: DefectSeverity[] = [DefectSeverity.Critical, DefectSeverity.High, DefectSeverity.Medium, DefectSeverity.Low];
    
    const stats = useMemo(() => {
        const counts = new Map<DefectSeverity, number>();
        severityOrder.forEach(s => counts.set(s, 0));
        defects.forEach(defect => {
            counts.set(defect.severity, (counts.get(defect.severity) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([severity, count]) => ({ severity, count }));
    }, [defects]);
    
    if (defects.length === 0) return <p className="text-sm text-slate-400 dark:text-slate-500">No defect data available.</p>;
    
    const maxCount = Math.max(...stats.map(s => s.count), 1);
    const colors: Record<DefectSeverity, string> = {
        [DefectSeverity.Critical]: 'fill-red-500',
        [DefectSeverity.High]: 'fill-orange-500',
        [DefectSeverity.Medium]: 'fill-amber-500',
        [DefectSeverity.Low]: 'fill-blue-500',
    };

    return (
        <div className="w-full h-full flex flex-col justify-end px-4 pt-4 pb-8">
            <div className="flex justify-around items-end h-full border-b border-slate-300 dark:border-slate-600 relative">
                {stats.map(({ severity, count }, index) => (
                    <div key={severity} className="flex-1 flex flex-col items-center group">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{count}</span>
                         <div className="w-8/12 h-full flex items-end">
                            <div
                                className={`w-full ${colors[severity]} animate-fade-in-up`}
                                style={{
                                    height: `${(count / maxCount) * 100}%`,
                                    animationDelay: `${index * 100}ms`,
                                    borderTopLeftRadius: '4px',
                                    borderTopRightRadius: '4px'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
                 {/* X-axis labels */}
                <div className="absolute -bottom-6 w-full flex justify-around">
                     {stats.map(({ severity }) => (
                        <div key={severity} className="flex-1 text-center text-xs text-slate-500 dark:text-slate-400">{severity}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const ReportsDashboardPane: React.FC<ReportsDashboardPaneProps> = ({ projects, tasks, defects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('All');

    const filteredData = useMemo(() => {
        if (selectedProjectId === 'All') {
            return { tasks, defects, name: 'All Projects' };
        }
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return { tasks: [], defects: [], name: '' };
        return {
            tasks: tasks.filter(t => t.project === project.name),
            defects: defects.filter(d => d.project === project.name),
            name: project.name,
        };
    }, [selectedProjectId, projects, tasks, defects]);
    
    const selectClass = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <label htmlFor="project-filter-reports" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Select Project</label>
                <select id="project-filter-reports" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className={selectClass}>
                    <option value="All">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50 dark:bg-slate-900/50">
                <ChartCard title="Project Health">
                    <ProjectHealthChart tasks={filteredData.tasks} defects={filteredData.defects} />
                </ChartCard>
                <ChartCard title="Sprint Progress (Last 14 Days)">
                    <SprintProgressChart tasks={filteredData.tasks} />
                </ChartCard>
                <ChartCard title="Bug Trends by Severity">
                    <BugTrendsChart defects={filteredData.defects} />
                </ChartCard>
            </div>
        </div>
    );
};