import React from 'react';
import type { Defect } from '../types';
import { SpinnerIcon, LightbulbIcon } from '../constants';

interface AiDefectAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    defect: Defect | null;
    analysisResult: string | null;
    isLoading: boolean;
}

const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-md font-semibold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h3>')
        .replace(/^- (.*$)/gim, '<li>$1</li>') // For markdown lists with -
        .replace(/^\* (.*$)/gim, '<li>$1</li>') // For markdown lists with *
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>') // For markdown lists with 1.
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
        .replace(/(\r\n|\n|\r)/gm, '<br>');

    html = html.replace(/(<li>.*?<\/li>(?:<br>)*)+/gs, (match) => {
        return `<ul class="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">${match.replace(/<br>/g, '')}</ul>`;
    });

    return <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const AiDefectAnalysisModal: React.FC<AiDefectAnalysisModalProps> = ({ isOpen, onClose, defect, analysisResult, isLoading }) => {
    if (!isOpen || !defect) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border dark:border-slate-700 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0">
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                            <LightbulbIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Triage Suggestions</h3>
                             <p className="text-sm text-slate-500 dark:text-slate-400" title={defect.title}>For Defect: <span className="font-medium">{defect.title}</span></p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex-1 overflow-y-auto pr-2">
                    {isLoading && (
                         <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                            <SpinnerIcon className="w-8 h-8 mb-2" />
                            <p className="text-sm">Analyzing defect, please wait...</p>
                        </div>
                    )}
                    {analysisResult && !isLoading && renderMarkdown(analysisResult)}
                </div>

                <div className="mt-6 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};