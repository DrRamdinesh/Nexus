import React, { useMemo, useState } from 'react';
import type { Project, Task, Defect, Vendor, ToolConfiguration } from '../../types';
import { ProjectStatus, TaskPriority, DefectSeverity, TaskStatus } from '../../types';
import { generateProjectAnalysis } from '../../services/geminiService';
import { SpinnerIcon } from '../../constants';
import { ArrowLeftIcon, ListBulletIcon, BugIcon, UserCircleIcon, WrenchScrewdriverIcon, CheckCircleIcon, ExclamationCircleIcon, SparklesIcon, ChartBarIcon } from './icons';

interface ProjectDetailPaneProps {
  project: Project;
  vendors: Vendor[];
  tasks: Task[];
  defects: Defect[];
  toolConfigs: ToolConfiguration[];
  onBack: () => void;
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

const severityConfig: Record<DefectSeverity, { icon: React.ReactNode, textColor: string, color: string }> = {
    [DefectSeverity.Critical]: {
        icon: <div className="w-2 h-2 rounded-full bg-red-500" />,
        textColor: 'text-red-600 dark:text-red-400',
        color: '#ef4444'
    },
     [DefectSeverity.High]: {
        icon: <div className="w-2 h-2 rounded-full bg-orange-500" />,
        textColor: 'text-orange-600 dark:text-orange-400',
        color: '#f97316'
    },
    [DefectSeverity.Medium]: {
        icon: <div className="w-2 h-2 rounded-full bg-amber-500" />,
        textColor: 'text-amber-600 dark:text-amber-400',
        color: '#f59e0b'
    },
    [DefectSeverity.Low]: {
        icon: <div className="w-2 h-2 rounded-full bg-blue-500" />,
        textColor: 'text-blue-600 dark:text-blue-400',
        color: '#3b82f6'
    },
};

const KPIStat: React.FC<{ icon: React.ReactNode; value: number | string; label: string; }> = ({ icon, value, label }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2 mb-1">$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
        .replace(/(\r\n|\n|\r)/gm, '<br>');

    html = html.replace(/(<li>.*?<\/li>(?:<br>)*)+/gs, (match) => {
        return `<ul class="list-disc list-inside space-y-1 pl-1 text-slate-700 dark:text-slate-300">${match.replace(/<br>/g, '')}</ul>`;
    });

    return <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};

const TaskStatusDonutChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const stats = useMemo(() => {
        const counts = {
            [TaskStatus.Completed]: 0,
            [TaskStatus.Upcoming]: 0,
            [TaskStatus.Pending]: 0,
        };
        tasks.forEach(task => {
            if (task.status in counts) {
                counts[task.status]++;
            }
        });
        return counts;
    }, [tasks]);

    const totalTasks = tasks.length;
    if (totalTasks === 0) return <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No task data</p>;

