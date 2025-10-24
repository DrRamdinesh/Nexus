import React, { useState, useEffect, useRef } from 'react';
import type { Defect, CalendarEvent, Project, ToolConfiguration } from '../types';
import { DefectSeverity } from '../types';
import { ScheduleEventModal } from './ScheduleEventModal';
import { NewDefectModal } from './NewDefectModal';
import { CalendarPlusIcon, PlusIcon, LightbulbIcon } from '../constants';
import { generateDefectTriageSuggestions } from '../services/geminiService';
import { AiDefectAnalysisModal } from './AiDefectAnalysisModal';
import { ArrowPathIcon } from './utility-bar/icons';

interface ImmediateAttentionWidgetProps {
    defects: Defect[];
    projects: Project[];
    setDefects: React.Dispatch<React.SetStateAction<Defect[]>>;
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    toolConfigs: ToolConfiguration[];
    lastRefreshed: Date | null;
    onRefresh: () => Promise<any>;
    highlightedItemId: string | null;
}

const severityConfig = {
    [DefectSeverity.Critical]: {
        icon: (
            <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
        ),
        textColor: 'text-red-600 dark:text-red-400'
    },
     [DefectSeverity.High]: {
        icon: (
            <svg className="w-5 h-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
        ),
        textColor: 'text-orange-600 dark:text-orange-400'
    },
};

const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'never';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const ImmediateAttentionWidget: React.FC<ImmediateAttentionWidgetProps> = ({ defects, projects, setDefects, onAddEvent, toolConfigs, lastRefreshed, onRefresh, highlightedItemId }) => {
    const [triagedDefects, setTriagedDefects] = useState<Set<string>>(new Set());
    const [schedulingDefect, setSchedulingDefect] = useState<Defect | null>(null);
    const [isAddingDefect, setIsAddingDefect] = useState(false);
    
    const [analyzingDefect, setAnalyzingDefect] = useState<Defect | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const itemRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

    useEffect(() => {
        if (highlightedItemId) {
            const element = itemRefs.current.get(highlightedItemId);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedItemId]);

    useEffect(() => {
        // This interval updates the "time ago" string periodically without a full data refresh.
        const timer = setInterval(() => setCurrentTime(new Date()), 30000); // every 30 seconds
        return () => clearInterval(timer);
    }, []);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error("Manual refresh failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };


    const handleSaveEvent = (event: Omit<CalendarEvent, 'id'>) => {
        onAddEvent(event);
        setSchedulingDefect(null);
    };
    
    const handleSaveNewDefect = (newDefectData: Omit<Defect, 'id'>) => {
        const newDefect: Defect = {
            ...newDefectData,
            id: `DEF-${Date.now()}`,
        };
        setDefects(prevDefects => [newDefect, ...prevDefects]);
        setIsAddingDefect(false);
    };

    const handleAnalyzeDefect = async (defect: Defect) => {
        setAnalyzingDefect(defect);
        setIsAnalysisLoading(true);
        setAnalysisResult(null);
        try {
            const result = await generateDefectTriageSuggestions(defect);
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            setAnalysisResult("Sorry, I couldn't generate suggestions at this time.");
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const criticalDefects = defects
        .filter(d => d.severity === DefectSeverity.Critical || d.severity === DefectSeverity.High)
        .sort((a, b) => {
            const aTriaged = triagedDefects.has(a.id);
            const bTriaged = triagedDefects.has(b.id);
            if (aTriaged && !bTriaged) return 1;
            if (!aTriaged && bTriaged) return -1;
            return 0;
        });

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Immediate Attention</h3>
                    <button 
                        onClick={() => setIsAddingDefect(true)}
                        className="flex items-center space-x-1 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="Add new defect"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>New Defect</span>
                    </button>
                </div>
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400" title={lastRefreshed?.toLocaleString()}>
                        Last updated: {formatTimeAgo(lastRefreshed)}
                    </p>
                    <button 
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Refresh defect data"
                    >
                        <ArrowPathIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
                <ul className="space-y-3">
                    {criticalDefects.length > 0 ? criticalDefects.map(defect => {
                        const isTriaged = triagedDefects.has(defect.id);
                        const isHighlighted = defect.id === highlightedItemId;
                        return (
                            <li 
                                key={defect.id} 
                                // FIX: The ref callback should not return a value and should handle cleanup.
                                ref={(el) => {
                                    if (el) {
                                        itemRefs.current.set(defect.id, el);
                                    } else {
                                        itemRefs.current.delete(defect.id);
                                    }
                                }}
                                className={`flex items-start space-x-3 transition-opacity p-2 -m-2 rounded-lg ${isTriaged ? 'opacity-50' : ''} ${isHighlighted ? 'animate-pulse-highlight ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''}`}
                            >
                                <div className="flex-shrink-0 pt-0.5">{severityConfig[defect.severity].icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${severityConfig[defect.severity].textColor} ${isTriaged ? 'line-through' : ''} truncate`}>{defect.title}</p>
                                    <p className={`text-xs text-slate-500 dark:text-slate-400 ${isTriaged ? 'line-through' : ''}`}>
                                        {defect.project} &bull; Created: {defect.creationDate}
                                    </p>
                                    {defect.triageCall && !isTriaged && <p className={`text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1`}>Suggestion: {defect.triageCall}</p>}
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-1">
                                    {!isTriaged && (
                                        <>
                                            <button
                                                onClick={() => handleAnalyzeDefect(defect)}
                                                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                                aria-label={`Get AI suggestions for ${defect.title}`}
                                            >
                                                <LightbulbIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSchedulingDefect(defect)}
                                                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                                                aria-label={`Schedule triage for ${defect.title}`}
                                            >
                                                <CalendarPlusIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setTriagedDefects(prev => {
                                            const newSet = new Set(prev);
                                            isTriaged ? newSet.delete(defect.id) : newSet.add(defect.id);
                                            return newSet;
                                        })}
                                        className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${isTriaged ? 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                        aria-label={isTriaged ? `Mark defect ${defect.title} as not triaged` : `Mark defect ${defect.title} as triaged`}
                                    >
                                        {isTriaged ? 'Undo' : 'Triage'}
                                    </button>
                                </div>
                            </li>
                        )
                    }) : <p className="text-sm text-slate-500 dark:text-slate-400">No critical items to show.</p>}
                </ul>
            </div>
            
            <ScheduleEventModal
                isOpen={!!schedulingDefect}
                onClose={() => setSchedulingDefect(null)}
                onSave={handleSaveEvent}
                initialTitle={schedulingDefect ? `Triage: ${schedulingDefect.title}` : ''}
                initialDate={new Date()}
            />
            
            <NewDefectModal
                isOpen={isAddingDefect}
                onClose={() => setIsAddingDefect(false)}
                onSave={handleSaveNewDefect}
                projects={projects}
                toolConfigs={toolConfigs}
            />

            <AiDefectAnalysisModal
                isOpen={!!analyzingDefect}
                onClose={() => setAnalyzingDefect(null)}
                defect={analyzingDefect}
                analysisResult={analysisResult}
                isLoading={isAnalysisLoading}
            />
        </>
    );
};