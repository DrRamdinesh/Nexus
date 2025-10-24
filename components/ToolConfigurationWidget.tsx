import React, { useState } from 'react';
import type { ToolConfiguration, Project } from '../types';
import { ConnectionStatus, Tool } from '../types';
import { SpinnerIcon, TrashIcon, PencilIcon } from '../constants';
import { fetchProjectsFromTool } from '../services/toolService';

interface ToolConfigurationWidgetProps {
    configurations: ToolConfiguration[];
    setConfigurations: React.Dispatch<React.SetStateAction<ToolConfiguration[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const statusConfig: Record<ConnectionStatus, { color: string, text: string }> = {
    [ConnectionStatus.Connected]: { color: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
    [ConnectionStatus.Disconnected]: { color: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
    [ConnectionStatus.Pending]: { color: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' },
};

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.186A10.004 10.004 0 009.999 3a9.958 9.958 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.496 1.496a2.5 2.5 0 013.304 3.304l1.5 1.5a4 4 0 00-6.3-6.3z" />
        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.257 0-7.893-2.66-9.336-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L1.664 4.84A11.5 11.5 0 00.118 8.613a2.953 2.953 0 000 2.774c1.64 4.312 5.53 7.113 9.882 7.113a11.454 11.454 0 005.158-1.3l-2.122-2.122a4.015 4.015 0 01-2.89 1.42z" />
    </svg>
);

const AddIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

// FIX: Moved EditForm outside of the main component to prevent re-creation on render and fix the 'key' prop error.
const EditForm: React.FC<{
    onSave: () => void;
    onCancel: () => void;
    formData: { tool: Tool; username: string; password: string; apiKey: string; url: string; };
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    passwordVisible: boolean;
    setPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
    apiKeyVisible: boolean;
    setApiKeyVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isFormValid: boolean;
    commonInputClass: string;
    editingConfigId: string | null;
}> = ({
    onSave,
    onCancel,
    formData,
    handleFormChange,
    passwordVisible,
    setPasswordVisible,
    apiKeyVisible,
    setApiKeyVisible,
    isFormValid,
    commonInputClass,
    editingConfigId
}) => {
    const getPlaceholder = (field: 'password' | 'apiKey') => {
        if (field === 'apiKey') {
            if (formData.tool === Tool.Jira) return `e.g., JIRA_API_KEY_SECRET`;
            if (formData.tool === Tool.Trello) return `Hint: use 'VALID_TRELLO_KEY'`;
            return 'Enter API Key (if applicable)';
        }
        if (field === 'password') {
            if (formData.tool === Tool.OpenProject) return `Hint: use 'VALID_PASSWORD'`;
            if (formData.tool === Tool.Rally) return `Hint: use 'VALID_PASSWORD'`;
            return 'Enter Password (if applicable)';
        }
        return '';
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{editingConfigId ? 'Edit Tool' : 'Add New Tool'}</h4>
            <div>
                <label htmlFor="form-tool" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tool</label>
                <select id="form-tool" name="tool" value={formData.tool} onChange={handleFormChange} className={commonInputClass}>
                    {Object.values(Tool).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="form-url" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">URL</label>
                <input id="form-url" name="url" type="text" value={formData.url} onChange={handleFormChange} className={commonInputClass} placeholder="https://company.atlassian.net" />
            </div>
            <div>
                <label htmlFor="form-username" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Username/Email</label>
                <input id="form-username" name="username" type="text" value={formData.username} onChange={handleFormChange} className={commonInputClass} placeholder="pm_user@example.com" />
            </div>
            <div>
                <label htmlFor="form-password" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                    <input id="form-password" name="password" type={passwordVisible ? 'text' : 'password'} value={formData.password} onChange={handleFormChange} className={`${commonInputClass} pr-8`} placeholder={getPlaceholder('password')}/>
                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600" aria-label={passwordVisible ? 'Hide Password' : 'Show Password'}>
                        {passwordVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
             <div>
                <label htmlFor="form-apiKey" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">API Key</label>
                <div className="relative">
                    <input id="form-apiKey" name="apiKey" type={apiKeyVisible ? 'text' : 'password'} value={formData.apiKey} onChange={handleFormChange} className={`${commonInputClass} pr-8`} placeholder={getPlaceholder('apiKey')}/>
                    <button type="button" onClick={() => setApiKeyVisible(!apiKeyVisible)} className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600" aria-label={apiKeyVisible ? 'Hide API Key' : 'Show API Key'}>
                        {apiKeyVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                 <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200">
                    Cancel
                </button>
                 <button onClick={onSave} disabled={!isFormValid} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed">
                    Save
                </button>
            </div>
        </div>
    )
};


export const ToolConfigurationWidget: React.FC<ToolConfigurationWidgetProps> = ({ configurations, setConfigurations, projects, setProjects }) => {
    const [testingId, setTestingId] = useState<string | null>(null);
    const [fetchingState, setFetchingState] = useState<{ id: string, status: 'loading' | 'error' | 'success', message?: string } | null>(null);

    // Add/Edit/Delete State
    const [isAdding, setIsAdding] = useState(false);
    const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
    const [deletingConfig, setDeletingConfig] = useState<ToolConfiguration | null>(null);
    
    // State for project selection UI
    const [fetchedProjects, setFetchedProjects] = useState<Record<string, Project[]>>({});
    const [selectedProjects, setSelectedProjects] = useState<Record<string, Set<string>>>({});

    const initialFormState = { tool: Tool.Jira, username: '', password: '', apiKey: '', url: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [apiKeyVisible, setApiKeyVisible] = useState(false);

    const handleTestConnection = (configId: string) => {
        const config = configurations.find(c => c.id === configId);
        if (!config) return;

        setTestingId(configId);
        setTimeout(() => {
            let isSuccess = false;
            switch (config.tool) {
                case Tool.Jira:
                    isSuccess = config.username === 'ramdineshboopalan@botifyx.in' && config.apiKey === 'ATATT3xFfGF0bFtMUvkImfIpLXr60OiOttAyfOTghcZxBbY5LhcIxCwuT_FVFgEFFfzUJAGo9tPFKHFMDQxEKXnQfBiHroRti-B7Tql1kpuztHLgk7k_wLb0pxrLIbdBuBFFzC_o4-1kE_tPB22HxhTHs90ybx-4kCxmp6ZcED9BKtJAgP-Ufco=D2FE5807';
                    break;
                case Tool.Trello:
                    isSuccess = config.username === 'pm_trello' && config.apiKey === 'VALID_TRELLO_KEY';
                    break;
                case Tool.OpenProject:
                    isSuccess = config.username === 'admin' && config.password === 'VALID_PASSWORD';
                    break;
                case Tool.Rally:
                    isSuccess = config.username === 'rally_user' && config.password === 'VALID_PASSWORD';
                    break;
                default:
                    isSuccess = false;
                    break;
            }

            setConfigurations(prev =>
                prev.map(c =>
                    c.id === configId
                        ? { ...c, status: isSuccess ? ConnectionStatus.Connected : ConnectionStatus.Disconnected }
                        : c
                )
            );
            setTestingId(null);
        }, 1500);
    };

    const handleFetchProjects = async (config: ToolConfiguration) => {
        setFetchingState({ id: config.id, status: 'loading' });
        // Clear previous results for this config to avoid showing stale data
        setFetchedProjects(prev => {
            const next = {...prev};
            delete next[config.id];
            return next;
        });

        try {
            const newProjects = await fetchProjectsFromTool(config);

            const existingProjectIds = new Set(projects.map(p => p.id));
            const uniqueNewProjects = newProjects.filter(p => !existingProjectIds.has(p.id));

            if (uniqueNewProjects.length > 0) {
                setFetchedProjects(prev => ({ ...prev, [config.id]: uniqueNewProjects }));
                setSelectedProjects(prev => ({ ...prev, [config.id]: new Set() }));
                setFetchingState(null); 
            } else {
                setFetchingState({ id: config.id, status: 'success', message: `All projects from ${config.tool} are already tracked.` });
            }
        } catch (error) {
            console.error(`Failed to fetch projects from ${config.tool}`, error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setFetchingState({ id: config.id, status: 'error', message: errorMessage });
        }
    };

    const handleProjectSelectionChange = (configId: string, projectId: string) => {
        setSelectedProjects(prev => {
            const currentSelection = new Set(prev[configId] || []);
            if (currentSelection.has(projectId)) {
                currentSelection.delete(projectId);
            } else {
                currentSelection.add(projectId);
            }
            return { ...prev, [configId]: currentSelection };
        });
    };

    const handleSelectAll = (configId: string, projectsToSelect: Project[]) => {
        setSelectedProjects(prev => {
            const currentSelection = new Set(prev[configId] || []);
            if (currentSelection.size === projectsToSelect.length) {
                return { ...prev, [configId]: new Set() };
            } else {
                const allProjectIds = new Set(projectsToSelect.map(p => p.id));
                return { ...prev, [configId]: allProjectIds };
            }
        });
    };

    const handleAddSelectedProjects = (configId: string) => {
        const selectedIds = selectedProjects[configId];
        if (!selectedIds || selectedIds.size === 0) return;

        const projectsToAdd = (fetchedProjects[configId] || []).filter(p => selectedIds.has(p.id));

        setProjects(currentProjects => {
            const existingProjectIds = new Set(currentProjects.map(p => p.id));
            const uniqueNewProjects = projectsToAdd.filter(p => !existingProjectIds.has(p.id));
            return [...currentProjects, ...uniqueNewProjects];
        });

        setFetchedProjects(prev => {
            const next = { ...prev };
            delete next[configId];
            return next;
        });
        setSelectedProjects(prev => {
            const next = { ...prev };
            delete next[configId];
            return next;
        });
        setFetchingState({ id: configId, status: 'success', message: `Added ${projectsToAdd.length} project(s).` });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleAddStart = () => {
        setFormData(initialFormState);
        setPasswordVisible(false);
        setApiKeyVisible(false);
        setIsAdding(true);
    };
    
    const handleAddCancel = () => {
        setIsAdding(false);
    };
    
    const handleAddSave = () => {
        const newTool: ToolConfiguration = {
            id: `TOOL-CFG-${Date.now()}`,
            tool: formData.tool,
            username: formData.username,
            password: formData.password || undefined,
            apiKey: formData.apiKey || undefined,
            url: formData.url,
            status: ConnectionStatus.Pending
        };
        setConfigurations(prev => [...prev, newTool]);
        setIsAdding(false);
    };

    const handleEditStart = (config: ToolConfiguration) => {
        setEditingConfigId(config.id);
        setFormData({ tool: config.tool, username: config.username, password: config.password || '', apiKey: config.apiKey || '', url: config.url });
        setPasswordVisible(false);
        setApiKeyVisible(false);
    };

    const handleEditCancel = () => {
        setEditingConfigId(null);
    };

    const handleEditSave = () => {
        if (!editingConfigId) return;
        setConfigurations(prev => 
            prev.map(c => (c.id === editingConfigId ? { 
                ...c, 
                tool: formData.tool,
                username: formData.username,
                password: formData.password || undefined,
                apiKey: formData.apiKey || undefined,
                url: formData.url,
            } : c))
        );
        setEditingConfigId(null);
    };

    const handleRemoveStart = (config: ToolConfiguration) => {
        setDeletingConfig(config);
    };

    const handleRemoveCancel = () => {
        setDeletingConfig(null);
    };

    const handleRemoveConfirm = () => {
        if (!deletingConfig) return;
        setConfigurations(prev => prev.filter(c => c.id !== deletingConfig.id));
        setDeletingConfig(null);
    };


    const isFormValid = formData.username.trim() !== '' && formData.url.trim() !== '' && (formData.password.trim() !== '' || formData.apiKey.trim() !== '');
    const commonInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const actionButtonClass = "p-1.5 rounded-md transition-colors text-slate-500 dark:text-slate-400";
    

    return (
        <div className="p-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Tool Configuration</h3>
            <div className="space-y-3">
                {configurations.map(config => (
                    editingConfigId === config.id ? (
                        <EditForm 
                            key={config.id}
                            onSave={handleEditSave} 
                            onCancel={handleEditCancel}
                            formData={formData}
                            handleFormChange={handleFormChange}
                            passwordVisible={passwordVisible}
                            setPasswordVisible={setPasswordVisible}
                            apiKeyVisible={apiKeyVisible}
                            setApiKeyVisible={setApiKeyVisible}
                            isFormValid={isFormValid}
                            commonInputClass={commonInputClass}
                            editingConfigId={editingConfigId}
                        />
                    ) : (
                        <div key={config.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[config.status].color}`}></div>
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{config.tool}</span>
                                    </div>
                                     <span className={`text-xs font-medium ml-4 ${statusConfig[config.status].text}`}>{config.status}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => handleEditStart(config)} className={`${actionButtonClass} hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200`}>
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                     <button onClick={() => handleRemoveStart(config)} className={`${actionButtonClass} hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 dark:hover:text-red-400`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                                <p><span className="font-medium text-slate-600 dark:text-slate-300">URL:</span> {config.url}</p>
                                <p><span className="font-medium text-slate-600 dark:text-slate-300">User:</span> {config.username}</p>
                            </div>
                             <div className="mt-3 flex justify-end items-center space-x-2">
                                {config.status === ConnectionStatus.Connected && (
                                    <div className="flex-1">
                                        <button
                                            onClick={() => handleFetchProjects(config)}
                                            disabled={fetchingState?.id === config.id && fetchingState.status === 'loading'}
                                            className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {fetchingState?.id === config.id && fetchingState.status === 'loading' ? (
                                                <>
                                                    <SpinnerIcon className="w-4 h-4 mr-2" />
                                                    Fetching...
                                                </>
                                            ) : 'Fetch Projects'}
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleTestConnection(config.id)}
                                    disabled={testingId !== null}
                                    className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-wait"
                                >
                                    {testingId === config.id ? (
                                        <>
                                            <SpinnerIcon className="w-4 h-4 mr-2 text-slate-500" />
                                            Testing...
                                        </>
                                    ) : 'Test Connection'}
                                </button>
                            </div>
                             {fetchingState?.id === config.id && fetchingState.status === 'error' && <p className="text-xs text-red-500 mt-2">{fetchingState.message}</p>}
                             {fetchingState?.id === config.id && fetchingState.status === 'success' && <p className="text-xs text-green-500 mt-2">{fetchingState.message}</p>}
                             {fetchedProjects[config.id] && (
                                <div className="mt-3 bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Projects to Add</h5>
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                                        <div className="flex items-center p-1 sticky top-0 bg-slate-100 dark:bg-slate-900/50">
                                            <input
                                                type="checkbox"
                                                id={`select-all-${config.id}`}
                                                checked={(selectedProjects[config.id]?.size || 0) > 0 && (selectedProjects[config.id]?.size === fetchedProjects[config.id].length)}
                                                onChange={() => handleSelectAll(config.id, fetchedProjects[config.id])}
                                                className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                                            />
                                            <label htmlFor={`select-all-${config.id}`} className="ml-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                                                Select All ({fetchedProjects[config.id].length})
                                            </label>
                                        </div>
                                        {fetchedProjects[config.id].map(project => (
                                            <div key={project.id} className="flex items-center bg-white dark:bg-slate-800 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    id={`project-${project.id}`}
                                                    checked={selectedProjects[config.id]?.has(project.id) || false}
                                                    onChange={() => handleProjectSelectionChange(config.id, project.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor={`project-${project.id}`} className="ml-2 block text-xs text-slate-600 dark:text-slate-300 truncate">
                                                    {project.name} <span className="text-slate-400">({project.id})</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleAddSelectedProjects(config.id)}
                                            disabled={!selectedProjects[config.id] || selectedProjects[config.id].size === 0}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                        >
                                            Add {selectedProjects[config.id]?.size || 0} Selected Projects
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>

            <div className="mt-4">
                {isAdding ? (
                    <EditForm 
                        onSave={handleAddSave} 
                        onCancel={handleAddCancel}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        passwordVisible={passwordVisible}
                        setPasswordVisible={setPasswordVisible}
                        apiKeyVisible={apiKeyVisible}
                        setApiKeyVisible={setApiKeyVisible}
                        isFormValid={isFormValid}
                        commonInputClass={commonInputClass}
                        editingConfigId={editingConfigId}
                    />
                ) : (
                    <button
                        onClick={handleAddStart}
                        className="w-full flex items-center justify-center text-sm font-semibold p-3 rounded-md transition-colors bg-slate-100 hover:bg-slate-200 text-indigo-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-indigo-400"
                    >
                        <AddIcon className="w-5 h-5 mr-2" />
                        Add New Tool
                    </button>
                )}
            </div>

            {deletingConfig && (
                <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Confirm Removal</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                           Are you sure you want to remove the <span className="font-bold text-indigo-600 dark:text-indigo-400">{deletingConfig.tool}</span> configuration for <span className="font-bold">{deletingConfig.username}</span>? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={handleRemoveCancel}
                                className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveConfirm}
                                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};