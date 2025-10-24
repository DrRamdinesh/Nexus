import React, { useState, FC } from 'react';
import type { Task, Project, ProactiveSuggestion, SuggestionAction } from '../types';
import { generateProactiveSuggestions } from '../services/geminiService';
import { SpinnerIcon, LightbulbIcon } from '../constants';

interface ProactiveSuggestionsWidgetProps {
    tasks: Task[];
    projects: Project[];
    onTakeAction: (action: SuggestionAction) => void;
}


export const ProactiveSuggestionsWidget: FC<ProactiveSuggestionsWidgetProps> = ({ tasks, projects, onTakeAction }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<ProactiveSuggestion[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setSuggestions(null);
        setError(null);
        try {
            const result = await generateProactiveSuggestions(tasks, projects);
            // Set to null if no suggestions to show placeholder and avoid empty state
            setSuggestions(result.length > 0 ? result : null);
        } catch (e) {
            setError('Failed to generate suggestions. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = (suggestionId: string) => {
        setSuggestions(prev => {
            if (!prev) return null;
            const newSuggestions = prev.filter(s => s.id !== suggestionId);
            return newSuggestions.length > 0 ? newSuggestions : null;
        });
    };
    
    const handleAct = (suggestion: ProactiveSuggestion) => {
        onTakeAction(suggestion.action);
        // Optimistically remove the suggestion from the list
        handleDismiss(suggestion.id);
    };

    const getActionText = (action: SuggestionAction): string => {
        switch (action.type) {
            case 'schedule_meeting':
                return 'Schedule Meeting';
            case 'review_task':
                return 'Review Task';
            default:
                return 'Acknowledge';
        }
    };


    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">AI Proactive Insights</h3>
            
            <div className="min-h-[10rem] flex flex-col">
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 flex-grow">
                        <SpinnerIcon className="w-8 h-8 mb-2" />
                        <p className="text-sm">Analyzing task data for trends and risks...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500 flex-grow justify-center items-center flex">{error}</p>}
                
                {suggestions && (
                    <div className="bg-slate-50/75 dark:bg-slate-800/50 p-2 rounded-md">
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                            {suggestions.map(suggestion => (
                                <div key={suggestion.id} className="bg-white dark:bg-slate-700/50 p-3 rounded-md border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{suggestion.suggestion}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{suggestion.reasoning}</p>
                                    <div className="flex justify-end space-x-2 mt-3">
                                        <button 
                                            onClick={() => handleDismiss(suggestion.id)}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                                        >
                                            Dismiss
                                        </button>
                                        <button 
                                            onClick={() => handleAct(suggestion)}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-300"
                                        >
                                            {getActionText(suggestion.action)}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && !suggestions && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center flex-grow">
                        <LightbulbIcon className="w-12 h-12 mb-2" />
                        <p className="text-sm max-w-sm">Get AI-powered suggestions based on current task trends to improve project health and progress.</p>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                     <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <LightbulbIcon className="w-5 h-5 mr-2" />}
                        {isLoading ? 'Analyzing...' : suggestions ? 'Re-Analyze Trends' : 'Analyze Task Trends'}
                    </button>
                </div>
            </div>
        </div>
    );
};