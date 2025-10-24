import React, { useState, useEffect } from 'react';
import type { Project, Defect, ToolConfiguration } from '../types';
import { DefectSeverity, ConnectionStatus } from '../types';
import { fetchProjectsFromTool } from '../../services/toolService';

interface NewDefectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (defect: Omit<Defect, 'id'>) => void;
    projects: Project[];
    toolConfigs: ToolConfiguration[];
}

const initialState = {
    title: '',
    severity: DefectSeverity.Critical,
    project: '',
    triageCall: '',
};

export const NewDefectModal: React.FC<NewDefectModalProps> = ({ isOpen, onClose, onSave, projects, toolConfigs }) => {
    const [defectData, setDefectData] = useState(initialState);
    const [error, setError] = useState<string | null>(null);
    
    // State for tool integration
    const [source, setSource] = useState('Nexus'); // 'Nexus' or a tool config ID
    const [toolProjects, setToolProjects] = useState<{ id: string; name: string }[]>([]);
    const [isFetchingProjects, setIsFetchingProjects] = useState(false);

    const connectedTools = toolConfigs.filter(c => c.status === ConnectionStatus.Connected);

    useEffect(() => {
        if (isOpen) {
            const defaultProject = projects.length > 0 ? projects[0].name : '';
            setDefectData({ ...initialState, project: defaultProject });
            setError(null);
            setSource('Nexus');
            setToolProjects([]);
        }
    }, [isOpen, projects]);

    useEffect(() => {
        if (!isOpen) return;

        const handleSourceChange = async () => {
            setError(null);
            if (source === 'Nexus') {
                setToolProjects([]);
                // Reset project selection to first Nexus project if available
                if (projects.length > 0) {
                    setDefectData(prev => ({ ...prev, project: projects[0].name }));
                } else {
                    setDefectData(prev => ({ ...prev, project: '' }));
                }
            } else {
                const config = connectedTools.find(c => c.id === source);
                if (config) {
                    setIsFetchingProjects(true);
                    setToolProjects([]);
                    try {
                        const fetchedProjects = await fetchProjectsFromTool(config);
                        setToolProjects(fetchedProjects.map(p => ({ id: p.id, name: p.name })));
                        // Set project selection to first fetched project if available
                        if (fetchedProjects.length > 0) {
                            setDefectData(prev => ({ ...prev, project: fetchedProjects[0].name }));
                        } else {
                            setDefectData(prev => ({ ...prev, project: '' }));
                        }
                    } catch (err) {
                        console.error(err);
                        setError("Failed to fetch projects from the selected tool.");
                    } finally {
                        setIsFetchingProjects(false);
                    }
                }
            }
        };

        handleSourceChange();
    }, [source, isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDefectData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setError(null);
        if (!defectData.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!defectData.project) {
            setError('Please select a project.');
            return;
        }

        const newDefectData: Omit<Defect, 'id'> = {
            title: defectData.title.trim(),
            project: defectData.project,
            severity: defectData.severity,
            creationDate: new Date().toISOString().split('T')[0],
            triageCall: defectData.triageCall.trim() || undefined,
        };
        onSave(newDefectData);
    };

    if (!isOpen) return null;

    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";
    const projectOptions = source === 'Nexus' ? projects : toolProjects;

    return (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Create New Defect</h3>
                
                {error && <div className="bg-red-100 border border-red-300 text-red-800 text-sm rounded-md p-3 text-center mb-4">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="defect-title" className={labelClass}>Defect Title</label>
                        <input id="defect-title" name="title" type="text" value={defectData.title} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="defect-source" className={labelClass}>Source</label>
                             <select id="defect-source" name="source" value={source} onChange={e => setSource(e.target.value)} className={commonInputClass}>
                                 <option value="Nexus">Nexus (Manual)</option>
                                 {connectedTools.map(c => <option key={c.id} value={c.id}>{c.tool}</option>)}
                             </select>
                        </div>
                        <div>
                            <label htmlFor="defect-project" className={labelClass}>Project</label>
                            <select id="defect-project" name="project" value={defectData.project} onChange={handleChange} className={commonInputClass} disabled={isFetchingProjects || projectOptions.length === 0}>
                                {isFetchingProjects ? (
                                    <option>Loading projects...</option>
                                ) : projectOptions.length > 0 ? (
                                    projectOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                                ) : (
                                    <option>No projects found</option>
                                )}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="defect-severity" className={labelClass}>Severity</label>
                            <select id="defect-severity" name="severity" value={defectData.severity} onChange={handleChange} className={commonInputClass}>
                                {Object.values(DefectSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="defect-triageCall" className={labelClass}>Triage Suggestion (Optional)</label>
                            <input id="defect-triageCall" name="triageCall" type="text" value={defectData.triageCall} onChange={handleChange} className={commonInputClass} placeholder="e.g., 'Today @ 3 PM'"/>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        Save Defect
                    </button>
                </div>
            </div>
        </div>
    );
};