import React from 'react';
import type { Project, Task, Defect, ToolConfiguration, Vendor, UserProfile, TeamMember, Alert, AlertConfiguration } from '../../types';
import { CloseIcon, SearchIcon, ProjectsIcon, SettingsIcon, BugIcon, UserCircleIcon, TeamsIcon, HelpIcon, BellIcon, ChartBarIcon } from './icons';
import { ProjectsPane } from './ProjectsPane';
import { DefectsPane } from './DefectsPane';
import { UserProfilePane } from './UserProfilePane';
import { TeamsPane } from './TeamsPane';
import { HelpPane } from './HelpPane';
import { SettingsPane } from '../SettingsPane';
import { AlertsPane } from './AlertsPane';
import { ReportsDashboardPane } from './ReportsDashboardPane';

interface SearchPaneProps {
    projects: Project[];
    tasks: Task[];
    defects: Defect[];
}

type SearchResult =
    | { type: 'Project'; item: Project }
    | { type: 'Task'; item: Task }
    | { type: 'Defect'; item: Defect };

const SearchPane: React.FC<SearchPaneProps> = ({ projects, tasks, defects }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const allItems = React.useMemo(() => [
        ...projects.map(item => ({ type: 'Project', item } as SearchResult)),
        ...tasks.map(item => ({ type: 'Task', item } as SearchResult)),
        ...defects.map(item => ({ type: 'Defect', item } as SearchResult))
    ], [projects, tasks, defects]);

    const results = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowercasedQuery = searchQuery.toLowerCase();
        return allItems.filter(result => {
            const name = result.type === 'Project' ? result.item.name : result.item.title;
            return name.toLowerCase().includes(lowercasedQuery);
        });
    }, [searchQuery, allItems]);

    const resultCategories = React.useMemo(() => {
        // FIX: Explicitly type the accumulator in the reduce function to ensure type safety for `items`.
        return results.reduce((acc: Record<string, SearchResult[]>, result) => {
            (acc[result.type] = acc[result.type] || []).push(result);
            return acc;
        }, {});
    }, [results]);

    const categoryConfig = {
        Project: { title: 'Projects', color: 'bg-blue-500' },
        Task: { title: 'Tasks', color: 'bg-green-500' },
        Defect: { title: 'Defects', color: 'bg-red-500' },
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search everything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-10 pr-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Search pane"
                    autoFocus
                />
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {searchQuery.trim() && (
                    results.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(resultCategories).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">{categoryConfig[category as keyof typeof categoryConfig].title}</h3>
                                    <ul className="space-y-2">
                                        {items.map((result, index) => (
                                            <li key={`${result.type}-${result.item.id}-${index}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryConfig[result.type as keyof typeof categoryConfig].color}`}></span>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
                                                        {result.type === 'Project' ? result.item.name : result.item.title}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                            No results for "{searchQuery}"
                        </div>
                    )
                )}
            </div>
        </div>
    );
};


interface NavigationPaneProps {
    activePane: string | null;
    onClose: () => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    vendors: Vendor[];
    tasks: Task[];
    defects: Defect[];
    teamMembers: TeamMember[];
    toolConfigs: ToolConfiguration[];
    setToolConfigs: React.Dispatch<React.SetStateAction<ToolConfiguration[]>>;
    setProjectForDetailView: (project: Project | null) => void;
    userProfile: UserProfile | null;
    onUpdateProfile: (profile: UserProfile) => void;
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
    alertConfig: AlertConfiguration;
    setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfiguration>>;
    onAlertClick: (alert: Alert) => void;
    onItemClick: (itemType: 'Task' | 'Defect', itemId: string) => void;
}

const paneConfig: { [key: string]: { title: string; Icon: React.FC<{className?: string}>; } } = {
    search: { title: 'Global Search', Icon: SearchIcon },
    alerts: { title: 'Notifications', Icon: BellIcon },
    projects: { title: 'Projects Overview', Icon: ProjectsIcon },
    'defects-analysis': { title: 'Defect Intelligence', Icon: BugIcon },
    'reports-dashboard': { title: 'Reports Dashboard', Icon: ChartBarIcon },
    teams: { title: 'Team Directory', Icon: TeamsIcon },
    settings: { title: 'Settings', Icon: SettingsIcon },
    profile: { title: 'User Profile', Icon: UserCircleIcon },
    help: { title: 'Help & Documentation', Icon: HelpIcon },
};


export const NavigationPane: React.FC<NavigationPaneProps> = ({ 
    activePane, 
    onClose, 
    projects, 
    setProjects,
    vendors, 
    tasks, 
    defects,
    teamMembers, 
    toolConfigs, 
    setToolConfigs, 
    setProjectForDetailView,
    userProfile,
    onUpdateProfile,
    alerts,
    setAlerts,
    alertConfig,
    setAlertConfig,
    onAlertClick,
    onItemClick,
}) => {

    if (!activePane) return null;

    const currentPaneConfig = paneConfig[activePane];
    if (!currentPaneConfig) return null;

    const handleProjectSelection = (project: Project) => {
        setProjectForDetailView(project);
        onClose();
    };

    const renderPaneContent = () => {
        switch (activePane) {
            case 'search':
                return <SearchPane projects={projects} tasks={tasks} defects={defects} />;
            case 'alerts':
                return <AlertsPane alerts={alerts} onAlertClick={onAlertClick} onClearAll={() => setAlerts([])} />;
            case 'projects':
                return <ProjectsPane projects={projects} vendors={vendors} onViewProject={handleProjectSelection} />;
            case 'defects-analysis':
                return <DefectsPane defects={defects} projects={projects} />;
            case 'reports-dashboard':
                return <ReportsDashboardPane projects={projects} tasks={tasks} defects={defects} />;
            case 'teams':
                return <TeamsPane projects={projects} tasks={tasks} defects={defects} teamMembers={teamMembers} onItemClick={onItemClick} />;
            case 'settings':
                return <SettingsPane 
                    configurations={toolConfigs} 
                    setConfigurations={setToolConfigs} 
                    projects={projects}
                    setProjects={setProjects}
                    alertConfig={alertConfig}
                    setAlertConfig={setAlertConfig}
                />;
            case 'help':
                return <HelpPane />;
            case 'profile':
                return <UserProfilePane profile={userProfile} onSave={onUpdateProfile} />;
            default:
                return null;
        }
    };

    const title = currentPaneConfig.title;

    return (
        <div className="h-full w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl">
            <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center space-x-3 min-w-0">
                    <currentPaneConfig.Icon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    aria-label="Close pane"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="flex-1 overflow-y-auto">
                {renderPaneContent()}
            </div>
        </div>
    );
};