    const data = [
        { status: TaskStatus.Completed, value: stats[TaskStatus.Completed], color: '#22c55e' },
        { status: TaskStatus.Upcoming, value: stats[TaskStatus.Upcoming], color: '#f59e0b' },
        { status: TaskStatus.Pending, value: stats[TaskStatus.Pending], color: '#6366f1' },
    ];

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
                {data.map(item => {
                    const dasharray = (item.value / totalTasks) * circumference;
                    const strokeDasharray = `${dasharray} ${circumference - dasharray}`;
                    const strokeDashoffset = -offset;
                    offset += dasharray;
                    return (
                        <circle
                            key={item.status}
                            cx="50" cy="50" r={radius} fill="none"
                            stroke={item.color} strokeWidth="10"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                        />
                    );
                })}
                <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" className="transform rotate-90 fill-slate-800 dark:fill-slate-100 font-bold text-2xl">
                    {totalTasks}
                </text>
            </svg>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs">
                {data.map(item => (
                    <div key={item.status} className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 dark:text-slate-300">{item.status}: <span className="font-semibold text-slate-800 dark:text-slate-100">{item.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DefectSeverityBarChart: React.FC<{ defects: Defect[] }> = ({ defects }) => {
    const severityOrder = [DefectSeverity.Critical, DefectSeverity.High, DefectSeverity.Medium, DefectSeverity.Low];
    const stats = useMemo(() => {
        const counts = new Map<DefectSeverity, number>();
        severityOrder.forEach(s => counts.set(s, 0));
        defects.forEach(defect => {
            counts.set(defect.severity, (counts.get(defect.severity) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([severity, count]) => ({ severity, count }));
    }, [defects]);

    if (defects.length === 0) return <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No defect data</p>;
    
    const maxCount = Math.max(...stats.map(s => s.count), 1);

    return (
        <div className="h-full flex flex-col justify-end px-2 pt-4">
            <div className="flex justify-between items-end h-32 border-b border-slate-300 dark:border-slate-600">
                {stats.map(({ severity, count }) => (
                    <div key={severity} className="flex-1 flex flex-col items-center">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{count}</span>
                         <div className="w-3/4 h-full flex items-end">
                            <div
                                className="w-full"
                                style={{
                                    height: `${(count / maxCount) * 100}%`,
                                    backgroundColor: severityConfig[severity].color,
                                    borderTopLeftRadius: '4px',
                                    borderTopRightRadius: '4px'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                 {stats.map(({ severity }) => (
                    <div key={severity} className="flex-1 text-center">{severity}</div>
                ))}
            </div>
        </div>
    );
};


export const ProjectDetailPane: React.FC<ProjectDetailPaneProps> = ({ project, vendors, tasks, defects, toolConfigs, onBack }) => {
    const projectTasks = tasks.filter(t => t.project === project.name);
    const projectDefects = defects.filter(d => d.project === project.name);
    const vendor = vendors.find(v => v.id === project.vendorId);
    const toolConfig = toolConfigs.find(tc => tc.tool === project.tool);

    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] =useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    
    const kpis = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            completedTasks: projectTasks.filter(t => t.status === TaskStatus.Completed).length,
            openDefects: projectDefects.length,
            overdueTasks: projectTasks.filter(
                t => t.status !== TaskStatus.Completed && t.dueDate !== 'Complete' && t.dueDate !== 'TBD' && new Date(t.dueDate) < today
            ).length,
        };
    }, [projectTasks, projectDefects]);

    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        try {
            const context = {
                project,
                tasks: projectTasks,
                defects: projectDefects,
            };
            const result = await generateProjectAnalysis(context);
            setAnalysis(result);
        } catch (e) {
            setAnalysisError('Failed to generate analysis. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="p-4 space-y-6">
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Projects
            </button>

            {/* Project Summary */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                        {project.status}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{project.name}</h3>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 my-3">
                    <div className={`${statusColors[project.status].progress} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                    <div className="text-slate-500 dark:text-slate-400">Progress</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{project.progress}%</div>
                    <div className="text-slate-500 dark:text-slate-400">Vendor</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{vendor?.name}</div>
                    <div className="text-slate-500 dark:text-slate-400">Tool</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{project.tool}</div>
                </div>
            </div>
            
            {/* Key Metrics */}
             <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Metrics</h4>
                <div className="grid grid-cols-3 gap-3">
                    <KPIStat icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} value={kpis.completedTasks} label="Completed Tasks" />
                    <KPIStat icon={<BugIcon className="w-6 h-6 text-amber-500" />} value={kpis.openDefects} label="Open Defects" />
                    <KPIStat icon={<ExclamationCircleIcon className="w-6 h-6 text-red-500" />} value={kpis.overdueTasks} label="Overdue Tasks" />
                </div>
            </div>

            {/* AI Project Analysis */}
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">AI Project Analysis</h4>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 min-h-[6rem] flex flex-col justify-center">
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <SpinnerIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm">Analyzing...</span>
                        </div>
                    ) : analysisError ? (
                         <div className="text-center text-red-500 text-sm p-2">{analysisError}</div>
                    ) : analysis ? (
                        renderMarkdown(analysis)
                    ) : (
                        <div className="text-center">
                            <button onClick={handleGenerateAnalysis} className="inline-flex items-center justify-center text-sm font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-300">
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Generate Analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Trends */}
            <div>
                 <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Project Trends</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-center text-slate-600 dark:text-slate-300 mb-2">Task Status</h5>
                        <TaskStatusDonutChart tasks={projectTasks} />
                    </div>
                     <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-center text-slate-600 dark:text-slate-300 mb-2">Defect Severity</h5>
                        <DefectSeverityBarChart defects={projectDefects} />
                    </div>
                </div>
            </div>

            {/* Vendor & Tool Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor && (
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <UserCircleIcon className="w-5 h-5 text-slate-500" />
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Vendor Details</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm space-y-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.name}</p>
                            <p className="text-slate-600 dark:text-slate-300">{vendor.contactPerson}</p>
                            <a href={`mailto:${vendor.contactEmail}`} className="text-indigo-600 hover:underline dark:text-indigo-400">{vendor.contactEmail}</a>
                        </div>
                    </div>
                )}
                <div>
                     <div className="flex items-center space-x-2 mb-2">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-slate-500" />
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Tool Configuration</h4>
                    </div>
                     <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm space-y-1">
                        {toolConfig ? (
                            <>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{toolConfig.tool}</p>
                                <p className="text-slate-600 dark:text-slate-300">User: {toolConfig.username}</p>
                                <p className={`text-xs font-bold ${(toolConfig.password || toolConfig.apiKey) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    Credentials: {(toolConfig.password || toolConfig.apiKey) ? 'Configured' : 'Not Configured'}
                                </p>
                            </>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">No configuration found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <ListBulletIcon className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Tasks ({projectTasks.length})</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {projectTasks.length > 0 ? projectTasks.map(task => (
                        <div key={task.id} className={`bg-white dark:bg-slate-800/50 p-2 rounded-md border-l-4 ${priorityColors[task.priority]}`}>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>{task.dueDate}</span>
                                <span className="font-semibold">{task.status}</span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tasks for this project.</p>}
                </div>
            </div>

            {/* Defects Section */}
             <div>
                <div className="flex items-center space-x-2 mb-3">
                    <BugIcon className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Defects ({projectDefects.length})</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {projectDefects.length > 0 ? projectDefects.map(defect => (
                         <div key={defect.id} className="bg-white dark:bg-slate-800/50 p-2 rounded-md">
                             <div className="flex items-start space-x-2">
                                <div className="pt-1.5">{severityConfig[defect.severity].icon}</div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${severityConfig[defect.severity].textColor}`}>{defect.title}</p>
                                    {defect.triageCall && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Triage: {defect.triageCall}</p>}
                                </div>
                             </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No defects for this project.</p>}
                </div>
            </div>
        </div>
    );
};