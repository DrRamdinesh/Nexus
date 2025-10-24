import React, { useState, useMemo, FC } from 'react';
import { Project, Task, Defect, ScheduledReport, Vendor } from '../types';
import { generateProjectReport } from '../services/geminiService';
import { SpinnerIcon, ClockIcon } from '../constants';
import { ScheduleReportModal } from './ScheduleReportModal';


interface ReportGenerationWidgetProps {
    dataContext: {
        projects: Project[];
        tasks: Task[];
        defects: Defect[];
        vendors: Vendor[];
    };
    onScheduleReport: (schedule: Omit<ScheduledReport, 'id'>) => void;
}

const ReportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm-1 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);


const EnvelopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
        .replace(/(\r\n|\n|\r)/gm, '<br>');

    // Find blocks of list items and wrap them in a <ul> tag.
    html = html.replace(/(<li>.*?<\/li>(?:<br>)*)+/gs, (match) => {
        return `<ul class="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">${match.replace(/<br>/g, '')}</ul>`;
    });

    return <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const ReportGenerationWidget: FC<ReportGenerationWidgetProps> = ({ dataContext, onScheduleReport }) => {
    const { projects, tasks, defects, vendors } = dataContext;

    const [reportType, setReportType] = useState<'Project' | 'Vendor'>('Project');
    const [selectedTarget, setSelectedTarget] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reportContent, setReportContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);

    const projectNames = useMemo(() => projects.map(p => p.name), [projects]);
    const vendorNames = useMemo(() => vendors.map(v => v.name), [vendors]);
    
    // Set initial selected target
    useMemo(() => {
        if (reportType === 'Project' && projectNames.length > 0) {
            setSelectedTarget(projectNames[0]);
        } else if (reportType === 'Vendor' && vendorNames.length > 0) {
            setSelectedTarget(vendorNames[0]);
        } else {
            setSelectedTarget('');
        }
    }, [reportType, projectNames, vendorNames]);

    const handleGenerateReport = async () => {
        if (!selectedTarget) return;

        setIsLoading(true);
        setReportContent(null);
        setError(null);

        let reportContext: object;

        if (reportType === 'Project') {
            const project = projects.find(p => p.name === selectedTarget);
            reportContext = {
                project,
                tasks: tasks.filter(t => t.project === selectedTarget),
                defects: defects.filter(d => d.project === selectedTarget),
            };
        } else { // Vendor
            const vendor = vendors.find(v => v.name === selectedTarget);
            const vendorProjects = projects.filter(p => p.vendorId === vendor?.id);
            const vendorProjectNames = vendorProjects.map(p => p.name);
            reportContext = {
                vendor,
                projects: vendorProjects,
                tasks: tasks.filter(t => vendorProjectNames.includes(t.project)),
                defects: defects.filter(d => vendorProjectNames.includes(d.project)),
            };
        }

        try {
            const result = await generateProjectReport(reportContext, 'Detailed');
            setReportContent(result);
        } catch (e) {
            setError('Failed to generate report. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = () => {
        window.print();
    };

    const handleShareEmail = () => {
        if (!reportContent) return;

        const subject = `AI-Generated Report: ${reportType} - ${selectedTarget}`;
        
        // Simple conversion from markdown to plain text for email body
        const plainTextBody = reportContent
            .replace(/### (.*$)/gim, '\n--- $1 ---\n')
            .replace(/^\* (.*$)/gim, '- $1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/<br>/g, '\n')
            .replace(/<\/?[^>]+(>|$)/g, ""); // strip any remaining html

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
        window.location.href = mailtoLink;
    };
    
    const handleSaveSchedule = (schedule: Omit<ScheduledReport, 'id'>) => {
        onScheduleReport(schedule);
        setIsScheduling(false);
    };


    const targetOptions = reportType === 'Project' ? projectNames : vendorNames;
    const selectClass = "bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full";

    return (
        <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">AI-Powered Report Generator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="report-type" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Report Type</label>
                        <select id="report-type" value={reportType} onChange={e => setReportType(e.target.value as 'Project' | 'Vendor')} className={selectClass}>
                            <option>Project</option>
                            <option>Vendor</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="report-target" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{reportType}</label>
                        <select id="report-target" value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)} className={selectClass} disabled={targetOptions.length === 0}>
                            {targetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                        onClick={() => setIsScheduling(true)}
                        disabled={isLoading || !selectedTarget}
                        className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        <ClockIcon className="w-5 h-5 mr-2" />
                        Schedule Report
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading || !selectedTarget}
                        className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed w-full sm:w-auto flex-grow"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <ReportIcon className="w-5 h-5 mr-2" />}
                        {isLoading ? 'Generating...' : 'Generate Detailed Report Now'}
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50/75 dark:bg-slate-800/50 p-4 rounded-md min-h-[10rem] flex flex-col">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center flex-grow text-slate-500 dark:text-slate-400">
                                <SpinnerIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm">Analyzing data and generating insights...</p>
                            </div>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center flex-grow text-red-500">
                               <p className="text-center">{error}</p>
                            </div>
                        )}
                        {reportContent && (
                            <div id="printable-report">
                                <div className="max-h-80 overflow-y-auto mb-4 pr-2 report-content">
                                    {renderMarkdown(reportContent)}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end border-t border-slate-200 dark:border-slate-700 pt-3 no-print">
                                    <button
                                        onClick={handleExportPdf}
                                        className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                                        aria-label="Export report as PDF"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                        Export as PDF
                                    </button>
                                    <button
                                        onClick={handleShareEmail}
                                        className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                                        aria-label="Share report via Email"
                                    >
                                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                                        Share via Email
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isLoading && !reportContent && !error && (
                             <div className="flex flex-col items-center justify-center flex-grow text-slate-400 dark:text-slate-500 text-center">
                                <ReportIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm">Your generated report will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ScheduleReportModal
                isOpen={isScheduling}
                onClose={() => setIsScheduling(false)}
                onSave={handleSaveSchedule}
                targetType={reportType}
                targetName={selectedTarget}
            />
        </>
    );
};