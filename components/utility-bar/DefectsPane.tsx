import React, { useState, useMemo } from 'react';
import type { Project, Defect } from '../../types';
import { DefectSeverity } from '../../types';
import { generateDefectAnalysis } from '../../services/geminiService';
import { SpinnerIcon } from '../../constants';
import { ArrowLeftIcon } from './icons';

interface DefectsPaneProps {
    defects: Defect[];
    projects: Project[];
}

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

const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-md font-semibold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h3>')
        .replace(/^\*\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
        .replace(/(\r\n|\n|\r)/gm, '<br>');

    html = html.replace(/(<li>.*?<\/li>(?:<br>)*)+/gs, (match) => {
        return `<ul class="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">${match.replace(/<br>/g, '')}</ul>`;
    });

    return <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const DefectsPane: React.FC<DefectsPaneProps> = ({ defects, projects }) => {
    const [projectFilter, setProjectFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [analysisTitle, setAnalysisTitle] = useState('');
    const [error, setError] = useState<string | null>(null);

    const projectOptions = useMemo(() => ['All', ...projects.map(p => p.name)], [projects]);
    const severityOptions = useMemo(() => ['All', ...Object.values(DefectSeverity)], []);
    const dateOptions = ['All', 'Last 7 Days', 'Last 30 Days'];
    
    const filteredDefects = useMemo(() => {
        const now = new Date();

        return defects.filter(defect => {
            const projectMatch = projectFilter === 'All' || defect.project === projectFilter;
            const severityMatch = severityFilter === 'All' || defect.severity === severityFilter;

            let dateMatch = true;
            if (dateFilter !== 'All') {
                const defectDate = new Date(defect.creationDate);
                const cutoffDate = new Date(now);
                const daysToSubtract = dateFilter === 'Last 7 Days' ? 7 : 30;
                cutoffDate.setDate(now.getDate() - daysToSubtract);
                
                dateMatch = defectDate >= cutoffDate;
            }

            return projectMatch && severityMatch && dateMatch;
        });
    }, [defects, projectFilter, severityFilter, dateFilter]);

    const handleRunAnalysis = async (type: 'trend' | 'rca' | 'aging' | 'improvement') => {
        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        const selectedDefect = defects.find(d => d.id === selectedDefectId);

        let title = '';
        switch(type) {
            case 'trend': title = 'Trend Analysis'; break;
            case 'rca': title = `RCA for ${selectedDefect?.title}`; break;
            case 'aging': title = 'Defect Aging Report'; break;
            case 'improvement': title = 'Improvement Insights'; break;
        }
        setAnalysisTitle(title);

        try {
            const result = await generateDefectAnalysis(
                { defects: filteredDefects, projects },
                type,
                selectedDefect
            );
            setAnalysisResult(result);
        } catch (e) {
            setError('Failed to generate analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToList = () => {
        setAnalysisResult(null);
        setAnalysisTitle('');
        setError(null);
    }
    
    const selectClass = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const actionButtonClass = "flex-1 text-xs font-semibold px-2 py-2 rounded-md transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="project-filter-defect" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Project</label>
                        <select id="project-filter-defect" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className={selectClass}>
                            {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="severity-filter-defect" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Severity</label>
                        <select id="severity-filter-defect" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className={selectClass}>
                           {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-filter-defect" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Created</label>
                        <select id="date-filter-defect" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClass}>
                           {dateOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>
             <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">AI Analysis Actions</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleRunAnalysis('trend')} className={actionButtonClass}>Trend Analysis</button>
                    <button onClick={() => handleRunAnalysis('aging')} className={actionButtonClass}>Aging Report</button>
                    <button onClick={() => handleRunAnalysis('improvement')} className={actionButtonClass}>Get Insights</button>
                    <button onClick={() => handleRunAnalysis('rca')} disabled={!selectedDefectId} className={actionButtonClass}>Perform RCA</button>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <SpinnerIcon className="w-8 h-8 mb-2" />
                        <p className="text-sm">Analyzing...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-4">
                        <p className="text-red-600 mb-4">{error}</p>
                         <button onClick={handleBackToList} className="text-sm font-semibold text-indigo-600">Back to list</button>
                    </div>
                ) : analysisResult ? (
                    <div>
                         <button onClick={handleBackToList} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mb-4">
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            Back to Defect List
                        </button>
                        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-2">{analysisTitle}</h3>
                        {renderMarkdown(analysisResult)}
                    </div>
                ) : (
                    <ul className="space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">
                            {selectedDefectId ? `Selected: ${defects.find(d => d.id === selectedDefectId)?.title}` : 'Select a defect below to enable RCA.'}
                        </p>
                        {filteredDefects.map(defect => (
                            <li 
                                key={defect.id} 
                                onClick={() => setSelectedDefectId(prev => prev === defect.id ? null : defect.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedDefectId === defect.id ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-600' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'}`}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 pt-1.5">{severityConfig[defect.severity].icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${severityConfig[defect.severity].textColor} truncate`}>{defect.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{defect.project} &bull; Created: {defect.creationDate}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    );
};